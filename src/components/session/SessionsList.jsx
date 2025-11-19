'use client';
import React, { useState, useMemo } from 'react';
import { Card, Table, Tag, Button, Select, Input, DatePicker, Space, Spin, Pagination, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useGetSessions } from '@/hooks/useSessions';
import { useGetGrades } from '@/hooks/useGrades';
import { useGetStudents } from '@/hooks/useStudents';
import { SessionModal } from './SessionModal';
import { OverrideSessionModal } from './OverrideSessionModal';
import { CancelSessionModal } from './CancelSessionModal';
import { DeleteConfirmModal } from '@/components/userManagement/DeleteConfirmModal';
import { useDeleteSession } from '@/hooks/useSessions';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export const SessionsList = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [gradeFilter, setGradeFilter] = useState(null);
  const [studentFilter, setStudentFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'

  //>>> Fetch grades for filter
  const { data: gradesData } = useGetGrades({ page: 1, limit: 100 });
  const grades = gradesData?.data || [];

  //>>> Fetch students for filter
  const { data: studentsData } = useGetStudents({ page: 1, limit: 100 });
  const students = studentsData?.data || [];

  //>>> Build query params
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit,
      sort: 'start_timestamp',
      sortOrder: 'DESC',
    };

    if (statusFilter) params.status = statusFilter;
    if (gradeFilter) params.gradeId = gradeFilter;
    if (studentFilter) params.studentId = studentFilter;
    if (search) params.search = search;
    if (dateRange && dateRange.length === 2) {
      params.startDate = dateRange[0].startOf('day').toISOString();
      params.endDate = dateRange[1].endOf('day').toISOString();
    }

    return params;
  }, [page, limit, statusFilter, gradeFilter, studentFilter, search, dateRange]);

  //>>> Fetch sessions
  const { data: sessionsData, isLoading, refetch } = useGetSessions(queryParams);
  const deleteSessionMutation = useDeleteSession();

  //>>> API returns { success: true, data: [...sessions], pagination: {...} }
  const sessions = sessionsData?.data || [];
  const pagination = sessionsData?.pagination || {};

  //>>> Format date for display
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('MMM DD, YYYY hh:mm A');
  };

  //>>> Get status tag color
  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'green', text: 'Active' },
      ended: { color: 'blue', text: 'Ended' },
      cancelled: { color: 'red', text: 'Cancelled' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  //>>> Handle actions
  const handleAdd = () => {
    setModalMode('add');
    setSelectedSession(null);
    setIsModalOpen(true);
  };

  const handleEdit = (session) => {
    setModalMode('edit');
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleOverride = (session) => {
    setSelectedSession(session);
    setIsOverrideModalOpen(true);
  };

  const handleCancel = (session) => {
    setSelectedSession(session);
    setIsCancelModalOpen(true);
  };

  const handleDelete = (session) => {
    setSelectedSession(session);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedSession) {
      try {
        await deleteSessionMutation.mutateAsync(selectedSession.id);
        setIsDeleteModalOpen(false);
        setSelectedSession(null);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  //>>> Table columns
  const columns = [
    {
      title: 'Student',
      dataIndex: ['student', 'fullName'],
      key: 'student',
      render: (text, record) => (
        <div>
          <Text strong>{text || 'N/A'}</Text>
          {record.student?.email && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{record.student.email}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Start Time',
      dataIndex: 'startTimestamp',
      key: 'startTimestamp',
      render: (date) => formatDateTime(date),
      sorter: true,
    },
    {
      title: 'End Time',
      dataIndex: 'endTimestamp',
      key: 'endTimestamp',
      render: (date) => formatDateTime(date),
    },
    {
      title: 'Duration',
      dataIndex: 'durationDisplay',
      key: 'duration',
      render: (duration) => duration || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Ended', value: 'ended' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'active' && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleOverride(record)}
                style={{ color: '#1890ff' }}
              >
                Override
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => handleCancel(record)}
                style={{ color: '#ff4d4f' }}
              >
                Cancel
              </Button>
            </>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Sessions"
        extra={
          <Button type="primary" onClick={handleAdd} style={{ backgroundColor: '#00B894', borderColor: '#00B894' }}>
            Add Session +
          </Button>
        }
        style={{ marginTop: 16 }}
      >
        {/* Filters */}
        <Space wrap style={{ marginBottom: 16, width: '100%' }}>
          <Input
            placeholder="Search by student name or email"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="ended">Ended</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
          </Select>
          <Select
            placeholder="Filter by Grade"
            value={gradeFilter}
            onChange={(value) => {
              setGradeFilter(value);
              setPage(1);
            }}
            style={{ width: 150 }}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={grades.map(grade => ({
              value: grade.id,
              label: grade.gradeName,
            }))}
          />
          <Select
            placeholder="Filter by Student"
            value={studentFilter}
            onChange={(value) => {
              setStudentFilter(value);
              setPage(1);
            }}
            style={{ width: 200 }}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={students.map(student => ({
              value: student.id,
              label: `${student.fullName} (${student.email})`,
            }))}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates);
              setPage(1);
            }}
            format="YYYY-MM-DD"
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={refetch}>
            Refresh
          </Button>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={sessions}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Pagination
              current={page}
              total={pagination.total}
              pageSize={limit}
              onChange={(newPage) => setPage(newPage)}
              showSizeChanger={false}
              showTotal={(total) => `Total ${total} sessions`}
            />
          </div>
        )}
      </Card>

      {/* Modals */}
      <SessionModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSession(null);
        }}
        mode={modalMode}
        sessionData={selectedSession}
        onSuccess={() => {
          setIsModalOpen(false);
          setSelectedSession(null);
          refetch();
        }}
      />

      <OverrideSessionModal
        open={isOverrideModalOpen}
        onClose={() => {
          setIsOverrideModalOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onSuccess={() => {
          setIsOverrideModalOpen(false);
          setSelectedSession(null);
          refetch();
        }}
      />

      <CancelSessionModal
        open={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onSuccess={() => {
          setIsCancelModalOpen(false);
          setSelectedSession(null);
          refetch();
        }}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSession(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Session"
        message={
          selectedSession
            ? `Are you sure you want to delete this session? This action cannot be undone.`
            : 'Are you sure you want to delete this session?'
        }
        loading={deleteSessionMutation.isPending}
      />
    </>
  );
};

