/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Card, List, Row, Col, Typography, Tag, Select, Pagination, Spin, Empty, Button, Space } from 'antd';
import { TbEye } from 'react-icons/tb';
import './early-session-requests.css';
import { useGetAllScheduleChangeRequests, useApproveScheduleChangeRequest, useDenyScheduleChangeRequest } from '@/hooks/useScheduleChangeRequests';
import { useGetGrades } from '@/hooks/useGrades';
import { formatTime } from '@/utils/time';
import { formatGradeDisplayName, getDefaultGradeQueryParams } from '@/utils/grade.utils';
import { RequestModal } from './RequestModal';
import { Typography as PageTitle } from '@/components/common/PageTitle';

const { Text } = Typography;

// Format day name
const getDayName = (dayOfWeek) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
        border: '2px solid rgba(0, 0, 0, 0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      bodyStyle={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
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

      <div className='early-session-wrapper' style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Row
          justify='space-between'
          className='early-session-header'
          style={{
            marginTop: 10,
            marginBottom: 10,
            fontWeight: 500,
            background: '#fff',
            boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
            border: '2px solid rgba(0,0,0,0.05)',
            borderRadius: 12,
            padding: '16px',
          }}
        >
          <Col flex='2'>Student</Col>
          <Col flex='2'>Change from</Col>
          <Col flex='2'>Change to</Col>
          <Col flex='1'>Status</Col>
          <Col flex='1' style={{ textAlign: 'right' }}>Action</Col>
        </Row>

        {isLoading ? (
          <div className='flex justify-center items-center py-8'>
            <Spin size='large' />
          </div>
        ) : requests.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <Empty description='No schedule change requests found' />
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <List
              dataSource={requests}
              renderItem={(request) => (
                <List.Item
                  key={request.id}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    marginBottom: 8,
                    padding: '12px 16px',
                    boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
                    border: '2px solid rgba(0,0,0,0.05)',
                  }}
                >
                  <Row align='middle' style={{ width: '100%' }}>
                    {/* Student Column */}
                    <Col flex='2'>
                      <Text strong className="text-base">
                        {request.student?.fullName || 'Unknown'}
                      </Text>
                    </Col>

                    {/* Change From */}
                    <Col flex='2'>
                      <Text className="text-base">
                        {request.fromSchedule ?
                          `${getDayName(request.fromSchedule.dayOfWeek)} ${request.fromSchedule.startTime?.substring(0, 5)} - ${request.fromSchedule.endTime?.substring(0, 5)}`
                          : 'N/A'}
                      </Text>
                    </Col>

                    {/* Change To */}
                    <Col flex='2'>
                      <Text className="text-base">
                        {request.toSchedule ?
                          `${getDayName(request.toSchedule.dayOfWeek)} ${request.toSchedule.startTime?.substring(0, 5)} - ${request.toSchedule.endTime?.substring(0, 5)}`
                          : 'N/A'}
                      </Text>
                    </Col>

                    {/* Status Column */}
                    <Col flex='1'>
                      <Tag color={getStatusColor(request.status)}>
                        {request.status?.toUpperCase()}
                      </Tag>
                    </Col>

                    {/* Action Column */}
                    <Col flex='1' style={{ textAlign: 'right' }}>
                      <TbEye
                        className='text-[#00B894] cursor-pointer w-5 h-5 hover:text-[#019a7d] transition inline-block'
                        onClick={() => handleView(request)}
                        title='View Request'
                      />
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && requests.length > 0 && pagination.totalPages > 1 && (
        <div className='flex justify-center mt-4'>
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
