import { useState, useEffect } from 'react';
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    serverTimestamp,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ChatMessage, UserProfile } from '../types';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';

export const useChat = (recipientId?: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const { user, profile } = useAuth();
    const { showNotification, permission } = useNotifications();

    // Fetch users for the contact list
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'users'), orderBy('displayName', 'asc'));
        const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
            const userList = snapshot.docs
                .map(doc => doc.data() as UserProfile)
                .filter(u => u.uid !== user?.uid);
            setUsers(userList);
        });
        return () => unsubscribe();
    }, [user]);

    // Fetch messages
    useEffect(() => {
        if (!user) return;

        let q;
        if (recipientId) {
            const chatId = [user.uid, recipientId].sort().join('_');
            q = query(
                collection(db, `chats/${chatId}/messages`),
                orderBy('timestamp', 'asc'),
                limit(1000)
            );
        } else {
            q = query(
                collection(db, 'group_messages'),
                orderBy('timestamp', 'asc'),
                limit(1000)
            );
        }

        const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' && !snapshot.metadata.hasPendingWrites && permission === 'granted') {
                    const msg = change.doc.data() as ChatMessage;
                    if (msg.senderId !== user.uid) {
                        showNotification(`New message from ${msg.senderName}`, {
                            body: msg.text,
                            tag: `chat-${recipientId || 'group'}-${change.doc.id}`,
                        });
                    }
                }
            });

            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                // If timestamp is null (could be local pending), fallback to current time for sorting
                // but keep it as null in data if we want to show 'Syncing' in UI
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp || null
                } as ChatMessage;
            });

            // Sort client-side to ensure no messages are lost due to pending server timestamps
            const sortedMsgs = [...msgs].sort((a, b) => {
                const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : Date.now();
                const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : Date.now();
                return timeA - timeB;
            });

            setMessages(sortedMsgs);
        }, (error) => {
            console.error("Chat sync error:", error);
        });

        return () => unsubscribe();
    }, [user, recipientId, permission]);

    const sendMessage = async (text: string) => {
        if (!user || !text.trim()) return;

        const messageData = {
            senderId: user.uid,
            senderName: profile?.displayName || user.email?.split('@')[0],
            text: text.trim(),
            timestamp: serverTimestamp(),
            readBy: [user.uid]
        };

        try {
            if (recipientId) {
                const chatId = [user.uid, recipientId].sort().join('_');
                await addDoc(collection(db, `chats/${chatId}/messages`), messageData);

                // Add to persistent notifications collection for the UI dropdown
                await addDoc(collection(db, 'notifications'), {
                    userId: recipientId,
                    title: 'New Private Message',
                    message: `${profile?.displayName}: ${text.trim().substring(0, 50)}${text.length > 50 ? '...' : ''}`,
                    link: '/chat',
                    read: false,
                    timestamp: serverTimestamp(),
                });
            } else {
                await addDoc(collection(db, 'group_messages'), messageData);

                // For group messages, notify all other users in the system
                for (const targetUser of users) {
                    if (targetUser.uid !== user.uid) {
                        await addDoc(collection(db, 'notifications'), {
                            userId: targetUser.uid,
                            title: 'Group Message',
                            message: `${profile?.displayName}: ${text.trim().substring(0, 50)}${text.length > 50 ? '...' : ''}`,
                            link: '/chat',
                            read: false,
                            timestamp: serverTimestamp(),
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return { messages, users, sendMessage };
};
