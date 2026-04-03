import { useState } from 'react';

export const useNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    const requestPermission = async () => {
        if (typeof Notification === 'undefined') return;

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            return false;
        }
    };

    const showNotification = (title: string, options?: NotificationOptions) => {
        console.log("Attempting to show notification:", title, "Permission:", permission);

        if (typeof Notification === 'undefined') {
            console.warn("Notifications not supported in this browser.");
            return;
        }

        if (permission !== 'granted') {
            console.warn("Notification permission not granted. Current state:", permission);
            return;
        }

        const defaultOptions: NotificationOptions = {
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            silent: false,
            ...options
        };

        try {
            const notif = new Notification(title, defaultOptions);
            notif.onclick = () => {
                window.focus();
                notif.close();
            };
            console.log("Notification created successfully:", notif);
            return notif;
        } catch (error) {
            console.error("Error creating notification object:", error);
        }
    };

    return {
        permission,
        requestPermission,
        showNotification
    };
};
