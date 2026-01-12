import { debounce } from 'lodash';
import {
    Card,
    List,
    Button,
    Tag,
    Typography,
    Space,
    Tabs,
    message,
    Badge,
    Popconfirm,
    Empty
} from 'antd';
import {
    DeleteOutlined,
    InboxOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import API from '@services/api.service';
import { useAuthStore } from '@stores/useAuthStore';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Typography as PageTitle } from '@/components/common/PageTitle';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const Notifications = () => {
    const [tab, setTab] = useState('all');
    const { isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = debounce(useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/notification/get');
            setNotifications(res.data?.notifications || []);
        } catch {
            // message.error('Failed to fetch notifications');
            console.log('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]), 500);

    useEffect(() => {
        fetchNotifications();
        return () => fetchNotifications.cancel();
    }, [isAuthenticated]);

    const markAsRead = async () => {
        try {
            await API.patch(`/notification/mark-as-read`, {});
            fetchNotifications();
        } catch (error) {
            message.error(error.response?.data?.error || 'Update failed', 5);
        }
    };

    const archiveNotification = async (id) => {
        try {
            const res = await API.patch(`/notification/archive/${id}`, {});
            message.success(res.data?.message || 'Archived successfully', 5);
            fetchNotifications();
        } catch (error) {
            message.error(error.response?.data?.error || 'Update failed', 5);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const res = await API.delete(`/notification/delete/${id}`);
            message.success(res.data?.message || 'Deleted successfully', 5);
            fetchNotifications();
        } catch (error) {
            message.error(error.response?.data?.error || 'Update failed', 5);
        }
    };

    const filteredList = notifications.filter((n) => {
        if (tab === 'unread') return n.status === 'unread';
        if (tab === 'archived') return n.status === 'archived';
        return true;
    });

    /**
     * call markAsRead method when component mounts, memoize it so it doesn't re-render on every render, 
     * but we should watch the user, if the user is currently on this page - call markAsRead after an interval
     */
    const markAsReadMemo = useMemo(() => markAsRead, [isAuthenticated]);
    useEffect(() => {
        markAsReadMemo();
    }, [markAsReadMemo]);

    return (
        <>
            <div className="flex items-center justify-between py-8">
                <PageTitle variant="primary">Notifications</PageTitle>
                <Button icon={<ReloadOutlined />} onClick={() => fetchNotifications()}>
                    Refresh
                </Button>
            </div>
            <Card style={{ marginTop: 12 }}>
                <Tabs activeKey={tab} onChange={setTab}>
                    <TabPane key="all" tab="All" />
                    <TabPane 
                        key="unread" 
                        tab={notifications.filter((n) => n.status === 'unread').length > 0 ? <Badge count={notifications.filter((n) => n.status === 'unread').length} /> : 'Unread'} 
                    />
                    <TabPane key="archived" tab="Archived" />
                </Tabs>

                <List
                    dataSource={filteredList}
                    loading={loading}
                    locale={{ emptyText: <Empty description="No notifications" /> }}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                item.status !== 'archived' ? (
                                    <Button
                                        type="link"
                                        icon={<InboxOutlined />}
                                        onClick={() => archiveNotification(item._id)}
                                    >
                                        Archive
                                    </Button>
                                ) : (
                                    <Text type="secondary">Archived</Text>
                                ),
                                <Popconfirm
                                    title="Delete this notification?"
                                    description={
                                        <div className="flex flex-col">
                                            <p>Are you sure you want to delete this client?</p>
                                            <span className="text-red-500">This action cannot be undone</span>
                                        </div>
                                    }
                                    onConfirm={() => deleteNotification(item._id)}
                                >
                                    <Button color="danger" variant="outlined" icon={<DeleteOutlined />}>
                                        Delete
                                    </Button>
                                </Popconfirm>
                            ].filter(Boolean)}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                        <Text strong>{item.type}</Text>
                                        {item.status === 'unread' && <Tag color="red">New</Tag>}
                                    </Space>
                                }
                                description={
                                    <>
                                        <div>{item.content?.message}</div>
                                        <Text style={{ fontSize: 12 }} type="secondary">{new Date(item.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</Text>
                                    </>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </>
    );
};

export default Notifications;