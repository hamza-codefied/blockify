'use client';
import React, { useState } from 'react';
import {
    Card,
    List,
    Row,
    Col,
    Typography,
    Spin,
    Empty,
    Tag,
    Modal,
    Switch,
    Pagination,
    Button,
    Input,
    Form,
    Select,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { TbEdit, TbTrash, TbDeviceMobile, TbBrandApple, TbBrandAndroid } from 'react-icons/tb';
import {
    useGetAllowedApps,
    useCreateAllowedApp,
    useUpdateAllowedApp,
    useDeleteAllowedApp,
} from '@/hooks/useAllowedApps';
import { Typography as PageTitle } from '@/components/common/PageTitle';
import './allowed-apps.css';

const { Text } = Typography;
const { confirm } = Modal;

export const AllowedApps = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [search, setSearch] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [editingApp, setEditingApp] = useState(null);
    const [form] = Form.useForm();

    // Fetch allowed apps with pagination
    const {
        data: appsData,
        isLoading,
        refetch,
    } = useGetAllowedApps({
        page,
        limit,
        search: search || undefined,
    });

    const createMutation = useCreateAllowedApp();
    const updateMutation = useUpdateAllowedApp();
    const deleteMutation = useDeleteAllowedApp();

    const apps = appsData?.data?.apps || [];
    const pagination = appsData?.data?.pagination || {};

    const handleToggleStatus = async (app) => {
        try {
            await updateMutation.mutateAsync({
                appId: app.id,
                appData: { status: app.status === 'enabled' ? 'disabled' : 'enabled' },
            });
        } catch (error) {
            // Error handled by mutation hook
        }
    };

    const handleOpenCreateModal = () => {
        setEditingApp(null);
        form.resetFields();
        setOpenModal(true);
    };

    const handleEditApp = (app) => {
        setEditingApp(app);
        form.setFieldsValue({
            displayName: app.displayName,
            androidPackage: app.androidPackage,
            iosPackage: app.iosPackage,
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingApp(null);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        try {
            if (editingApp) {
                await updateMutation.mutateAsync({
                    appId: editingApp.id,
                    appData: values,
                });
            } else {
                await createMutation.mutateAsync({ ...values, status: 'disabled' });
            }
            handleCloseModal();
        } catch (error) {
            // Error handled by mutation hook
        }
    };

    const handleDeleteApp = (app) => {
        confirm({
            title: 'Remove App',
            content: `Are you sure you want to remove "${app.displayName}"? This action cannot be undone.`,
            okText: 'Remove',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk: async () => {
                try {
                    await deleteMutation.mutateAsync(app.id);
                    if (apps.length === 1 && page > 1) {
                        setPage(page - 1);
                    }
                } catch (error) {
                    // Error handled by mutation hook
                }
            },
        });
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };



    return (
        <>
            <Card
                className="allowed-apps-card w-full shadow-lg flex flex-col"
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                }}
                bodyStyle={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap',
                    }}
                >
                    <PageTitle variant="primary">Allowed Apps</PageTitle>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Input
                            placeholder="Search apps..."
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={handleSearch}
                            style={{ width: 180 }}
                            allowClear
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleOpenCreateModal}
                            style={{
                                backgroundColor: '#00B894',
                                borderColor: '#00B894',
                            }}
                            className="hover:!bg-[#00b894] hover:!border-[#00b894]"
                        >
                            Add App
                        </Button>
                    </div>
                </div>

                <div
                    className="allowed-apps-wrapper flex-1 flex flex-col"
                    style={{ marginTop: '10px' }}
                >
                    <Row
                        justify="space-between"
                        className="allowed-apps-header text-[16px] font-bold"
                    >
                        <Col flex="1">App Name</Col>
                        <Col flex="3">Packages</Col>
                        <Col flex="1" style={{ textAlign: 'center' }}>
                            Status
                        </Col>
                        <Col flex="1" style={{ textAlign: 'right' }}>
                            Actions
                        </Col>
                    </Row>

                    <div
                        className="mt-2 text-base"
                        style={{ display: 'flex', flexDirection: 'column' }}
                    >
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Spin size="large" />
                            </div>
                        ) : apps.length === 0 ? (
                            <Empty description="No apps found" className="py-8" />
                        ) : (
                            <>
                                <div>
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={apps}
                                        split={false}
                                        renderItem={(app) => (
                                            <List.Item className="allowed-apps-list-item flex items-center text-base">
                                                <Row
                                                    align="middle"
                                                    style={{ width: '100%' }}
                                                    className="text-base"
                                                >
                                                    <Col flex="1">
                                                        <div className="flex flex-col gap-1">
                                                            <Text strong className="text-base">
                                                                {app.displayName}
                                                            </Text>
                                                        </div>
                                                    </Col>
                                                    <Col flex="3">
                                                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                                                            {app.androidPackage && (
                                                                <div className="flex items-center gap-1">
                                                                    <TbBrandAndroid className="w-4 h-4 text-green-500" />
                                                                    <Text type="secondary" className="text-xs" style={{ fontSize: '11px' }}>
                                                                        {app.androidPackage}
                                                                    </Text>
                                                                </div>
                                                            )}
                                                            {app.iosPackage && (
                                                                <div className="flex items-center gap-1">
                                                                    <TbBrandApple className="w-4 h-4" />
                                                                    <Text type="secondary" className="text-xs" style={{ fontSize: '11px' }}>
                                                                        {app.iosPackage}
                                                                    </Text>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Col>
                                                    <Col flex="1" style={{ textAlign: 'center' }}>
                                                        <Switch
                                                            checked={app.status === 'enabled'}
                                                            onChange={() => handleToggleStatus(app)}
                                                            loading={updateMutation.isPending}
                                                            checkedChildren="On"
                                                            unCheckedChildren="Off"
                                                        />
                                                    </Col>
                                                    <Col flex="1" style={{ textAlign: 'right' }}>
                                                        <div className="flex items-center justify-end gap-3">
                                                            <TbEdit
                                                                className="text-[#00B894] cursor-pointer w-5 h-5 hover:text-[#019a7d] transition"
                                                                onClick={() => handleEditApp(app)}
                                                                title="Edit app"
                                                            />
                                                            <TbTrash
                                                                className="text-red-500 cursor-pointer w-5 h-5 hover:text-red-700 transition"
                                                                onClick={() => handleDeleteApp(app)}
                                                                title="Remove app"
                                                            />
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                                {pagination.totalPages > 1 && (
                                    <div className="flex justify-center mt-4">
                                        <Pagination
                                            current={page}
                                            total={pagination.totalDocs}
                                            pageSize={limit}
                                            onChange={handlePageChange}
                                            showSizeChanger={false}
                                            size="small"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </Card>

            {/* Create/Edit App Modal */}
            <Modal
                title={editingApp ? 'Edit App' : 'Add New App'}
                open={openModal}
                onCancel={handleCloseModal}
                footer={null}
                centered
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ marginTop: '16px' }}
                >
                    <Form.Item
                        name="displayName"
                        label="Display Name"
                        rules={[{ required: true, message: 'Please enter the app name' }]}
                    >
                        <Input placeholder="e.g., Google Docs" />
                    </Form.Item>

                    <Form.Item
                        name="androidPackage"
                        label={
                            <span className="flex items-center gap-1">
                                <TbBrandAndroid className="text-green-500" /> Android Package
                            </span>
                        }
                    >
                        <Input placeholder="e.g., com.google.android.apps.docs" />
                    </Form.Item>

                    <Form.Item
                        name="iosPackage"
                        label={
                            <span className="flex items-center gap-1">
                                <TbBrandApple /> iOS Bundle ID
                            </span>
                        }
                    >
                        <Input placeholder="e.g., com.google.Docs" />
                    </Form.Item>



                    <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                        <div className="flex justify-end gap-2">
                            <Button onClick={handleCloseModal}>Cancel</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={createMutation.isPending || updateMutation.isPending}
                                style={{
                                    backgroundColor: '#00B894',
                                    borderColor: '#00B894',
                                }}
                            >
                                {editingApp ? 'Save Changes' : 'Add App'}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
