import { useEffect } from 'react';
import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useSocket } from '@contexts/SocketContext';

/**
 * useSessionForceEndListener - Real-time notification for force-ended sessions
 * 
 * Displays a warning modal to admins when a student forcefully ends their session
 * (e.g., accessibility bypass, app uninstall, force logout)
 * 
 * Usage: Call this hook once in the main Layout or dashboard component
 */
export const useSessionForceEndListener = () => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleForceEnd = (data) => {
            console.warn('[Socket] Session force-ended event received:', data);

            Modal.warning({
                title: '⚠️ Session Force Ended',
                icon: <ExclamationCircleFilled style={{ color: '#ff4d4f' }} />,
                content: (
                    <div>
                        <p style={{ marginBottom: 8 }}>
                            <strong>{data.studentName || 'A student'}</strong>
                            {data.gradeName && ` (${data.gradeName})`} forcefully ended their session.
                        </p>
                        <p style={{ color: '#888', fontSize: 12, marginBottom: 0 }}>
                            {data.reason || 'Accessibility settings bypassed'}
                        </p>
                        <p style={{ color: '#aaa', fontSize: 11, marginTop: 8, marginBottom: 0 }}>
                            {new Date(data.timestamp).toLocaleTimeString()}
                        </p>
                    </div>
                ),
                okText: 'Dismiss',
                centered: true,
                maskClosable: true,
                className: 'force-end-warning-modal'
            });
        };

        socket.on('session:force-ended', handleForceEnd);

        return () => {
            socket.off('session:force-ended', handleForceEnd);
        };
    }, [socket, isConnected]);
};

export default useSessionForceEndListener;
