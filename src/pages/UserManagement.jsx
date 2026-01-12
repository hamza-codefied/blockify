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
import { ScheduleAssignmentModal } from '@/components/userManagement/ScheduleAssignmentModal';
import { useGetStudents } from '@/hooks/useStudents';
import { useGetManagers } from '@/hooks/useManagers';
import { useGetGrades } from '@/hooks/useGrades';
import { useGetRoles } from '@/hooks/useRoles';
import {
  formatGradeDisplayName,
  getDefaultGradeQueryParams,
} from '@/utils/grade.utils';
import { Typography as PageTitle } from '@/components/common/PageTitle';
import { Typography } from 'antd';
import { LockedSection } from '@/components/common/LockedSection';
import { PERMISSIONS } from '@/utils/permissions';

const { Text } = Typography;
const { Option } = Select;

export const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [gradeFilter, setGradeFilter] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCSVImportModalOpen, setIsCSVImportModalOpen] = useState(false);
  const [isScheduleAssignmentModalOpen, setIsScheduleAssignmentModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch grades for filter dropdown
  const { data: gradesData } = useGetGrades({
    limit: 100,
    ...getDefaultGradeQueryParams(),
  });
  const grades = gradesData?.data || [];

  // Fetch roles for manager role filter
  const { data: rolesData } = useGetRoles(activeTab === 'managers');
  const roles = rolesData?.data || [];

  // Filter roles: only "manager" default role OR custom roles (isSystemRole = false)
  const availableRoles = useMemo(() => {
    if (activeTab !== 'managers') return [];
    return roles.filter(
      role => role.roleName === 'manager' || !role.isSystemRole
    );
  }, [roles, activeTab]);

  // Query params for API
  const studentsParams = useMemo(
    () => ({
      page,
      limit,
      sort: 'created_at',
      sortOrder: 'DESC',
      ...(gradeFilter && gradeFilter !== 'all' && { gradeId: gradeFilter }),
      ...(search && { search }),
    }),
    [page, limit, gradeFilter, search]
  );

  const managersParams = useMemo(
    () => ({
      page,
      limit,
      sort: 'created_at',
      sortOrder: 'DESC',
      ...(roleFilter && roleFilter !== 'all' && { roleId: roleFilter }),
      ...(search && { search }),
    }),
    [page, limit, roleFilter, search]
  );

  // Fetch data
  const {
    data: studentsData,
    isLoading: studentsLoading,
    refetch: refetchStudents,
  } = useGetStudents(studentsParams);
  const {
    data: managersData,
    isLoading: managersLoading,
    refetch: refetchManagers,
  } = useGetManagers(managersParams);

  const isLoading =
    activeTab === 'students' ? studentsLoading : managersLoading;

  // Backend returns: { success: true, data: [...], pagination: {...} }
  const data =
    activeTab === 'students'
      ? studentsData?.data || []
      : managersData?.data || [];
  const pagination =
    activeTab === 'students'
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
      title: 'Contact Information',
      render: (_, record) => (
        <div className='flex flex-col'>
          <div className='flex items-center gap-1'>
            <MdPhone className='text-[#00B894] w-4 h-4' />
            <a
              href={`tel:${record.phone || ''}`}
              className='text-inherit hover:text-[#00B894] dark:text-gray-300'
            >
              {record.phone || 'N/A'}
            </a>
          </div>
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
      title: 'Guardian Name',
      render: (_, record) => record.guardian_name || 'N/A',
    },
    {
      title: 'Guardian Contact',
      render: (_, record) => (
        <div className='flex flex-col'>
          <div className='flex items-center gap-1'>
            <MdPhone className='text-[#00B894] w-4 h-4' />
            <a
              href={`tel:${record.guardian_phone || ''}`}
              className='text-inherit hover:text-[#00B894] dark:text-gray-300'
            >
              {record.guardian_phone || 'N/A'}
            </a>
          </div>
          {record.guardian_email && (
            <div className='flex items-center gap-1'>
              <FaEnvelope className='text-[#00B894] w-4 h-4' />
              <a
                href={`mailto:${record.guardian_email}`}
                className='text-inherit hover:text-[#00B894] dark:text-gray-300'
              >
                {record.guardian_email}
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Address',
      render: (_, record) => record.address || 'N/A',
    },
    {
      title: 'Zip Code',
      render: (_, record) => record.zipcode || 'N/A',
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
      title: 'Role',
      render: (_, record) =>
        record.role?.displayName || record.role?.roleName || 'N/A',
    },
    {
      title: 'Contact Information',
      render: (_, record) => (
        <div className='flex flex-col'>
          <div className='flex items-center gap-1'>
            <MdPhone className='text-[#00B894] w-4 h-4' />
            <a
              href={`tel:${record.phone || ''}`}
              className='text-inherit hover:text-[#00B894] dark:text-gray-300'
            >
              {record.phone || 'N/A'}
            </a>
          </div>
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
      title: 'Address',
      render: (_, record) => record.address || 'N/A',
    },
    {
      title: 'Zip Code',
      render: (_, record) => record.zipcode || 'N/A',
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
      <div>
        <div className='flex justify-between items-center'>
          <PageTitle variant='primary' className="mb-4">User Management</PageTitle>
        </div>

        <Card
          variant='outlined'
          className='dark:!bg-gray-800 dark:!border-gray-700 rounded-[10px] shadow-sm'
        >
          {/* Tabs */}
          <div className='flex justify-center mb-6'>
            <div className='flex flex-col md:flex-row items-center justify-center gap-5 md:gap-20'>
              <Button
                type={activeTab === 'students' ? 'primary' : 'text'}
                icon={<PiStudentFill className='w-5 h-5' />}
                onClick={() => setActiveTab('students')}
                className={`flex w-[256px] h-[52px] justify-center items-center gap-3 shrink-0 rounded-[10px] text-base ${
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
                className={`flex w-[256px] h-[52px] justify-center items-center gap-3 shrink-0 rounded-[10px] text-base ${
                  activeTab === 'managers'
                    ? 'bg-[#00B894] text-white hover:!bg-[#00b894]'
                    : 'bg-[#f2f3f4] dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                Managers
              </Button>
            </div>
          </div>

          <LockedSection 
            permission={activeTab === 'students' ? PERMISSIONS.STUDENTS_READ : PERMISSIONS.MANAGERS_READ}
            lockMessage={`You do not have permission to view ${activeTab === 'students' ? 'students' : 'managers'}`}
          >
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
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    <Option value='all'>All Grades</Option>
                    {grades.map(grade => (
                      <Option
                        key={grade.id}
                        value={grade.id}
                        label={formatGradeDisplayName(grade)}
                      >
                        {formatGradeDisplayName(grade)}
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <Select
                    value={roleFilter || 'all'}
                    onChange={setRoleFilter}
                    className='w-40'
                    placeholder='Filter by Role'
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    <Option value='all'>All Roles</Option>
                    {availableRoles.map(role => (
                      <Option
                        key={role.id}
                        value={role.id}
                        label={role.displayName || role.roleName}
                      >
                        {role.displayName || role.roleName}
                      </Option>
                    ))}
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
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                style={{
                  backgroundColor: '#00B894',
                  borderColor: '#00B894',
                }}
                className='hover:!bg-[#00b894] hover:!border-[#00b894]'
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
              {activeTab === 'students' && (
                <Button
                  icon={<UploadOutlined />}
                  className='hover:!border-[#00b894] hover:!text-[#00b894] rounded-lg'
                  onClick={() => setIsScheduleAssignmentModalOpen(true)}
                >
                  Assign Schedules with CSV
                </Button>
              )}
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
                  columns={
                    activeTab === 'students' ? studentColumns : managerColumns
                  }
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
                          ? '2fr 2fr 1fr 1.5fr 1.5fr 1.5fr 1fr 1fr'
                          : '2fr 1fr 2fr 2fr 1fr 1fr',
                      gap: '8px',
                    }}
                  >
                    <div>Name</div>
                    {activeTab === 'students' ? (
                      <>
                        <div>Contact Information</div>
                        <div>Grade</div>
                        <div>Guardian Name</div>
                        <div>Guardian Contact</div>
                        <div>Address</div>
                        <div>Zip Code</div>
                        <div>Action</div>
                      </>
                    ) : (
                      <>
                        <div>Role</div>
                        <div>Contact Information</div>
                        <div>Address</div>
                        <div>Zip Code</div>
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
                      const displayItem =
                        activeTab === 'students'
                          ? {
                              id: item.id,
                              name: item.fullName,
                              email: item.email,
                              grade: item.gradeName || 'N/A',
                              contact: item.phone || 'N/A',
                              guardian: item.guardian_name || 'N/A',
                              guardianContact: item.guardian_phone || 'N/A',
                              guardianEmail: item.guardian_email || 'N/A',
                              address: item.address || 'N/A',
                              zip: item.zipcode || 'N/A',
                            }
                          : {
                              id: item.id,
                              name: item.fullName,
                              email: item.email,
                              role:
                                item.role?.displayName ||
                                item.role?.roleName ||
                                'N/A',
                              contact: item.phone || 'N/A',
                              address: item.address || 'N/A',
                              zip: item.zipcode || 'N/A',
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
                            <Col flex='2' style={{ minWidth: 0, overflow: 'hidden' }}>
                              <Space>
                                <Avatar
                                  src='https://i.pravatar.cc/50?img=10'
                                  size={40}
                                />
                                <Text className='dark:text-gray-200' style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {displayItem.name}
                                </Text>
                              </Space>
                            </Col>

                            {activeTab === 'students' ? (
                              <>
                                <Col flex='2' style={{ minWidth: 0, overflow: 'hidden' }}>
                                  <div className='flex flex-col'>
                                    <div className='flex items-center gap-1'>
                                      <MdPhone className='text-[#00B894] w-4 h-4 flex-shrink-0' />
                                      <a
                                        href={`tel:${displayItem.contact}`}
                                        className='text-inherit hover:text-[#00B894] dark:text-gray-300'
                                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                      >
                                        {displayItem.contact}
                                      </a>
                                    </div>
                                    <div className='flex items-center gap-1 text-gray-600 dark:text-gray-400'>
                                      <FaEnvelope className='text-[#00B894] w-4 h-4 flex-shrink-0' />
                                      <a
                                        href={`mailto:${displayItem.email}`}
                                        className='text-inherit hover:text-[#00B894] dark:text-gray-300'
                                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                      >
                                        {displayItem.email}
                                      </a>
                                    </div>
                                  </div>
                                </Col>
                                <Col flex='1' style={{ minWidth: 0, overflow: 'hidden' }} className='dark:text-gray-200'>
                                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayItem.grade}</div>
                                </Col>
                                <Col flex='1.5' style={{ minWidth: 0, overflow: 'hidden' }} className='dark:text-gray-200'>
                                  <Text strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{displayItem.guardian}</Text>
                                </Col>
                                <Col flex='1.5' style={{ minWidth: 0, overflow: 'hidden' }}>
                                  <div className='flex flex-col'>
                                    <div className='flex items-center gap-1'>
                                      <MdPhone className='text-[#00B894] w-4 h-4 flex-shrink-0' />
                                      <a
                                        href={`tel:${displayItem.guardianContact}`}
                                        className='text-inherit hover:text-[#00B894] dark:text-gray-300'
                                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                      >
                                        {displayItem.guardianContact}
                                      </a>
                                    </div>
                                    {displayItem.guardianEmail && displayItem.guardianEmail !== 'N/A' && (
                                      <div className='flex items-center gap-1 text-gray-600 dark:text-gray-400'>
                                        <FaEnvelope className='text-[#00B894] w-4 h-4 flex-shrink-0' />
                                        <a
                                          href={`mailto:${displayItem.guardianEmail}`}
                                          className='text-inherit hover:text-[#00B894] dark:text-gray-300'
                                          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                        >
                                          {displayItem.guardianEmail}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </Col>
                                <Col flex='1.5' style={{ minWidth: 0, overflow: 'hidden' }} className='dark:text-gray-200'>
                                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayItem.address}</div>
                                </Col>
                                <Col flex='1' style={{ minWidth: 0, overflow: 'hidden' }} className='dark:text-gray-200'>
                                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayItem.zip}</div>
                                </Col>
                                <Col flex='1' style={{ minWidth: 0 }}>
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
                              </>
                            ) : (
                              <>
                                <Col flex='1' style={{ minWidth: 0, overflow: 'hidden' }} className='dark:text-gray-200'>
                                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayItem.role}</div>
                                </Col>
                                <Col flex='2' style={{ minWidth: 0, overflow: 'hidden' }}>
                                  <div className='flex flex-col'>
                                    <div className='flex items-center gap-1'>
                                      <MdPhone className='text-[#00B894] w-4 h-4 flex-shrink-0' />
                                      <a
                                        href={`tel:${displayItem.contact}`}
                                        className='text-inherit hover:text-[#00B894] dark:text-gray-300'
                                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                      >
                                        {displayItem.contact}
                                      </a>
                                    </div>
                                    <div className='flex items-center gap-1 text-gray-600 dark:text-gray-400'>
                                      <FaEnvelope className='text-[#00B894] w-4 h-4 flex-shrink-0' />
                                      <a
                                        href={`mailto:${displayItem.email}`}
                                        className='text-inherit hover:text-[#00B894] dark:text-gray-300'
                                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                      >
                                        {displayItem.email}
                                      </a>
                                    </div>
                                  </div>
                                </Col>
                                <Col flex='2' style={{ minWidth: 0, overflow: 'hidden' }} className='dark:text-gray-200'>
                                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayItem.address}</div>
                                </Col>
                                <Col flex='1' style={{ minWidth: 0, overflow: 'hidden' }} className='dark:text-gray-200'>
                                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayItem.zip}</div>
                                </Col>
                                <Col flex='1' style={{ minWidth: 0 }}>
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
                        showTotal={total => `Total ${total} users`}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}
          </LockedSection>
        </Card>
      </div>

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

      {/* Schedule Assignment Modal - Only for students */}
      {activeTab === 'students' && (
        <ScheduleAssignmentModal
          open={isScheduleAssignmentModalOpen}
          onClose={() => setIsScheduleAssignmentModalOpen(false)}
          onSuccess={() => {
            setIsScheduleAssignmentModalOpen(false);
            handleSuccess();
          }}
        />
      )}
    </>
  );
};
