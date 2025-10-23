'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Avatar,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Table,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  UploadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
// import '@/components/userManagement/user-management.css';
import { MdPhone } from 'react-icons/md';
import { FaEnvelope } from 'react-icons/fa';
import { RiDeleteBinLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import { PiStudentFill } from 'react-icons/pi';

const { Title, Text } = Typography;
const { Option } = Select;

export const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [search, setSearch] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);

  // ✅ Detect screen width dynamically
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    handleResize(); // Run once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dummy data
  const dummyStudents = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    name: 'Andrews',
    contact: '+1 (123) 123-1234',
    email: 'andrew@gmail.com',
    grade: '9th Grade',
    guardian: 'Andrew Jackson',
    guardianContact: '+1 (123) 123-125534',
    guardianEmail: 'andrew@gmail.com',
    address: 'H-1, BLVD, Street 1, 001...',
    zip: '00124',
  }));

  const dummyManagers = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: 'Sarah Collins',
    contact: '+1 (321) 456-7890',
    email: 'sarah_collins@gmail.com',
    role: 'Manager',
    department: 'Administration',
    address: 'H-2, BLVD, Street 5, 002...',
    zip: '00214',
  }));

  const data = activeTab === 'students' ? dummyStudents : dummyManagers;

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Table Columns
  const studentColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200,
      render: (text, record) => (
        <Space className='flex flex-col lg:flex lg:flex-row'>
          <Avatar src='https://i.pravatar.cc/50?img=10' />
          <Text>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: 'Contact',
      render: (_, record) => (
        <div>
          <div className='flex items-center gap-1'>
            <MdPhone className='text-[#00B894] w-4 h-4' />
            {record.contact}
          </div>
          <div className='flex items-center gap-1 text-gray-600'>
            <FaEnvelope className='text-[#00B894] w-4 h-4' />
            {record.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
    },
    {
      title: 'Guardian',
      render: (_, record) => (
        <div>
          <Text strong>{record.guardian}</Text>
          <div className='flex items-center gap-1'>
            <MdPhone className='text-[#00B894] w-4 h-4' />
            {record.guardianContact}
          </div>
          <div className='flex items-center gap-1 text-gray-600'>
            <FaEnvelope className='text-[#00B894] w-4 h-4' />
            {record.guardianEmail}
          </div>
        </div>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
    },
    {
      title: 'Zip',
      dataIndex: 'zip',
    },
    {
      title: 'Action',
      render: () => (
        <div className='flex space-x-3'>
          <RiDeleteBinLine className='w-5 h-5 cursor-pointer text-[#801818]' />
          <TbEdit className='w-5 h-5 cursor-pointer text-[#00B894]' />
        </div>
      ),
    },
  ];

  const managerColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, record) => (
        <Space className='flex flex-col lg:flex lg:flex-row items-start'>
          <Avatar src='https://i.pravatar.cc/50?img=10' />
          <Text>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: 'Contact',
      render: (_, record) => (
        <div>
          <div className='flex items-center gap-1'>
            <MdPhone className='text-[#00B894] w-4 h-4' />
            {record.contact}
          </div>
          <div className='flex items-center gap-1 text-gray-600'>
            <FaEnvelope className='text-[#00B894] w-4 h-4' />
            {record.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
    },
    {
      title: 'Address',
      dataIndex: 'address',
    },
    {
      title: 'Zip',
      dataIndex: 'zip',
    },
    {
      title: 'Action',
      render: () => (
        <div className='flex space-x-3'>
          <RiDeleteBinLine className='w-5 h-5 cursor-pointer text-[#801818]' />
          <TbEdit className='w-5 h-5 cursor-pointer text-[#00B894]' />
        </div>
      ),
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
      <Row justify='space-between' align='middle' className='mb-4'>
        <Col>
          <Title level={5} style={{ marginBottom: 0 }}>
            User Management
          </Title>
        </Col>
      </Row>

      {/* ===== Tabs ===== */}
      <div className='flex justify-center mb-6'>
        <div className='flex flex-col md:flex-row items-center justify-center gap-5 md:gap-20'>
          <Button
            type={activeTab === 'students' ? 'primary' : 'text'}
            icon={<PiStudentFill className='w-5 h-5' />}
            onClick={() => setActiveTab('students')}
            className={`rounded-md ${
              activeTab === 'students'
                ? 'bg-[#00B894] text-white'
                : 'bg-[#f2f3f4] text-gray-700'
            }`}
          >
            Students
          </Button>
          <Button
            type={activeTab === 'managers' ? 'primary' : 'text'}
            icon={<TeamOutlined />}
            onClick={() => setActiveTab('managers')}
            className={`rounded-md ${
              activeTab === 'managers'
                ? 'bg-[#00B894] text-white'
                : 'bg-[#f2f3f4] text-gray-700'
            }`}
          >
            Managers
          </Button>
        </div>
      </div>

      {/* ===== Filters & Actions ===== */}
      <Row
        gutter={[16, 16]}
        align='middle'
        justify='space-between'
        className='mb-4'
      >
        <Col xs={24} md={12} lg={12}>
          <div className='flex flex-col md:flex-row items-center gap-3'>
            <Input
              placeholder='Search'
              prefix={<SearchOutlined />}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {activeTab === 'students' && (
              <Select defaultValue='Grade' className='w-40'>
                <Option value='all'>All Grades</Option>
                <Option value='9'>9th Grade</Option>
                <Option value='10'>10th Grade</Option>
              </Select>
            )}
          </div>
        </Col>

        <Col
          xs={24}
          md={12}
          lg={8}
          className='flex justify-center md:justify-end flex-wrap gap-2'
        >
          <Button icon={<PlusOutlined />} className='rounded-lg'>
            Manually Add
          </Button>
          <Button icon={<UploadOutlined />} className='rounded-lg'>
            Import CSV
          </Button>
        </Col>
      </Row>

      {/* ===== Responsive Data View ===== */}
      {isMobileView ? (
        // ✅ Mobile View: Table (with headers)
        <Table
          columns={activeTab === 'students' ? studentColumns : managerColumns}
          dataSource={filteredData}
          pagination={{ pageSize: 5 }}
          rowKey='id'
          scroll={{ x: true }}
        />
      ) : (
        // 💻 Desktop View: List (with custom headings added)
        <>
          {/* ✅ Table-like Headings */}
          <div
            className='grid items-center text-sm font-semibold text-gray-700 mb-2 px-4 py-3 border-2 border-gray-100 box-border rounded-lg shadow-sm'
            style={{
              gridTemplateColumns:
                activeTab === 'students'
                  ? '2fr 2fr 1fr 2fr 2fr 1fr 1fr'
                  : '2fr 2fr 1fr 2fr 1fr 1fr',
            }}
          >
            <div>Name</div>
            <div>Contact</div>
            {activeTab === 'students' ? (
              <>
                <div>Grade</div>
                <div>Guardian</div>
                <div>Address</div>
                <div>Zip</div>
                <div>Action</div>
              </>
            ) : (
              <>
                <div>Role</div>
                <div>Address</div>
                <div>Zip</div>
                <div>Action</div>
              </>
            )}
          </div>

          {/* ✅ Original List Data */}
          <List
            itemLayout='horizontal'
            dataSource={filteredData}
            renderItem={item => (
              <List.Item
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  marginBottom: 8,
                  padding: '12px 16px',
                  boxShadow: '0 0 8px rgba(0,0,0,0.05)',
                  border: '2px solid rgba(0,0,0,0.05)',
                  width: '100%',
                }}
              >
                <Row align='middle' style={{ width: '100%' }}>
                  <Col flex='2'>
                    <Space>
                      <Avatar src='https://i.pravatar.cc/50?img=10' size={40} />
                      <Text>{item.name}</Text>
                    </Space>
                  </Col>

                  <Col flex='2'>
                    <div className='flex flex-col'>
                      <div className='flex items-center gap-1'>
                        <MdPhone className='text-[#00B894] w-4 h-4' />
                        {item.contact}
                      </div>
                      <div className='flex items-center gap-1 text-gray-600'>
                        <FaEnvelope className='text-[#00B894] w-4 h-4' />
                        {item.email}
                      </div>
                    </div>
                  </Col>

                  {activeTab === 'students' ? (
                    <>
                      <Col flex='1'>{item.grade}</Col>
                      <Col flex='2'>
                        <Text strong>{item.guardian}</Text>
                        <div className='flex flex-col'>
                          <div className='flex items-center gap-1'>
                            <MdPhone className='text-[#00B894] w-4 h-4' />
                            {item.guardianContact}
                          </div>
                          <div className='flex items-center gap-1 text-gray-600'>
                            <FaEnvelope className='text-[#00B894] w-4 h-4' />
                            {item.guardianEmail}
                          </div>
                        </div>
                      </Col>
                      <Col flex='2'>{item.address}</Col>
                      <Col flex='1'>{item.zip}</Col>
                      <Col flex='1'>
                        <div className='flex space-x-4'>
                          <RiDeleteBinLine className='w-5 h-5 cursor-pointer text-[#801818]' />
                          <TbEdit className='w-5 h-5 cursor-pointer text-[#00B894]' />
                        </div>
                      </Col>
                    </>
                  ) : (
                    <>
                      <Col flex='1'>{item.role}</Col>
                      <Col flex='2'>{item.address}</Col>
                      <Col flex='1'>{item.zip}</Col>
                      <Col flex='1'>
                        <div className='flex space-x-4'>
                          <RiDeleteBinLine className='w-5 h-5 cursor-pointer text-[#801818]' />
                          <TbEdit className='w-5 h-5 cursor-pointer text-[#00B894]' />
                        </div>
                      </Col>
                    </>
                  )}
                </Row>
              </List.Item>
            )}
          />
        </>
      )}
    </Card>
  );
};
