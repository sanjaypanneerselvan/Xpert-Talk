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
                });
            }
        }

        await updateDoc(taskRef, updateData);

        // Notify CEO if task is updated or completed
        const task = tasks.find(t => t.id === taskId);
        if (profile?.role !== 'CEO') {
            await addDoc(collection(db, 'notifications'), {
                userId: 'CEO_UID_PLACEHOLDER',
                title: status === 'Completed' ? 'Task Completed' : 'Task Updated',
                message: `${profile?.displayName} ${status === 'Completed' ? 'completed' : 'updated'}: ${task?.title}${updateNote ? ` - ${updateNote}` : ''}`,
                link: '/tasks',
                read: false,
                timestamp: serverTimestamp(),
            });

            // Log activity
            await addDoc(collection(db, 'activity'), {
                userId: user?.uid,
                userName: profile?.displayName,
                action: status === 'Completed' ? 'task_completed' : 'task_updated',
                details: `${status === 'Completed' ? 'Completed' : 'Updated'} task: ${task?.title}${updateNote ? ` with notes: ${updateNote}` : ''}`,
                timestamp: serverTimestamp(),
            });
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

    return { tasks, loading, addTask, updateTaskStatus, uploadProof };
};
