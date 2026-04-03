import { useState, useEffect } from 'react';
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    orderBy,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Project } from '../types';
import { useAuth } from './useAuth';

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, profile } = useAuth();

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'projects'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Project[];
            setProjects(projectList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'ownerName'>) => {
        if (!user || !profile) {
            console.error('Project creation failed: User/Profile not found');
            return;
        }

        try {
            await addDoc(collection(db, 'projects'), {
                ...project,
                ownerId: user.uid,
                ownerName: profile.displayName,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Log activity
            await addDoc(collection(db, 'activity'), {
                userId: user.uid,
                userName: profile.displayName,
                action: 'Project Created',
                details: `Created project: ${project.title}`,
                timestamp: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error adding project:', error);
            throw error;
        }
    };

    const updateProject = async (projectId: string, updates: Partial<Project>) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });

            // Log activity
            await addDoc(collection(db, 'activity'), {
                userId: user?.uid,
                userName: profile?.displayName,
                action: 'Project Updated',
                details: `Updated project: ${updates.title || projectId}`,
                timestamp: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    };

    const deleteProject = async (projectId: string) => {
        await deleteDoc(doc(db, 'projects', projectId));
    };

    return { projects, loading, addProject, updateProject, deleteProject };
};
