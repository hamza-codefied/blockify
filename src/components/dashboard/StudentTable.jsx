'use client';
import React, { useEffect, useState } from 'react';
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
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './student-table.css';

const { Title, Text } = Typography;
const { Option } = Select;

export default function StudentTable() {
  const [isMobileView, setIsMobileView] = useState(false);

  // Detect screen width dynamically
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    handleResize(); // run on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const students = [
    {
      name: 'Andrews',
      email: 'andrews_aiden@gmail.com',
      contact: '+1 (123) 123-1234',
      grade: '9th Grade',
      attendance: 'Signed In',
      time: '07:30 am',
      session: 'In Session',
      img: 'https://i.pravatar.cc/40?img=1',
    },
    {
      name: 'Miller',
      email: 'miller_jane@gmail.com',
      contact: '+1 (123) 222-9876',
      grade: '8th Grade',
      attendance: 'Not Signed In',
      time: 'N/A',
      session: 'Not In Session',
      img: 'https://i.pravatar.cc/40?img=2',
    },
    {
      name: 'Smith',
      email: 'smith_joe@gmail.com',
      contact: '+1 (123) 321-7777',
      grade: '10th Grade',
      attendance: 'Signed In',
      time: '07:50 am',
      session: 'In Session',
      img: 'https://i.pravatar.cc/40?img=3',
    },
    {
      name: 'Andrews',
      email: 'andrews_aiden@gmail.com',
      contact: '+1 (123) 123-1234',
      grade: '9th Grade',
      attendance: 'Signed In',
      time: '07:30 am',
      session: 'In Session',
      img: 'https://i.pravatar.cc/40?img=1',
    },
    {
      name: 'Miller',
      email: 'miller_jane@gmail.com',
      contact: '+1 (123) 222-9876',
      grade: '8th Grade',
      attendance: 'Not Signed In',
      time: 'N/A',
      session: 'Not In Session',
      img: 'https://i.pravatar.cc/40?img=2',
    },
    {
      name: 'Smith',
      email: 'smith_joe@gmail.com',
      contact: '+1 (123) 321-7777',
      grade: '10th Grade',
      attendance: 'Signed In',
      time: '07:50 am',
      session: 'In Session',
      img: 'https://i.pravatar.cc/40?img=3',
    },
  ];

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
          <a href={`tel:${record.contact}`} className='text-xs hover:underline'>
            {record.contact}
          </a>
        </div>
      ),
      // responsive: ['sm'],
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      // responsive: ['sm'],
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
      render: time => (
        <Tag color={time === 'N/A' ? 'default' : 'cyan'}>{time}</Tag>
      ),
      responsive: ['md'],
    },
    {
      title: 'Session',
      dataIndex: 'session',
      key: 'session',
      render: session => (
        <Tag color={session === 'In Session' ? 'blue' : 'volcano'}>
          {session}
        </Tag>
      ),
    },
  ];

  return (
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
          <Title level={5} style={{ marginBottom: 0 }}>
            Student Information Log
          </Title>
        </Col>
        <Col xs={24} lg={16}>
          <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Input
              placeholder='Search'
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 180, borderRadius: 8 }}
              className='hover:!border-[#00b894]'
            />
            {['Grade', 'Attendance', 'Arrival', 'Sessions'].map(label => (
              <Select key={label} defaultValue={label} style={{ width: 130 }}>
                <Option value={label}>{label}</Option>
              </Select>
            ))}
          </Space>
        </Col>
      </Row>

      {/* ===== Conditional View ===== */}
      {isMobileView ? (
        // 📱 Mobile / Tablet → AntD Table
        <div className='mt-4'>
          <Table
            columns={columns}
            dataSource={students}
            pagination={{ pageSize: 5 }}
            rowKey='email'
            scroll={{ x: 'max-content' }}
            size='middle'
          />
        </div>
      ) : (
        // 🖥 Large screen → AntD List (existing design)
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
            <Col flex='1'>Attendance</Col>
            <Col flex='1'>Time</Col>
            <Col flex='1'>Session</Col>
          </Row>

          <List
            itemLayout='horizontal'
            dataSource={students}
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
                  <Col flex='1'>
                    <Tag
                      color={
                        student.session === 'In Session' ? 'blue' : 'volcano'
                      }
                      style={{
                        borderRadius: 12,
                        fontWeight: 500,
                        padding: '2px 10px',
                      }}
                    >
                      {student.session}
                    </Tag>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </div>
      )}

      {/* ===== Footer ===== */}
      {/* {!isMobileView && (
        <Row justify='space-between' align='middle' style={{ marginTop: 8 }}>
          <Col>
            <Text type='secondary' style={{ fontSize: 12 }}>
              Showing results 8 of 10
            </Text>
          </Col>
          <Col>
            <Pagination
              size='small'
              total={30}
              pageSize={10}
              current={1}
              showSizeChanger={false}
            />
          </Col>
        </Row>
      )} */}
    </Card>
  );
}
