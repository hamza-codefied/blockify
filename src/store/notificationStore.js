/**
 * Notification Store (Zustand)
 * Manages notification state with real-time updates via Socket.io
 * 
 * Features:
 * - Stores notifications locally (fetched once on login)
 * - Receives real-time updates via socket
 * - Tracks unread count
 * - Supports pagination for loading older notifications
 */
import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
    // State
    notifications: [],
    unreadCount: 0,
    initialized: false,
    isLoading: false,
    hasMore: true,
    currentPage: 1,

    // Actions

    /**
     * Set initial notifications (called once on app load)
     */
    setInitialNotifications: (notifications, unreadCount, pagination) => {
        set({
            notifications,
            unreadCount,
            initialized: true,
            hasMore: pagination?.currentPage < pagination?.totalPages,
            currentPage: 1
        });
    },

    /**
     * Add a new notification at the top (from socket event)
     */
    addNotification: (notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
        }));
    },

    /**
     * Append older notifications (for pagination/infinite scroll)
     */
    appendNotifications: (notifications, pagination) => {
        set((state) => {
            // Avoid duplicates
            const existingIds = new Set(state.notifications.map(n => n.id));
            const newNotifications = notifications.filter(n => !existingIds.has(n.id));

            return {
                notifications: [...state.notifications, ...newNotifications],
                hasMore: pagination?.currentPage < pagination?.totalPages,
                currentPage: pagination?.currentPage || state.currentPage
            };
        });
    },

    /**
     * Mark all notifications as read (update local state)
     */
    markAllAsRead: () => {
        set((state) => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0
        }));
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: (notificationId) => {
        set((state) => {
            const notification = state.notifications.find(n => n.id === notificationId);
            const wasUnread = notification && !notification.read;

            return {
                notifications: state.notifications.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                ),
                unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
            };
        });
    },

    /**
     * Update unread count (from API response)
     */
    setUnreadCount: (count) => {
        set({ unreadCount: count });
    },

    /**
     * Set loading state
     */
    setLoading: (isLoading) => {
        set({ isLoading });
    },

    /**
     * Reset store (on logout)
     */
    reset: () => {
        set({
            notifications: [],
            unreadCount: 0,
            initialized: false,
            isLoading: false,
            hasMore: true,
            currentPage: 1
        });
    }
}));

export { useNotificationStore };
export default useNotificationStore;
