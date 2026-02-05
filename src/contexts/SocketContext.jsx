import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * SocketContext - Manages Socket.io connection with JWT authentication
 * 
 * Features:
 * - Auto-connects when user is authenticated
 * - Auto-disconnects on logout
 * - Reconnects on token refresh
 * - Provides socket instance to all child components
 */

const SocketContext = createContext(null);

// Use same logic as api.config.js for base URL
const isProduction = import.meta.env.MODE === 'production' || import.meta.env.PROD;
const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Extract socket URL (root, without /api/v1)
const getSocketUrl = () => {
    if (envBaseUrl && (envBaseUrl.startsWith('http://') || envBaseUrl.startsWith('https://'))) {
        // Remove /api/v1 suffix if present
        return envBaseUrl.replace(/\/api\/v1\/?$/, '');
    }
    // Default to localhost in development
    return isProduction ? '' : 'http://localhost:5004';
};

const SOCKET_URL = getSocketUrl();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    useEffect(() => {
        console.log('[Socket] SocketProvider mounted, URL:', SOCKET_URL);

        // Token is stored in Zustand's persisted 'auth-storage' key as: { state: { token: '...' }, version: 0 }
        let token = null;
        try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
                const parsed = JSON.parse(authStorage);
                token = parsed?.state?.token || null;
            }
        } catch (e) {
            console.error('[Socket] Failed to parse auth-storage:', e);
        }

        console.log('[Socket] Token found:', !!token);

        if (!token) {
            console.log('[Socket] No token, skipping connection');
            // No token, ensure socket is disconnected
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        console.log('[Socket] Attempting connection to:', SOCKET_URL);

        // Create socket connection with authentication
        const socketInstance = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });

        // Connection established
        socketInstance.on('connect', () => {
            console.log('[Socket] Connected:', socketInstance.id);
            setIsConnected(true);
            reconnectAttempts.current = 0;
        });

        // Connection lost
        socketInstance.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
            setIsConnected(false);
        });

        // Connection error
        socketInstance.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
            reconnectAttempts.current += 1;

            // If auth error, don't keep retrying
            if (error.message.includes('authentication') || error.message.includes('token')) {
                console.warn('[Socket] Auth error, stopping reconnection');
                socketInstance.disconnect();
            }
        });

        // Server acknowledgment
        socketInstance.on('authenticated', (data) => {
            console.log('[Socket] Authenticated:', data);
        });

        setSocket(socketInstance);

        // Cleanup on unmount or token change
        return () => {
            console.log('[Socket] Cleaning up connection');
            socketInstance.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, []); // Run once on mount - token is checked inside

    const value = {
        socket,
        isConnected,
        // Utility to manually reconnect (e.g., after token refresh)
        reconnect: () => {
            if (socket) {
                socket.disconnect();
                socket.connect();
            }
        }
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export default SocketContext;
