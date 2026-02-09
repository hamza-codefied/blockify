import { useEffect } from 'react';
import { notification } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useSocket } from '@contexts/SocketContext';

/**
 * useSessionForceEndListener - Real-time notification for force-ended sessions
 * 
 * Displays a warning notification banner to admins when a student forcefully ends their session
 * (e.g., accessibility bypass, app uninstall, force logout)
 * 
 * Uses notification instead of modal to handle multiple events gracefully
 * 
 * Usage: Call this hook once in the main Layout or dashboard component
 */
export const useSessionForceEndListener = () => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleForceEnd = (data) => {
            console.warn('[Socket] Session force-ended event received:', data);

            // Use notification instead of modal - stacks nicely for multiple events
            notification.warning({
                message: '⚠️ Session Force Ended',
                description: (
                    <div>
                        <p style={{ marginBottom: 4 }}>
                            <strong>{data.studentName || 'A student'}</strong>
                            {data.gradeName && ` (${data.gradeName})`} forcefully ended their session.
                        </p>
                        <p style={{ color: '#888', fontSize: 12, marginBottom: 0 }}>
                            {data.reason || 'Accessibility settings bypassed'}
                        </p>
                    </div>
                ),
                icon: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
                placement: 'topRight',
                duration: 8, // Auto-close after 8 seconds
                key: `force-end-${data.studentId || Date.now()}`, // Unique key prevents duplicates for same student
                style: {
                    borderLeft: '4px solid #faad14'
                }
            });
        };

        socket.on('session:force-ended', handleForceEnd);

        return () => {
            socket.off('session:force-ended', handleForceEnd);
        };
    }, [socket, isConnected]);
};

export default useSessionForceEndListener;
