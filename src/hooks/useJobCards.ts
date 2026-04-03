import { useState, useEffect } from 'react';
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import type { JobCard, JobStatus } from '../types';
import { useAuth } from './useAuth';
import { sendEmailNotification } from '../utils/mail';
import { SYSTEM_USERS } from './useAuth';

export const useJobCards = () => {
    const [tasks, setTasks] = useState<JobCard[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, profile } = useAuth();

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'tasks'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const taskList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as JobCard[];
            setTasks(taskList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addTask = async (task: Omit<JobCard, 'id' | 'createdAt' | 'updatedAt'>) => {
        await addDoc(collection(db, 'tasks'), {
            ...task,
            createdBy: user?.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Log activity
        await addDoc(collection(db, 'activity'), {
            userId: user?.uid,
            userName: profile?.displayName,
            action: 'Task Created',
            details: `Created task: ${task.title}`,
            timestamp: serverTimestamp(),
        });

        // Notify assigned user if it's not the creator
        if (task.assignedTo !== user?.uid) {
            await addDoc(collection(db, 'notifications'), {
                userId: task.assignedTo,
                title: 'New Task Assigned',
                message: `${profile?.displayName} assigned you: ${task.title}`,
                link: '/tasks',
                read: false,
                timestamp: serverTimestamp(),
            });

            // Send Email Notification
            sendEmailNotification({
                to_name: task.assignedToName,
                to_email: task.assignedTo,
                from_name: profile?.displayName || 'System',
                subject: `New Task Assigned: ${task.title}`,
                message: `${profile?.displayName} has assigned a new task to you: "${task.title}".\n\nDescription: ${task.description}`,
                link: '/tasks',
                type: 'Task'
            }).catch(err => console.error('Email failed:', err));
        }
    };

    const updateTaskStatus = async (taskId: string, status: JobStatus, updateNote?: string) => {
        const taskRef = doc(db, 'tasks', taskId);
        const updateData: any = {
            status,
            updatedAt: serverTimestamp()
        };

        if (updateNote) {
            updateData.lastUpdateNote = updateNote;
        }

        if (status === 'Completed') {
            updateData.completedAt = serverTimestamp();

            // Update productivity score for the assigned user
            const task = tasks.find(t => t.id === taskId);
            if (task?.assignedTo) {
                const userRef = doc(db, 'users', task.assignedTo);
                updateDoc(userRef, {
                    productivityScore: (profile?.productivityScore || 0) + 1
                }).catch(e => console.warn("Score update fail:", e));
            }
        }

        await updateDoc(taskRef, updateData);

        const task = tasks.find(t => t.id === taskId);

        // Notify Associated Mail IDs by Email
        const recipients = new Set<string>();
        if (task?.assignedTo) recipients.add(task.assignedTo);
        if (task?.createdBy) recipients.add(task.createdBy);

        recipients.forEach((email) => {
            if (email !== user?.email && email.includes('@')) {
                const info = SYSTEM_USERS[email];
                sendEmailNotification({
                    to_name: info?.name || email.split('@')[0],
                    to_email: email,
                    from_name: profile?.displayName || 'System',
                    subject: `📧 Task Update: ${task?.title}`,
                    message: `Status updated to: ${status}${updateNote ? `\nNote: ${updateNote}` : ''}`,
                    link: '/tasks',
                    type: 'Update'
                }).catch(err => console.error('Email failed:', err));
            }
        });

        // Log activity
        await addDoc(collection(db, 'activity'), {
            userId: user?.uid,
            userName: profile?.displayName,
            action: status === 'Completed' ? 'task_completed' : 'task_updated',
            details: `${status === 'Completed' ? 'Completed' : 'Updated'} task: ${task?.title}${updateNote ? ` with notes: ${updateNote}` : ''}`,
            timestamp: serverTimestamp(),
        });
    };

    const sendReminder = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        try {
            await sendEmailNotification({
                to_name: task.assignedToName,
                to_email: task.assignedTo,
                from_name: profile?.displayName || 'System',
                subject: `Reminder: ${task.title}`,
                message: `This is a friendly reminder for the task: "${task.title}"\n\nPlease check the progress and update the status in the Command Center.`,
                link: '/tasks',
                type: 'Reminder'
            });
            return true;
        } catch (error) {
            console.error('Failed to send reminder:', error);
            return false;
        }
    };

    const uploadProof = async (taskId: string, file: File) => {
        const storageRef = ref(storage, `proofs/${taskId}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        const type = file.type.includes('pdf') ? 'pdf' : 'image';

        await updateDoc(doc(db, 'tasks', taskId), {
            proofUrl: url,
            proofType: type,
            status: 'Completed',
            completedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    };

    return { tasks, loading, addTask, updateTaskStatus, uploadProof, sendReminder };
};
