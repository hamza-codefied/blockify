'use client';
import React, { useEffect, useState, useMemo } from 'react';
import {
  List,
  Card,
  Avatar,
  Input,
  Select,
  Row,
  Col,
  Space,
  Typography,
  Tag,
  Pagination,
  Table,
  Spin,
  Empty,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './student-table.css';
import { useGetAttendanceSessionsList } from '@/hooks/useAttendance';
import { useGetGrades } from '@/hooks/useGrades';
import { useUpdateSession } from '@/hooks/useSessions';
import { formatTime } from '@/utils/time';
import { formatGradeDisplayName, getDefaultGradeQueryParams } from '@/utils/grade.utils';
import { Typography as PageTitle } from '@/components/common/PageTitle';

const { Text } = Typography;
const { Option } = Select;

// Generate avatar URL from name (for consistent avatars)
const getAvatarUrl = (name) => {
  if (!name) return null;
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://i.pravatar.cc/40?img=${(hash % 70) + 1}`;
};

export default function StudentTable() {
  const [isMobileView, setIsMobileView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [selectedArrival, setSelectedArrival] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const updateSessionMutation = useUpdateSession();

  // Watch for dark mode toggle dynamically
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Fetch grades for filter dropdown
  const { data: gradesData } = useGetGrades({ page: 1, limit: 100, ...getDefaultGradeQueryParams() });
  const grades = gradesData?.data || [];

  // Build query params for API
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit,
      sort: 'created_at',
      sortOrder: 'DESC',
    };

    if (selectedGrade) {
      params.gradeId = selectedGrade;
    }

    if (selectedAttendance) {
      params.attendanceStatus = selectedAttendance === 'Signed In' ? 'signed-in' : 'not-signed-in';
    }

    if (selectedArrival) {
      params.arrivalTime = selectedArrival === 'Before 08:00 am' ? 'before-8am' : 'after-8am';
    }

    if (searchTerm) {
      params.search = searchTerm;
    }

    return params;
  }, [page, limit, selectedGrade, selectedAttendance, selectedArrival, searchTerm]);

  // Fetch attendance sessions
  const { data: sessionsData, isLoading, refetch } = useGetAttendanceSessionsList(queryParams);
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
        sessionId: session.id,
        name: student?.fullName || 'N/A',
        email: student?.email || 'N/A',
        contact: student?.contact || 'N/A',
        grade: student?.grade?.gradeName || 'N/A',
        attendance: session.isSignedIn ? 'Signed In' : 'Not Signed In',
        time: arrivalTime,
        img: getAvatarUrl(student?.fullName),
        startTimestamp: session.startTimestamp,
      };
    });
  }, [sessions]);

  // Detect screen width dynamically
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleGradeFilterChange = (value) => {
    setSelectedGrade(value);
    setPage(1);
  };

  const handleAttendanceFilterChange = (value) => {
    setSelectedAttendance(value);
    setPage(1);
  };

  const handleArrivalFilterChange = (value) => {
    setSelectedArrival(value);
    setPage(1);
  };

  const handleAttendanceStatusChange = async (sessionId, newStatus) => {
    try {
      // If changing to "Signed In", set start_timestamp to current time
      // If changing to "Not Signed In", set start_timestamp to null
      const updateData = {
        startTimestamp: newStatus === 'Signed In' ? new Date().toISOString() : null,
      };

      await updateSessionMutation.mutateAsync({ sessionId, data: updateData });
      refetch(); // Refresh the list
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  // Columns for Table View (mobile/tablet)
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 100,
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
          <a
            href={`mailto:${record.email}`}
            className='text-xs hover:underline'
          >
            {record.email}
          </a>
          {record.contact && record.contact !== 'N/A' && (
            <a href={`tel:${record.contact}`} className='text-xs hover:underline'>
              {record.contact}
            </a>
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
      render: (att, record) => {
        // Instead of useState here, use the record's value directly
        const isSignedIn = att === 'Signed In';
        const bgColor = isSignedIn ? '#f6ffed' : '#fff2e8';
        const textColor = isSignedIn ? '#389e0d' : '#ff4d4d';

        return (
          <Select
            value={att}
            size='small'
            variant='borderless'
            className='custom-select rounded-xl'
            style={{
              backgroundColor: isDarkMode ? 'transparent' : bgColor,
              color: textColor,
              width: 120,
            }}
            options={[
              { value: 'Signed In', label: 'Signed In' },
              { value: 'Not Signed In', label: 'Not Signed In' },
            ]}
            onChange={val => {
              handleAttendanceStatusChange(record.sessionId, val);
            }}
            loading={updateSessionMutation.isPending}
          />
        );
      },
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (time) => (
        <Input
          value={time}
          size='small'
          style={{ width: 70 }}
          bordered={false}
          variant='outlined'
          readOnly
          className='cursor-default bg-[#e6fffb] border-[#87e8de] rounded-lg text-center text-[#08979c]'
        />
      ),
    },
  ];

  return (
    <>
      <Card
        className='student-card'
        style={{
          borderRadius: 12,
          marginTop: 24,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        {/* ===== Header ===== */}
        <Row justify='space-between' align='middle' gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <PageTitle variant='primary'>Student Information Log</PageTitle>
          </Col>

          <Col xs={24} lg={16}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Input
                placeholder='Search'
                prefix={<SearchOutlined />}
                allowClear
                value={searchTerm}
                onChange={e => handleSearchChange(e.target.value)}
                style={{ width: 180, borderRadius: 8 }}
                className='hover:!border-[#00b894]'
              />

              <Select
                placeholder='Grade'
                style={{ width: 120 }}
                value={selectedGrade}
                onChange={handleGradeFilterChange}
                allowClear
              >
                {grades.map(grade => (
                  <Option key={grade.id} value={grade.id}>
                    {formatGradeDisplayName(grade)}
                  </Option>
                ))}
              </Select>

              <Select
                placeholder='Attendance'
                style={{ width: 120 }}
                value={selectedAttendance}
                onChange={handleAttendanceFilterChange}
                allowClear
              >
                <Option value='Signed In'>Present</Option>
                <Option value='Not Signed In'>Absent</Option>
              </Select>

              <Select
                placeholder='Arrival'
                style={{ width: 120 }}
                value={selectedArrival}
                onChange={handleArrivalFilterChange}
                allowClear
              >
                <Option value='Before 08:00 am'>Before 08:00 am</Option>
                <Option value='After 08:00 am'>After 08:00 am</Option>
              </Select>
            </Space>
          </Col>
        </Row>

        {/* ===== Conditional View ===== */}
        {isLoading && formattedStudents.length === 0 ? (
          <div className='flex justify-center items-center py-8'>
            <Spin size='large' />
          </div>
        ) : formattedStudents.length === 0 ? (
          <div className='text-center py-8'>
            <Empty description='No students found' />
          </div>
        ) : isMobileView ? (
          <div className='mt-4'>
            <Table
              columns={columns}
              dataSource={formattedStudents}
              pagination={{
                current: page,
                pageSize: limit,
                total: pagination.total || 0,
                onChange: handlePageChange,
              }}
              rowKey='id'
              scroll={{ x: 'max-content' }}
              size='middle'
              loading={isLoading}
            />
          </div>
        ) : (
          <div className='student-table-wrapper'>
            <Row
              justify='space-between'
              className='student-table-header'
              style={{
                marginTop: 24,
                marginBottom: 8,
                fontWeight: 500,
                background: '#fff',
                boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
                border: '2px solid rgba(0,0,0,0.05)',
                borderRadius: 12,
                padding: '20px 16px',
                minWidth: 750,
              }}
            >
              <Col className='pl-2' flex='2'>
                Name
              </Col>
              <Col flex='2'>Contact</Col>
              <Col flex='1'>Grade</Col>
              <Col flex='2'>Attendance</Col>
              <Col flex='1'>Time</Col>
            </Row>

            <List
              itemLayout='horizontal'
              dataSource={formattedStudents}
              loading={isLoading}
              renderItem={student => (
                <List.Item
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    marginBottom: 8,
                    padding: '12px 16px',
                    boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
                    border: '2px solid rgba(0,0,0,0.05)',
                    minWidth: 750,
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
                        <a
                          href={`mailto:${student.email}`}
                          className='text-inherit hover:text-[#00B894]'
                        >
                          {student.email}
                        </a>
                        <a
                          href={`tel:${student.contact.replace(/\D/g, '')}`}
                          className='text-inherit hover:text-[#00B894]'
                        >
                          {student.contact}
                        </a>
                      </div>
                    </Col>
                    <Col flex='1'>
                      <Text>{student.grade}</Text>
                    </Col>
                    <Col flex='2'>
                      <Select
                        value={student.attendance}
                        size='small'
                        variant='borderless'
                        className='custom-select rounded-xl'
                        style={{
                          backgroundColor: !isDarkMode
                            ? student.attendance === 'Signed In'
                              ? '#f6ffed'
                              : '#fff2e8'
                            : 'transparent',
                          color:
                            student.attendance === 'Signed In'
                              ? '#389e0d'
                              : '#ff4d4d',
                          width: 130,
                          transition: 'background-color 0.3s ease',
                        }}
                        options={[
                          { value: 'Signed In', label: 'Signed In' },
                          { value: 'Not Signed In', label: 'Not Signed In' },
                        ]}
                        onChange={val => {
                          handleAttendanceStatusChange(student.sessionId, val);
                        }}
                        loading={updateSessionMutation.isPending}
                      />
                    </Col>
                    <Col flex='1'>
                      <Input
                        value={student.time}
                        size='small'
                        style={{ width: 80 }}
                        variant='outlined'
                        readOnly
                        className='cursor-default bg-[#e6fffb] border-[#87e8de] rounded-lg text-center text-[#08979c]'
                      />
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </div>
        )}
        {!isMobileView && formattedStudents.length > 0 && (
          <div className='mt-4 flex justify-end'>
            <Pagination
              current={page}
              pageSize={limit}
              total={pagination.total || 0}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        )}
      </Card>
    </>
  );
}
