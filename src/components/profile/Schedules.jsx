'use client';
import React, { useState } from 'react';
import {
    Card,
    List,
    Row,
    Col,
    Typography,
    Tag,
    Space,
    Spin,
    Empty,
    Pagination,
    Button,
    Select,
    Input
} from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { TbEdit } from 'react-icons/tb';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useGetSchedules, useDeleteSchedule } from '@/hooks/useSchedules';
import { ScheduleModal } from './ScheduleModal';
import { DeleteConfirmModal } from '@/components/userManagement/DeleteConfirmModal';
import { Typography as PageTitle } from '@/components/common/PageTitle';

const { Text } = Typography;
const { Option } = Select;

export const Schedules = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // all, grade, custom

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);

    // Fetch schedules
    const queryParams = {
        page,
        limit,
        sort: 'created_at',
        sortOrder: 'DESC',
        ...(search && { search }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
    };

    const {
        data: schedulesData,
        isLoading,
        refetch
    } = useGetSchedules(queryParams);

    const schedules = schedulesData?.data || [];
    const pagination = schedulesData?.pagination || {};
    const deleteScheduleMutation = useDeleteSchedule();

    const handleAddClick = () => {
        setModalMode('add');
        setSelectedSchedule(null);
        setModalOpen(true);
    };

    const handleEditClick = (schedule) => {
        setModalMode('edit');
        setSelectedSchedule(schedule);
        setModalOpen(true);
    };

    const handleDeleteClick = (schedule) => {
        setScheduleToDelete(schedule);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (scheduleToDelete) {
            try {
                await deleteScheduleMutation.mutateAsync(scheduleToDelete.id);
                setDeleteModalOpen(false);
                setScheduleToDelete(null);
                refetch();
                if (schedules.length === 1 && page > 1) {
                    setPage(page - 1);
                }
            } catch (error) {
                // Error handled by hook
            }
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <>
            <Card
                className='schedules-card border-2 border-gray-200 w-full shadow-lg flex flex-col'
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100%',
                }}
                bodyStyle={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                }}
            >
                {/* Header & Controls */}
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <PageTitle variant='primary' className="!mb-0">Schedules</PageTitle>
                        <Button
                            type='primary'
                            icon={<PlusOutlined />}
                            onClick={handleAddClick}
                            style={{ backgroundColor: '#00B894', borderColor: '#00B894' }}
                            className='hover:!bg-[#00b894] hover:!border-[#00b894]'
                        >
                            Add Schedule
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder='Search schedules...'
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: 200 }}
                            allowClear
                        />
                        <Select
                            value={typeFilter}
                            onChange={setTypeFilter}
                            style={{ width: 140 }}
                        >
                            <Option value="all">All Types</Option>
                            <Option value="grade">Grade</Option>
                            <Option value="custom">Custom</Option>
                        </Select>
                    </div>
                </div>

                {/* Content */}
                <div className='flex-1 flex flex-col'>

                    <Row justify='space-between' className='font-semibold mb-2 px-2 text-gray-500'>
                        <Col flex="2">Name & Description</Col>
                        <Col flex="1">Type</Col>
                        <Col flex="1">Time</Col>
                        <Col flex="1" style={{ textAlign: 'right' }}>Action</Col>
                    </Row>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className='flex justify-center items-center py-8'>
                                <Spin size='large' />
                            </div>
                        ) : schedules.length === 0 ? (
                            <Empty description='No schedules found' className='py-8' />
                        ) : (
                            <List
                                itemLayout='horizontal'
                                dataSource={schedules}
                                renderItem={item => (
                                    <List.Item className='border-b border-gray-100 hover:bg-gray-50 px-2 py-3'>
                                        <Row align="middle" style={{ width: '100%' }}>
                                            <Col flex="2">
                                                <div className="flex flex-col">
                                                    <Text strong>{item.name}</Text>
                                                    {item.description && <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>}
                                                    {item.grade && <Tag color="blue" className="w-fit mt-1">{item.grade.gradeName}</Tag>}
                                                </div>
                                            </Col>
                                            <Col flex="1">
                                                <Tag color={item.type === 'grade' ? 'purple' : 'orange'}>
                                                    {item.type === 'grade' ? 'Grade' : 'Custom'}
                                                </Tag>
                                            </Col>
                                            <Col flex="1">
                                                <div className="flex flex-col text-sm">
                                                    <Text>{days[item.dayOfWeek]}</Text>
                                                    <Text type="secondary">{item.startTime?.slice(0, 5)} - {item.endTime?.slice(0, 5)}</Text>
                                                </div>
                                            </Col>
                                            <Col flex="1" className="flex justify-end gap-3">
                                                <TbEdit
                                                    size={18}
                                                    color='#00B894'
                                                    className='cursor-pointer'
                                                    onClick={() => handleEditClick(item)}
                                                />
                                                <RiDeleteBinLine
                                                    size={18}
                                                    color='#801818'
                                                    className='cursor-pointer'
                                                    onClick={() => handleDeleteClick(item)}
                                                />
                                            </Col>
                                        </Row>
                                    </List.Item>
                                )}
                            />
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                            <Pagination
                                current={page}
                                total={pagination.total}
                                pageSize={limit}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                                size='small'
                            />
                        </div>
                    )}
                </div>

            </Card>

            <ScheduleModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                mode={modalMode}
                scheduleData={selectedSchedule}
                onSuccess={() => {
                    setModalOpen(false);
                    refetch();
                }}
            />

            <DeleteConfirmModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title='Delete Schedule'
                message={`Are you sure you want to delete "${scheduleToDelete?.name}"? This action cannot be undone.`}
                loading={deleteScheduleMutation.isPending}
            />
        </>
    );
};
