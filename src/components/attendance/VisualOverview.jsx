'use client';
import React, { useState, useEffect } from 'react';
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
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './visual-overview.css';

const { Title, Text } = Typography;
const { Option } = Select;

export default function VisualOverview() {
  const [search, setSearch] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [gradeFilter, setGradeFilter] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('');
  const [arrivalFilter, setArrivalFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ✅ Detect screen width dynamically
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const students = [
    {
      id: 1,
      name: 'Andrews, Aiden',
      email: 'andrews_aiden@gmail.com',
      contact: '+1 (123) 123-1234',
      grade: '9th Grade',
      attendance: 'Signed In',
      time: '07:30 am',
      session: 'Morning',
      img: 'https://i.pravatar.cc/40?img=1',
    },
    {
      id: 2,
      name: 'Miller, Jane',
      email: 'miller_jane@gmail.com',
      contact: '+1 (321) 321-1234',
      grade: '10th Grade',
      attendance: 'Not Signed In',
      time: 'N/A',
      session: 'Afternoon',
      img: 'https://i.pravatar.cc/40?img=2',
    },
    {
      id: 3,
      name: 'Smith, John',
      email: 'smith_john@gmail.com',
      contact: '+1 (555) 888-9999',
      grade: '11th Grade',
      attendance: 'Signed In',
      time: '08:45 am',
      session: 'Morning',
      img: 'https://i.pravatar.cc/40?img=3',
    },
    {
      id: 4,
      name: 'Khan, Sara',
      email: 'sara.khan@gmail.com',
      contact: '+1 (444) 555-6666',
      grade: '12th Grade',
      attendance: 'Signed In',
      time: '09:15 am',
      session: 'Evening',
      img: 'https://i.pravatar.cc/40?img=4',
    },
    {
      id: 5,
      name: 'Ali, Ahmed',
      email: 'ahmed.ali@gmail.com',
      contact: '+1 (999) 777-2222',
      grade: '10th Grade',
      attendance: 'Not Signed In',
      time: 'N/A',
      session: 'Afternoon',
      img: 'https://i.pravatar.cc/40?img=5',
    },
  ];

  // ✅ Filtering logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesGrade = !gradeFilter || student.grade === gradeFilter;
    const matchesAttendance =
      !attendanceFilter || student.attendance === attendanceFilter;
    const matchesArrival =
      !arrivalFilter ||
      (arrivalFilter === 'Signed In' && student.attendance === 'Signed In') ||
      (arrivalFilter === 'Not Signed In' &&
        student.attendance === 'Not Signed In');
    const matchesSession = !sessionFilter || student.session === sessionFilter;

    return (
      matchesSearch &&
      matchesGrade &&
      matchesAttendance &&
      matchesArrival &&
      matchesSession
    );
  });

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
          <a href={`tel:${record.contact}`} className='text-xs hover:underline'>
            {record.contact}
          </a>
          <a
            href={`mailto:${record.email}`}
            className='text-xs hover:underline'
          >
            {record.email}
          </a>
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
              onChange={e => setSearch(e.target.value)}
              allowClear
              style={{ width: 180, borderRadius: 8 }}
              className='hover:!border-[#00b894]'
            />

            {/* 🧩 Filters */}
            <Select
              value={gradeFilter || 'Grade'}
              style={{ width: 120 }}
              onChange={v => setGradeFilter(v === 'Grade' ? '' : v)}
            >
              <Option value='Grade'>Grade</Option>
              <Option value='9th Grade'>9th Grade</Option>
              <Option value='10th Grade'>10th Grade</Option>
              <Option value='11th Grade'>11th Grade</Option>
              <Option value='12th Grade'>12th Grade</Option>
            </Select>

            <Select
              value={attendanceFilter || 'Attendance'}
              style={{ width: 130 }}
              onChange={v => setAttendanceFilter(v === 'Attendance' ? '' : v)}
            >
              <Option value='Attendance'>Attendance</Option>
              <Option value='Signed In'>Signed In</Option>
              <Option value='Not Signed In'>Not Signed In</Option>
            </Select>

            <Select
              value={arrivalFilter || 'Arrival'}
              style={{ width: 120 }}
              onChange={v => setArrivalFilter(v === 'Arrival' ? '' : v)}
            >
              <Option value='Arrival'>Arrival</Option>
              <Option value='Signed In'>Signed In</Option>
              <Option value='Not Signed In'>Not Signed In</Option>
            </Select>
          </Space>
        </Col>
      </Row>

      {/* ===== Conditional Layout ===== */}
      {isMobileView ? (
        <div className='mt-4'>
          <Table
            columns={columns}
            dataSource={filteredStudents}
            pagination={{ pageSize: 5 }}
            rowKey='id'
            scroll={{ x: 400 }}
            size='middle'
          />
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
            dataSource={filteredStudents}
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
        </div>
      )}
    </Card>
  );
}
