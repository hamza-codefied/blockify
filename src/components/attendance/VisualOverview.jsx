'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  List,
  Avatar,
  Input,
  Select,
  Row,
  Col,
  Space,
  Typography,
  Tag,
  Table,
  Spin,
  Empty,
  Pagination,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './visual-overview.css';
import { useGetAttendanceSessionsList } from '@/hooks/useAttendance';
import { useGetGrades } from '@/hooks/useGrades';
import { formatTime } from '@/utils/time';

const { Title, Text } = Typography;
const { Option } = Select;

// Generate avatar URL from name (for consistent avatars)
const getAvatarUrl = (name) => {
  if (!name) return null;
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://i.pravatar.cc/40?img=${(hash % 70) + 1}`;
};

export default function VisualOverview() {
  const [search, setSearch] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [gradeFilter, setGradeFilter] = useState(null);
  const [attendanceFilter, setAttendanceFilter] = useState(null);
  const [arrivalFilter, setArrivalFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // ✅ Detect screen width dynamically
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch grades for filter dropdown
  const { data: gradesData } = useGetGrades({ page: 1, limit: 100 });
  const grades = gradesData?.data || [];

  // Build query params for API
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit,
      sort: 'created_at',
      sortOrder: 'DESC',
    };

    if (gradeFilter) {
      params.gradeId = gradeFilter;
    }

    if (attendanceFilter) {
      params.attendanceStatus = attendanceFilter === 'Signed In' ? 'signed-in' : 'not-signed-in';
    }

    if (arrivalFilter) {
      params.arrivalTime = arrivalFilter === 'Before 08:00 am' ? 'before-8am' : 'after-8am';
    }

    if (search) {
      params.search = search;
    }

    return params;
  }, [page, limit, gradeFilter, attendanceFilter, arrivalFilter, search]);

  // Fetch attendance sessions
  const { data: sessionsData, isLoading } = useGetAttendanceSessionsList(queryParams);
  const sessions = sessionsData?.data?.sessions || [];
  const pagination = sessionsData?.data?.pagination || {};

  // Format sessions for display
  const formattedStudents = useMemo(() => {
    return sessions.map(session => {
      const student = session.student;
      const arrivalTime = session.arrivalTime === 'N/A' 
        ? 'N/A' 
        : formatTime(session.arrivalTime);

      return {
        id: session.id,
        name: student?.fullName || 'N/A',
        email: student?.email || 'N/A',
        contact: student?.contact || 'N/A',
        grade: student?.grade?.gradeName || 'N/A',
        attendance: session.isSignedIn ? 'Signed In' : 'Not Signed In',
        time: arrivalTime,
        img: getAvatarUrl(student?.fullName),
      };
    });
  }, [sessions]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  const handleGradeFilterChange = (value) => {
    setGradeFilter(value);
    setPage(1); // Reset to first page on filter change
  };

  const handleAttendanceFilterChange = (value) => {
    setAttendanceFilter(value);
    setPage(1); // Reset to first page on filter change
  };

  const handleArrivalFilterChange = (value) => {
    setArrivalFilter(value);
    setPage(1); // Reset to first page on filter change
  };

  // ✅ Table Columns (for mobile)
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Space>
          <Avatar src={record.img} size={36} />
          <div>
            <Text strong>{record.name}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
      render: (text, record) => (
        <div className='flex flex-col items-start gap-2'>
          {record.contact && record.contact !== 'N/A' ? (
            <a href={`tel:${record.contact}`} className='text-xs hover:underline'>
              {record.contact}
            </a>
          ) : (
            <span className='text-xs text-gray-400'>{record.contact || 'N/A'}</span>
          )}
          {record.email && record.email !== 'N/A' ? (
            <a
              href={`mailto:${record.email}`}
              className='text-xs hover:underline'
            >
              {record.email}
            </a>
          ) : (
            <span className='text-xs text-gray-400'>{record.email || 'N/A'}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'Attendance',
      dataIndex: 'attendance',
      key: 'attendance',
      render: att => (
        <Tag color={att === 'Signed In' ? 'green' : 'volcano'}>{att}</Tag>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: t => <Tag color={t === 'N/A' ? 'default' : 'cyan'}>{t}</Tag>,
    },
  ];

  return (
    <Card
      variant='outlined'
      style={{
        borderRadius: 12,
        marginTop: 24,
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      }}
    >
      {/* ===== Header ===== */}
      <Row justify='space-between' align='middle' gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Title level={5} style={{ marginBottom: 0 }}>
            Visual Overview
          </Title>
        </Col>
        <Col xs={24} md={16}>
          <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
            {/* 🔍 Search */}
            <Input
              placeholder='Search by name'
              prefix={<SearchOutlined />}
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              allowClear
              style={{ width: 180, borderRadius: 8 }}
              className='hover:!border-[#00b894]'
            />

            {/* 🧩 Filters */}
            <Select
              placeholder='Grade'
              allowClear
              value={gradeFilter}
              style={{ width: 120 }}
              onChange={handleGradeFilterChange}
            >
              {grades.map(grade => (
                <Option key={grade.id} value={grade.id}>
                  {grade.gradeName}
                </Option>
              ))}
            </Select>

            <Select
              placeholder='Attendance'
              allowClear
              value={attendanceFilter}
              style={{ width: 130 }}
              onChange={handleAttendanceFilterChange}
            >
              <Option value='Signed In'>Signed In</Option>
              <Option value='Not Signed In'>Not Signed In</Option>
            </Select>

            <Select
              placeholder='Arrival'
              allowClear
              value={arrivalFilter}
              style={{ width: 140 }}
              onChange={handleArrivalFilterChange}
            >
              <Option value='Before 08:00 am'>Before 08:00 am</Option>
              <Option value='After 08:00 am'>After 08:00 am</Option>
            </Select>
          </Space>
        </Col>
      </Row>

      {/* ===== Conditional Layout ===== */}
      {isLoading ? (
        <div className='flex justify-center items-center py-8'>
          <Spin size='large' />
        </div>
      ) : formattedStudents.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <Empty description='No attendance data found' />
        </div>
      ) : isMobileView ? (
        <div className='mt-4'>
          <Table
            columns={columns}
            dataSource={formattedStudents}
            pagination={false}
            rowKey='id'
            scroll={{ x: 400 }}
            size='middle'
          />
          {pagination.totalPages > 1 && (
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
        </div>
      ) : (
        <div className='visual-overview-wrapper'>
          <Row
            justify='space-between'
            className='visual-overview-header'
            style={{
              marginTop: 24,
              marginBottom: 8,
              fontWeight: 500,
              background: '#fff',
              boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
              border: '2px solid rgba(0,0,0,0.05)',
              borderRadius: 12,
              padding: '20px 16px',
            }}
          >
            <Col className='pl-2' flex='2'>
              Name
            </Col>
            <Col flex='2'>Contact</Col>
            <Col flex='1'>Grade</Col>
            <Col flex='1'>Attendance</Col>
            <Col flex='1'>Time</Col>
          </Row>

          <List
            itemLayout='horizontal'
            dataSource={formattedStudents}
            renderItem={student => (
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
                    <Space>
                      <Avatar src={student.img} size={40} />
                      <Text>{student.name}</Text>
                    </Space>
                  </Col>
                  <Col flex='2'>
                    <div className='flex flex-col'>
                      {student.email && student.email !== 'N/A' ? (
                        <a
                          href={`mailto:${student.email}`}
                          className='text-inherit hover:text-[#00B894]'
                        >
                          {student.email}
                        </a>
                      ) : (
                        <span className='text-gray-400'>{student.email || 'N/A'}</span>
                      )}
                      {student.contact && student.contact !== 'N/A' ? (
                        <a
                          href={`tel:${student.contact.replace(/\D/g, '')}`}
                          className='text-inherit hover:text-[#00B894]'
                        >
                          {student.contact}
                        </a>
                      ) : (
                        <span className='text-gray-400'>{student.contact || 'N/A'}</span>
                      )}
                    </div>
                  </Col>
                  <Col flex='1'>
                    <Text>{student.grade}</Text>
                  </Col>
                  <Col flex='1'>
                    <Tag
                      color={
                        student.attendance === 'Signed In' ? 'green' : 'volcano'
                      }
                      style={{
                        borderRadius: 12,
                        fontWeight: 500,
                        padding: '2px 10px',
                      }}
                    >
                      {student.attendance}
                    </Tag>
                  </Col>
                  <Col flex='1'>
                    <Tag
                      color={student.time === 'N/A' ? 'default' : 'cyan'}
                      style={{
                        borderRadius: 12,
                        fontWeight: 500,
                        padding: '2px 10px',
                      }}
                    >
                      {student.time}
                    </Tag>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
          {pagination.totalPages > 1 && (
            <Row justify='space-between' align='middle' style={{ marginTop: 16 }}>
              <Col>
                <Text type='secondary' style={{ fontSize: 12 }}>
                  {pagination.total
                    ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, pagination.total)} of ${pagination.total}`
                    : 'No sessions'}
                </Text>
              </Col>
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
            </Row>
          )}
        </div>
      )}
    </Card>
  );
}
