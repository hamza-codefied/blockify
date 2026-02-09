/**
 * useNotificationListener - Real-time notification handler
 * 
 * Listens for socket events and:
 * - Adds new notifications to store
 * - Shows browser notifications
 * - Plays notification sound
 * 
 * Usage: Call this hook once in Layout.jsx
 */
import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@contexts/SocketContext';
import { useNotificationStore } from '@/store/notificationStore';

// Notification sound path (relative to public folder)
const NOTIFICATION_SOUND_PATH = '/definite-555.mp3';

/**
 * Request browser notification permission
 */
const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.warn('[Notifications] Browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

/**
 * Show browser notification
 */
const showBrowserNotification = (title, message, options = {}) => {
    if (Notification.permission !== 'granted') {
        return null;
    }

    try {
        const notification = new Notification(title, {
            body: message,
            icon: '/favicon.ico', // You can customize this
            badge: '/favicon.ico',
            tag: options.tag || `notification-${Date.now()}`,
            requireInteraction: false,
            silent: true, // We play our own sound
            ...options
        });

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        // Handle click
        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return notification;
    } catch (error) {
        console.error('[Notifications] Failed to show browser notification:', error);
        return null;
    }
};

/**
 * Play notification sound
 */
const playNotificationSound = (audioRef) => {
    if (!audioRef.current) {
        audioRef.current = new Audio(NOTIFICATION_SOUND_PATH);
        audioRef.current.volume = 0.5; // 50% volume
    }

    // Reset and play
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((error) => {
        // Autoplay might be blocked by browser
        console.warn('[Notifications] Could not play sound:', error.message);
    });
};

/**
 * Hook to listen for real-time notifications
 */
export const useNotificationListener = () => {
    const { socket, isConnected } = useSocket();
    const addNotification = useNotificationStore((state) => state.addNotification);
    const audioRef = useRef(null);
    const permissionRequested = useRef(false);

    // Request notification permission on mount
    useEffect(() => {
        if (!permissionRequested.current) {
            permissionRequested.current = true;
            requestNotificationPermission().then((granted) => {
                console.log('[Notifications] Permission:', granted ? 'granted' : 'denied');
            });
        }

        // Preload audio
        if (!audioRef.current) {
            audioRef.current = new Audio(NOTIFICATION_SOUND_PATH);
            audioRef.current.load();
        }
    }, []);

    // Handle new notification event
    const handleNewNotification = useCallback((data) => {
        console.log('[Notifications] Received new notification:', data);

        // Add to store
        addNotification({
            id: data.id,
            title: data.title,
            message: data.message,
            type: data.type || 'info',
            read: false,
            createdAt: data.createdAt || new Date().toISOString()
        });

        // Show browser notification
        showBrowserNotification(data.title, data.message, {
            tag: `notification-${data.id}`
        });

        // Play sound
        playNotificationSound(audioRef);
    }, [addNotification]);

    // Listen for notification:new events
    useEffect(() => {
        if (!socket || !isConnected) {
            return;
        }

        console.log('[Notifications] Setting up notification listener');
        socket.on('notification:new', handleNewNotification);

        return () => {
            socket.off('notification:new', handleNewNotification);
        };
    }, [socket, isConnected, handleNewNotification]);
};

export default useNotificationListener;
