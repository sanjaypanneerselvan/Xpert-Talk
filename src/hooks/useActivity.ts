import { useState, useEffect } from 'react';
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    limit,
    updateDoc,
    doc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ActivityLog, Notification } from '../types';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';

export const useActivity = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useAuth();
    const { showNotification, permission } = useNotifications();

    useEffect(() => {
        const qLogs = query(collection(db, 'activity'), orderBy('timestamp', 'desc'), limit(50));
        const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
            setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ActivityLog[]);
        });

        if (user) {
            // Remove 'where' to avoid composite index requirement for now
            const qNotifs = query(
                collection(db, 'notifications'),
                orderBy('timestamp', 'desc'),
                limit(100) // Limit to avoid over-fetching
            );

            const unsubscribeNotifs = onSnapshot(qNotifs, (snapshot) => {
                const allNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notification[];

                // Filter client-side for the current user
                const userNotifs = allNotifs.filter(n => n.userId === user.uid);

                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' && !snapshot.metadata.hasPendingWrites && permission === 'granted') {
                        const notif = change.doc.data() as Notification;
                        if (notif.userId === user.uid) {
                            showNotification(notif.title, {
                                body: notif.message,
                                tag: change.doc.id,
                            });
                        }
                    }
                });

                setNotifications(userNotifs);
            }, (error) => {
                console.error("Notifications sync error:", error);
            });

            return () => {
                unsubscribeLogs();
                unsubscribeNotifs();
            };
        }

        return () => unsubscribeLogs();
    }, [user, permission]);

    const markAsRead = async (notificationId: string) => {
        await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    };

    return { logs, notifications, markAsRead };
};
