'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
  Spin,
  Empty,
  Pagination,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  UploadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { MdPhone } from 'react-icons/md';
import { FaEnvelope } from 'react-icons/fa';
import { RiDeleteBinLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import { PiStudentFill } from 'react-icons/pi';
import { AddUserModal } from '@/components/userManagement/AddUserModal';
import { EditUserModal } from '@/components/userManagement/EditUserModal';
import { DeleteConfirmModal } from '@/components/userManagement/DeleteConfirmModal';
import { CSVImportModal } from '@/components/userManagement/CSVImportModal';
import { useGetStudents } from '@/hooks/useStudents';
import { useGetManagers } from '@/hooks/useManagers';
import { useGetGrades } from '@/hooks/useGrades';

const { Title, Text } = Typography;
const { Option } = Select;

export const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [gradeFilter, setGradeFilter] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCSVImportModalOpen, setIsCSVImportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch grades for filter dropdown
  const { data: gradesData } = useGetGrades({ 
    limit: 100, 
    sort: 'grade_name', 
    sortOrder: 'ASC' 
  });
  const grades = gradesData?.data || [];

  // Query params for API
  const studentsParams = useMemo(() => ({
    page,
    limit,
    sort: 'created_at',
    sortOrder: 'DESC',
    ...(gradeFilter && gradeFilter !== 'all' && { gradeId: gradeFilter }),
    ...(search && { search }),
  }), [page, limit, gradeFilter, search]);

  const managersParams = useMemo(() => ({
    page,
    limit,
    sort: 'created_at',
    sortOrder: 'DESC',
    ...(departmentFilter && departmentFilter !== 'all' && { department: departmentFilter }),
    ...(search && { search }),
  }), [page, limit, departmentFilter, search]);

  // Fetch data
  const { data: studentsData, isLoading: studentsLoading, refetch: refetchStudents } = useGetStudents(studentsParams);
  const { data: managersData, isLoading: managersLoading, refetch: refetchManagers } = useGetManagers(managersParams);

  const isLoading = activeTab === 'students' ? studentsLoading : managersLoading;
  
  // Backend returns: { success: true, data: [...], pagination: {...} }
  const data = activeTab === 'students' 
    ? studentsData?.data || []
    : managersData?.data || [];
  const pagination = activeTab === 'students'
    ? studentsData?.pagination
    : managersData?.pagination;

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // Handle successful operations
  const handleSuccess = () => {
    if (activeTab === 'students') {
      refetchStudents();
    } else {
      refetchManagers();
    }
  };

  const handleEditClick = user => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = user => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const studentColumns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      width: 200,
      render: (text, record) => (
        <Space className='flex flex-col lg:flex lg:flex-row'>
          <Avatar src='https://i.pravatar.cc/50?img=10' />
          <Text>{record.fullName}</Text>
        </Space>
      ),
    },
    {
      title: 'Contact',
      render: (_, record) => (
        <div>
          <div className='flex items-center gap-1'>
            <FaEnvelope className='text-[#00B894] w-4 h-4' />
            <a
              href={`mailto:${record.email}`}
              className='text-inherit hover:text-[#00B894] dark:text-gray-300'
            >
              {record.email}
            </a>
          </div>
        </div>
      ),
    },
    {
      title: 'Grade',
      render: (_, record) => record.gradeName || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <span className={`capitalize ${status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Action',
      render: (_, record) => (
        <div className='flex space-x-4'>
          <RiDeleteBinLine
            className='w-5 h-5 cursor-pointer text-[#801818]'
            onClick={() => handleDeleteClick(record)}
          />
          <TbEdit
            className='w-5 h-5 cursor-pointer text-[#00B894]'
            onClick={() => handleEditClick(record)}
          />
        </div>
      ),
    },
  ];

  const managerColumns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      render: (text, record) => (
        <Space className='flex flex-col lg:flex lg:flex-row items-start'>
          <Avatar src='https://i.pravatar.cc/50?img=10' />
          <Text>{record.fullName}</Text>
        </Space>
      ),
    },
    {
      title: 'Contact',
      render: (_, record) => (
        <div>
          <div className='flex items-center gap-1'>
            <FaEnvelope className='text-[#00B894] w-4 h-4' />
            <a
              href={`mailto:${record.email}`}
              className='text-inherit hover:text-[#00B894] dark:text-gray-300'
            >
              {record.email}
            </a>
          </div>
        </div>
      ),
    },
    {
      title: 'Department',
      render: (_, record) => record.departmentDisplayName || record.department || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <span className={`capitalize ${status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Action',
      render: (_, record) => (
        <div className='flex space-x-4'>
          <RiDeleteBinLine
            className='w-5 h-5 cursor-pointer text-[#801818]'
            onClick={() => handleDeleteClick(record)}
          />
          <TbEdit
            className='w-5 h-5 cursor-pointer text-[#00B894]'
            onClick={() => handleEditClick(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        variant='outlined'
        className='dark:!bg-gray-800 dark:!border-gray-700'
        style={{
          borderRadius: 12,
          marginTop: 24,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <Row justify='space-between' align='middle' className='mb-4'>
          <Col>
            <Title level={5} style={{ marginBottom: 0 }} className='dark:text-gray-200'>
              User Management
            </Title>
          </Col>
        </Row>

        {/* Tabs */}
        <div className='flex justify-center mb-6'>
          <div className='flex flex-col md:flex-row items-center justify-center gap-5 md:gap-20'>
            <Button
              type={activeTab === 'students' ? 'primary' : 'text'}
              icon={<PiStudentFill className='w-5 h-5' />}
              onClick={() => setActiveTab('students')}
              className={`rounded-lg ${
                activeTab === 'students'
                  ? 'bg-[#00B894] text-white hover:!bg-[#00b894]'
                  : 'bg-[#f2f3f4] dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Students
            </Button>
            <Button
              type={activeTab === 'managers' ? 'primary' : 'text'}
              icon={<TeamOutlined />}
              onClick={() => setActiveTab('managers')}
              className={`rounded-lg  ${
                activeTab === 'managers'
                  ? 'bg-[#00B894] text-white hover:!bg-[#00b894]'
                  : 'bg-[#f2f3f4] dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Managers
            </Button>
          </div>
        </div>

        {/* Filters & Actions */}
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
                className='hover:!border-[#00b894]'
              />
              {activeTab === 'students' ? (
                <Select 
                  value={gradeFilter || 'all'} 
                  onChange={setGradeFilter}
                  className='w-40'
                  placeholder='Filter by Grade'
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option value='all'>All Grades</Option>
                  {grades.map(grade => (
                    <Option key={grade.id} value={grade.id} label={grade.gradeName}>
                      {grade.gradeName}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Select 
                  value={departmentFilter || 'all'} 
                  onChange={setDepartmentFilter}
                  className='w-40'
                  placeholder='Filter by Department'
                >
                  <Option value='all'>All Departments</Option>
                  <Option value='Administration'>Administration</Option>
                  <Option value='Academics'>Academics</Option>
                  <Option value='Operations'>Operations</Option>
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
            <Button
              className='hover:!border-[#00b894] hover:!text-[#00b894] rounded-lg'
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              Manually Add
            </Button>
            <Button
              icon={<UploadOutlined />}
              className='hover:!border-[#00b894] hover:!text-[#00b894] rounded-lg'
              onClick={() => setIsCSVImportModalOpen(true)}
            >
              Import CSV
            </Button>
          </Col>
        </Row>

        {/* Loading State */}
        {isLoading ? (
          <div className='flex justify-center items-center py-12'>
            <Spin size='large' />
          </div>
        ) : data.length === 0 ? (
          <Empty description='No users found' />
        ) : (
          <>
            {/* Responsive View */}
            {isMobileView ? (
              <Table
                columns={activeTab === 'students' ? studentColumns : managerColumns}
                dataSource={data}
                pagination={{
                  current: pagination?.currentPage || page,
                  pageSize: pagination?.limit || limit,
                  total: pagination?.total || 0,
                  onChange: setPage,
                }}
                rowKey='id'
                scroll={{ x: true }}
              />
            ) : (
              <>
                {/* Headings */}
            <div
              className='grid items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 px-4 py-3 border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 box-border rounded-lg shadow-sm'
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

            {/* List */}
            <List
              itemLayout='horizontal'
              dataSource={data}
              renderItem={item => {
                // Map API response to UI format
                const displayItem = activeTab === 'students' ? {
                  id: item.id,
                  name: item.fullName,
                  email: item.email,
                  grade: item.gradeName || 'N/A',
                  contact: item.contact || 'N/A',
                  guardian: item.guardian || 'N/A',
                  guardianContact: item.guardianContact || 'N/A',
                  guardianEmail: item.guardianEmail || 'N/A',
                  address: item.address || 'N/A',
                  zip: item.zip || 'N/A',
                } : {
                  id: item.id,
                  name: item.fullName,
                  email: item.email,
                  role: 'Manager',
                  department: item.departmentDisplayName || item.department || 'N/A',
                  contact: item.contact || 'N/A',
                  address: item.address || 'N/A',
                  zip: item.zip || 'N/A',
                };

                return (
                <List.Item
                  className='dark:!bg-gray-800 dark:!border-gray-700'
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
                        <Avatar
                          src='https://i.pravatar.cc/50?img=10'
                          size={40}
                        />
                        <Text className='dark:text-gray-200'>{displayItem.name}</Text>
                      </Space>
                    </Col>

                    <Col flex='2'>
                      <div className='flex flex-col'>
          <div className='flex items-center gap-1'>
            <MdPhone className='text-[#00B894] w-4 h-4' />
            <a
              href={`tel:${displayItem.contact}`}
              className='text-inherit hover:text-[#00B894] dark:text-gray-300'
            >
              {displayItem.contact}
            </a>
          </div>
                        <div className='flex items-center gap-1 text-gray-600 dark:text-gray-400'>
                          <FaEnvelope className='text-[#00B894] w-4 h-4' />
                          <a
                            href={`mailto:${displayItem.email}`}
                            className='text-inherit hover:text-[#00B894] dark:text-gray-300'
                          >
                            {displayItem.email}
                          </a>
                        </div>
                      </div>
                    </Col>

                    {activeTab === 'students' ? (
                      <>
                        <Col flex='1' className='dark:text-gray-200'>{displayItem.grade}</Col>
                        <Col flex='2'>
                          <Text strong className='dark:text-gray-200'>{displayItem.guardian}</Text>
                          <div className='flex flex-col'>
                            <div className='flex items-center gap-1'>
                              <MdPhone className='text-[#00B894] w-4 h-4' />
                              <a
                                href={`tel:${displayItem.guardianContact}`}
                                className='text-inherit hover:text-[#00B894] dark:text-gray-300'
                              >
                                {displayItem.guardianContact}
                              </a>
                            </div>
                            <div className='flex items-center gap-1 text-gray-600 dark:text-gray-400'>
                              <FaEnvelope className='text-[#00B894] w-4 h-4' />
                              <a
                                href={`mailto:${displayItem.guardianEmail}`}
                                className='text-inherit hover:text-[#00B894] dark:text-gray-300'
                              >
                                {displayItem.guardianEmail}
                              </a>
                            </div>
                          </div>
                        </Col>
                        <Col flex='2' className='dark:text-gray-200'>{displayItem.address}</Col>
                        <Col flex='1' className='dark:text-gray-200'>{displayItem.zip}</Col>
                        <Col flex='1'>
                          <div className='flex space-x-4'>
                            <Col flex='1'>
                              <div className='flex space-x-4 justify-center'>
                                <RiDeleteBinLine
                                  className='w-5 h-5 cursor-pointer text-[#801818]'
                                  onClick={() => handleDeleteClick(item)}
                                />
                                <TbEdit
                                  className='w-5 h-5 cursor-pointer text-[#00B894]'
                                  onClick={() => handleEditClick(item)}
                                />
                              </div>
                            </Col>
                          </div>
                        </Col>
                      </>
                    ) : (
                      <>
                        <Col flex='1' className='dark:text-gray-200'>{displayItem.department}</Col>
                        <Col flex='2' className='dark:text-gray-200'>{displayItem.address}</Col>
                        <Col flex='1' className='dark:text-gray-200'>{displayItem.zip}</Col>
                        <Col flex='1'>
                          <div className='flex space-x-4'>
                            <RiDeleteBinLine
                              className='w-5 h-5 cursor-pointer text-[#801818]'
                              onClick={() => handleDeleteClick(item)}
                            />
                            <TbEdit
                              className='w-5 h-5 cursor-pointer text-[#00B894]'
                              onClick={() => handleEditClick(item)}
                            />
                          </div>
                        </Col>
                      </>
                    )}
                  </Row>
                </List.Item>
                );
              }}
            />
            
                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className='flex justify-center mt-6'>
                    <Pagination
                      current={pagination.currentPage || page}
                      total={pagination.total || 0}
                      pageSize={pagination.limit || limit}
                      onChange={setPage}
                      showSizeChanger={false}
                      showTotal={(total) => `Total ${total} users`}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Card>

      <AddUserModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        activeTab={activeTab}
      />
      <EditUserModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSuccess}
        user={selectedUser}
        activeTab={activeTab}
      />
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleSuccess}
        user={selectedUser}
        activeTab={activeTab}
      />
      <CSVImportModal
        open={isCSVImportModalOpen}
        onClose={() => setIsCSVImportModalOpen(false)}
        onSuccess={handleSuccess}
        activeTab={activeTab}
      />
    </>
  );
};
