import React, { useState } from 'react';
import { Card, List, Row, Col, Avatar, Typography, Tag, Select, Pagination, Spin, Empty, Button, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import './early-session-requests.css';
import { useGetAllScheduleChangeRequests, useApproveScheduleChangeRequest, useDenyScheduleChangeRequest } from '@/hooks/useScheduleChangeRequests';
import { useGetGrades } from '@/hooks/useGrades';
import { formatTime } from '@/utils/time';
import { formatGradeDisplayName, getDefaultGradeQueryParams } from '@/utils/grade.utils';
import { RequestModal } from './RequestModal';
import { Typography as PageTitle } from '@/components/common/PageTitle';

const { Text } = Typography;

// Generate avatar URL from name (for consistent avatars)
const getAvatarUrl = (name) => {
  if (!name) return null;
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://i.pravatar.cc/40?img=${(hash % 70) + 1}`;
};

// Format day name
const getDayName = (dayOfWeek) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[dayOfWeek] || `Day ${dayOfWeek}`;
};

export const ScheduleChangeRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [gradeId, setGradeId] = useState(null);
  const [status, setStatus] = useState('pending');

  // Fetch grades for filter dropdown
  const { data: gradesData } = useGetGrades({ 
    page: 1, 
    limit: 100, 
    ...getDefaultGradeQueryParams() 
  });
  const grades = gradesData?.data || [];

  // Fetch schedule change requests with filters
  const { data: requestsData, isLoading, refetch } = useGetAllScheduleChangeRequests({
    page,
    limit,
    status: status || undefined,
    gradeId: gradeId || undefined,
    sort: 'created_at',
    sortOrder: 'DESC',
  });

  const approveMutation = useApproveScheduleChangeRequest();
  const denyMutation = useDenyScheduleChangeRequest();

  const requests = requestsData?.data?.requests || [];
  const pagination = requestsData?.data?.pagination || {};

  const handleView = (req) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    refetch(); // Refresh list after modal closes
  };

  const handleApprove = async (requestId) => {
    try {
      await approveMutation.mutateAsync({ requestId, data: {} });
      refetch();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleDeny = async (requestId) => {
    try {
      await denyMutation.mutateAsync({ requestId, data: {} });
      refetch();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleGradeFilterChange = (value) => {
    setGradeId(value);
    setPage(1); // Reset to first page when filter changes
  };

  const handleStatusFilterChange = (value) => {
    setStatus(value);
    setPage(1); // Reset to first page when filter changes
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'approved':
        return 'green';
      case 'denied':
        return 'red';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Card
      variant='outlined'
      style={{
        borderRadius: 12,
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      }}
    >
      <div className='flex justify-between items-center mb-4 flex-wrap gap-2'>
        <PageTitle variant='primary'>Schedule Change Requests</PageTitle>
        <Space>
          <Select
            placeholder='Filter by Status'
            allowClear
            value={status}
            onChange={handleStatusFilterChange}
            style={{ width: 150 }}
            options={[
              { label: 'All', value: null },
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Denied', value: 'denied' },
              { label: 'Cancelled', value: 'cancelled' },
            ]}
          />
          <Select
            placeholder='Filter by Grade'
            allowClear
            value={gradeId}
            onChange={handleGradeFilterChange}
            style={{ width: 200 }}
            options={[
              { label: 'All Grades', value: null },
              ...grades.map(grade => ({
                label: formatGradeDisplayName(grade),
                value: grade.id,
              })),
            ]}
          />
        </Space>
      </div>

      <div className='early-session-wrapper'>
        {isLoading ? (
          <div className='flex justify-center items-center py-8'>
            <Spin size='large' />
          </div>
        ) : requests.length === 0 ? (
          <Empty description='No schedule change requests found' />
        ) : (
          <>
            <List
              dataSource={requests}
              renderItem={(request) => (
                <List.Item
                  key={request.id}
                  className='early-session-item'
                  actions={[
                    request.status === 'pending' && (
                      <Space key="actions">
                        <Button
                          type='primary'
                          icon={<CheckOutlined />}
                          size='small'
                          onClick={() => handleApprove(request.id)}
                          loading={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          danger
                          icon={<CloseOutlined />}
                          size='small'
                          onClick={() => handleDeny(request.id)}
                          loading={denyMutation.isPending}
                        >
                          Deny
                        </Button>
                      </Space>
                    ),
                    <Button
                      key="view"
                      type='link'
                      onClick={() => handleView(request)}
                    >
                      View Details
                    </Button>,
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={getAvatarUrl(request.student?.fullName)}
                        size={40}
                      >
                        {request.student?.fullName?.charAt(0) || 'S'}
                      </Avatar>
                    }
                    title={
                      <div className='flex items-center gap-2'>
                        <Text strong>{request.student?.fullName || 'Unknown Student'}</Text>
                        <Tag color={getStatusColor(request.status)}>
                          {request.status?.toUpperCase()}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div className='text-sm text-gray-600 mb-1'>
                          <Text type='secondary'>From: </Text>
                          {request.fromSchedule?.name || 'Unknown'} - {getDayName(request.fromSchedule?.dayOfWeek)} {request.fromSchedule?.startTime} - {request.fromSchedule?.endTime}
                        </div>
                        <div className='text-sm text-gray-600 mb-1'>
                          <Text type='secondary'>To: </Text>
                          {request.toSchedule?.name || 'Unknown'} - {getDayName(request.toSchedule?.dayOfWeek)} {request.toSchedule?.startTime} - {request.toSchedule?.endTime}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {request.student?.grade && (
                            <Tag size='small'>{formatGradeDisplayName(request.student.grade)}</Tag>
                          )}
                          <Text type='secondary' className='ml-2'>
                            {formatTime(request.createdAt)}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            {pagination.totalPages > 1 && (
              <div className='flex justify-center mt-4'>
                <Pagination
                  current={page}
                  total={pagination.total}
                  pageSize={limit}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && selectedRequest && (
        <RequestModal
          open={isModalOpen}
          onClose={handleClose}
          request={selectedRequest}
          requestType='schedule-change'
        />
      )}
    </Card>
  );
};

