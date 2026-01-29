import React, { useState } from 'react';
import { Card, List, Row, Col, Avatar, Typography, Tag, Select, Pagination, Spin, Empty } from 'antd';
import './early-session-requests.css';
import { RequestModal } from './RequestModal';
import { useGetRequests } from '@/hooks/useRequests';
import { useGetGrades } from '@/hooks/useGrades';
import { formatTime } from '@/utils/time';
import { formatGradeDisplayName, getDefaultGradeQueryParams } from '@/utils/grade.utils';
import { Typography as PageTitle } from '@/components/common/PageTitle';

const { Text } = Typography;

// Generate avatar URL from name (for consistent avatars)
const getAvatarUrl = (name) => {
  if (!name) return null;
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://i.pravatar.cc/40?img=${(hash % 70) + 1}`;
};

export const EarlySessionRequests = ({ sessionType = 'grade' }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [gradeId, setGradeId] = useState(null);

  // Fetch grades for filter dropdown (only for grade sessions)
  const { data: gradesData } = useGetGrades(
    sessionType === 'grade'
      ? { page: 1, limit: 100, ...getDefaultGradeQueryParams() }
      : {}
  );
  const grades = sessionType === 'grade' ? (gradesData?.data || []) : [];

  // Fetch requests with filters
  // Hardcoded: requestType='early-end', status='pending', date=current (handled by backend)
  const { data: requestsData, isLoading, refetch } = useGetRequests({
    requestType: 'early-end',
    status: 'pending',
    gradeId: gradeId || undefined,
    sessionType: sessionType, // 'grade' or 'customGroup'
    page,
    limit,
    sort: 'created_at',
    sortOrder: 'DESC',
  });

  const requests = requestsData?.data?.requests || [];
  const pagination = requestsData?.data?.pagination || {};

  const handleView = (req) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    refetch(); // Refresh list after modal closes (in case request was approved/denied)
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleGradeFilterChange = (value) => {
    setGradeId(value);
    setPage(1); // Reset to first page when filter changes
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
      <div className='flex justify-between items-center mb-4'>
        <PageTitle variant='primary'>Early Session End Requests</PageTitle>
        {sessionType === 'grade' && (
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
        )}
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
          <Col flex='2'>Name</Col>
          <Col flex='1'>Grade</Col>
          <Col flex='1'>Time</Col>
          <Col flex='1'>Action</Col>
        </Row>

        {isLoading ? (
          <div className='flex justify-center items-center py-8'>
            <Spin size='large' />
          </div>
        ) : requests.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <Empty description='No pending early session end requests' />
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <List
              itemLayout='horizontal'
              dataSource={requests}
              renderItem={req => {
                const studentName = req.student?.fullName || 'Unknown';
                const studentGrade = req.student?.grade;
                const gradeName = studentGrade ? formatGradeDisplayName(studentGrade) : 'N/A';
                const scheduleEndTime = req.session?.schedule?.endTime;
                const formattedTime = scheduleEndTime ? formatTime(scheduleEndTime) : 'N/A';

                return (
                  <List.Item
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
                      <Col flex='2'>
                        <div className='flex items-center gap-2'>
                          <Avatar src={getAvatarUrl(studentName)} size={40} />
                          <Text>{studentName}</Text>
                        </div>
                      </Col>
                      <Col flex='1'>
                        <Text>{gradeName}</Text>
                      </Col>
                      <Col flex='1'>
                        <Tag
                          color='cyan'
                          style={{
                            borderRadius: 12,
                            fontWeight: 500,
                            padding: '2px 10px',
                          }}
                        >
                          {formattedTime}
                        </Tag>
                      </Col>
                      <Col flex='1'>
                        <button
                          className='view-request-btn'
                          onClick={() => handleView(req)}
                        >
                          View Request
                        </button>
                      </Col>
                    </Row>
                  </List.Item>
                );
              }}
            />
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && requests.length > 0 && (
        <Row justify='space-between' align='middle' style={{ marginTop: 16 }}>
          <Col>
            <Text type='secondary' style={{ fontSize: 12 }}>
              {pagination.total
                ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, pagination.total)} of ${pagination.total}`
                : 'No requests'}
            </Text>
          </Col>
          {pagination.totalPages > 1 && (
            <Col>
              <Pagination
                current={page}
                total={pagination.total}
                pageSize={limit}
                onChange={handlePageChange}
                showSizeChanger={false}
                size='small'
              />
            </Col>
          )}
        </Row>
      )}

      {/* Modal render */}
      <RequestModal
        open={isModalOpen}
        onClose={handleClose}
        request={selectedRequest}
      />
    </Card>
  );
};
