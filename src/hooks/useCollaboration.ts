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
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Idea, MoM, Comment } from '../types';
import { useAuth, SYSTEM_USERS } from './useAuth';
import { sendEmailNotification } from '../utils/mail';

export const useCollaboration = () => {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [moms, setMoms] = useState<MoM[]>([]);
    const { user, profile } = useAuth();

    useEffect(() => {
        const qIdeas = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));
        const unsubscribeIdeas = onSnapshot(qIdeas, (snapshot) => {
            setIdeas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Idea[]);
        });

        const qMoms = query(collection(db, 'moms'), orderBy('date', 'desc'));
        const unsubscribeMoms = onSnapshot(qMoms, (snapshot) => {
            setMoms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MoM[]);
        });

        return () => {
            unsubscribeIdeas();
            unsubscribeMoms();
        };
    }, []);

    const addIdea = async (title: string, content: string) => {
        await addDoc(collection(db, 'ideas'), {
            title,
            content,
            authorId: user?.uid,
            authorName: profile?.displayName,
            likes: [],
            comments: [],
            createdAt: serverTimestamp(),
        });

        // Notify Associated Mail IDs about New Idea (Management)
        const managementEmails = Object.entries(SYSTEM_USERS)
            .filter(([_, info]) => info.role === 'CEO' || info.role === 'Co-Founder')
            .map(([email]) => email);

        managementEmails.forEach((email) => {
            if (email !== user?.email) {
                const info = SYSTEM_USERS[email];
                sendEmailNotification({
                    to_name: info.name,
                    to_email: email,
                    from_name: profile?.displayName || 'System',
                    subject: `New Idea Posted: ${title}`,
                    message: `${profile?.displayName} has posted a new idea: "${title}".\n\nContent: ${content}`,
                    link: '/ideas',
                    type: 'Idea'
                }).catch(err => console.error('Email failed:', err));
            }
        });
    };

    const toggleLike = async (ideaId: string, isLiked: boolean) => {
        const ideaRef = doc(db, 'ideas', ideaId);
        await updateDoc(ideaRef, {
            likes: isLiked ? arrayRemove(user?.uid) : arrayUnion(user?.uid)
        });
    };

    const addComment = async (ideaId: string, text: string) => {
        const ideaRef = doc(db, 'ideas', ideaId);
        const comment: Omit<Comment, 'id'> = {
            authorId: user?.uid!,
            authorName: profile?.displayName!,
            text,
            createdAt: new Date().toISOString(), // Simpler for sub-objects
        };
        await updateDoc(ideaRef, {
            comments: arrayUnion({ ...comment, id: Math.random().toString(36).substr(2, 9) })
        });
    };

    const addMoM = async (title: string, content: string, date: string, tags: string[]) => {
        await addDoc(collection(db, 'moms'), {
            title,
            content,
            date,
            tags,
            authorId: user?.uid,
            authorName: profile?.displayName,
            createdAt: serverTimestamp(),
        });
    };

    return { ideas, moms, addIdea, toggleLike, addComment, addMoM };
};
