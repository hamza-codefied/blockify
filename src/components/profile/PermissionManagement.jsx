'use client';
import React, { useState } from 'react';
import {
  Card,
  List,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Tag,
  Modal,
  message,
  Pagination,
  Button,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TbEdit, TbEye, TbTrash } from 'react-icons/tb';
import { ManagerPermissionModal } from './ManagerPermissionModal';
import { CreateRoleModal } from './CreateRoleModal';
import { useGetRoles, useDeleteRole } from '@/hooks/useRoles';
import { Typography as PageTitle } from '@/components/common/PageTitle';
import './permission-management.css';

const { Text } = Typography;
const { confirm } = Modal;

export const PermissionManagement = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Fetch roles with pagination
  const {
    data: rolesData,
    isLoading,
    refetch,
  } = useGetRoles({
    page,
    limit,
    sort: 'created_at',
    sortOrder: 'DESC',
  });
  const deleteRoleMutation = useDeleteRole();

  // Backend returns { success: true, data: [...roles], pagination: {...} }
  // Student role is already excluded from backend
  const roles = rolesData?.data || [];
  const pagination = rolesData?.pagination || {};

  const handleEditRole = role => {
    setSelectedRole(role);
    setIsReadOnly(false);
    setOpenModal(true);
  };

  const handlePreviewRole = role => {
    setSelectedRole(role);
    setIsReadOnly(true);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRole(null);
    setIsReadOnly(false);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleDeleteRole = role => {
    confirm({
      title: 'Delete Role',
      content: `Are you sure you want to delete the role "${role.displayName || role.roleName}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await deleteRoleMutation.mutateAsync(role.id);
          refetch();
          // If we deleted the last item on the current page and it's not page 1, go back a page
          if (roles.length === 1 && page > 1) {
            setPage(page - 1);
          }
        } catch (error) {
          // Error is handled by the mutation hook
        }
      },
    });
  };

  const handlePageChange = newPage => {
    setPage(newPage);
  };

  return (
    <>
      <Card
        className='permission-management-card border-2 border-gray-200 w-full shadow-lg flex flex-col'
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
        }}
        bodyStyle={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <PageTitle variant='primary'>Permission Management</PageTitle>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => setOpenCreateModal(true)}
            style={{
              backgroundColor: '#00B894',
              borderColor: '#00B894',
            }}
            className='hover:!bg-[#00b894] hover:!border-[#00b894]'
          >
            Create Role
          </Button>
        </div>

        <div
          className='permission-management-wrapper flex-1 flex flex-col'
          style={{ marginTop: '10px' }}
        >
          <Row
            justify='space-between'
            className='permission-management-header text-[16px] font-bold'
          >
            <Col flex='2'>Role</Col>
            <Col flex='2'>Permissions</Col>
            <Col flex='1' style={{ textAlign: 'right' }}>
              Action
            </Col>
          </Row>

          <div
            className='mt-2 text-base'
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {isLoading ? (
              <div className='flex justify-center items-center py-8'>
                <Spin size='large' />
              </div>
            ) : roles.length === 0 ? (
              <Empty description='No roles found' className='py-8' />
            ) : (
              <>
                <div>
                  <List
                    itemLayout='horizontal'
                    dataSource={roles}
                    split={false}
                    renderItem={role => {
                      // Cannot edit Admin role permissions (backend enforces this too)
                      // Cannot delete default roles (admin, manager, student)
                      const canEdit = role.roleName !== 'admin';
                      const canDelete =
                        !role.isDefault && role.roleName !== 'admin';
                      return (
                        <List.Item className='permission-list-item flex items-center text-base'>
                          <Row
                            align='middle'
                            style={{ width: '100%' }}
                            className='text-base'
                          >
                            <Col flex='2'>
                              <div className='flex items-center gap-2 text-base'>
                                <Text strong className='text-base'>
                                  {role.displayName || role.roleName}
                                </Text>
                                {role.isDefault && (
                                  <Tag color='blue' size='small'>
                                    Default
                                  </Tag>
                                )}
                              </div>
                            </Col>
                            <Col flex='2'>
                              <Text type='secondary' className='text-base'>
                                {role.description || 'No description'}
                              </Text>
                            </Col>
                            <Col flex='1' style={{ textAlign: 'right' }}>
                              <div className='flex items-center justify-end gap-3'>
                                {canEdit ? (
                                  <TbEdit
                                    className='text-[#00B894] cursor-pointer w-5 h-5 hover:text-[#019a7d] transition'
                                    onClick={() => handleEditRole(role)}
                                    title='Edit permissions'
                                  />
                                ) : (
                                  <TbEye
                                    className='text-[#00B894] cursor-pointer w-5 h-5 hover:text-[#019a7d] transition'
                                    onClick={() => handlePreviewRole(role)}
                                    title='Preview permissions'
                                  />
                                )}
                                {canDelete && (
                                  <TbTrash
                                    className='text-red-500 cursor-pointer w-5 h-5 hover:text-red-700 transition'
                                    onClick={() => handleDeleteRole(role)}
                                    title='Delete role'
                                  />
                                )}
                              </div>
                            </Col>
                          </Row>
                        </List.Item>
                      );
                    }}
                  />
                </div>
                {/* Pagination Footer */}
                {pagination.totalPages > 1 && (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: '1px solid #f0f0f0',
                    }}
                  >
                    <Row justify='space-between' align='middle'>
                      <Col>
                        <Text type='secondary' style={{ fontSize: 12 }}>
                          {pagination.total
                            ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, pagination.total)} of ${pagination.total}`
                            : 'No roles'}
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
                  </div>
                )}
                {pagination.totalPages <= 1 && pagination.total > 0 && (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: '1px solid #f0f0f0',
                    }}
                  >
                    <Text type='secondary' style={{ fontSize: 12 }}>
                      Showing {pagination.total} of {pagination.total} roles
                    </Text>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Permission Edit Modal */}
      {selectedRole && (
        <ManagerPermissionModal
          open={openModal}
          role={selectedRole}
          readOnly={isReadOnly}
          onClose={handleCloseModal}
        />
      )}

      {/* Create Role Modal */}
      <CreateRoleModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
};
