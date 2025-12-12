'use client';
import React, { useState } from 'react';
import { Card, List, Row, Col, Typography, Spin, Empty, Tag, Button, Modal, message } from 'antd';
import { TbEdit, TbEye, TbPlus, TbTrash } from 'react-icons/tb';
import { ManagerPermissionModal } from './ManagerPermissionModal';
import { CreateRoleModal } from './CreateRoleModal';
import { useGetRoles, useDeleteRole } from '@/hooks/useRoles';
import './permission-management.css';

const { Title, Text } = Typography;
const { confirm } = Modal;

export const PermissionManagement = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const { data: rolesData, isLoading, refetch } = useGetRoles();
  const deleteRoleMutation = useDeleteRole();

  // Filter out student role (only needed for mobile, not for permission management)
  const roles = (rolesData?.data || []).filter(role => role.roleName !== 'student');

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsReadOnly(false);
    setOpenModal(true);
  };

  const handlePreviewRole = (role) => {
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

  const handleDeleteRole = (role) => {
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
        } catch (error) {
          // Error is handled by the mutation hook
        }
      },
    });
  };

  return (
    <>
      <Card className='permission-management-card border-2 border-gray-200 w-full shadow-lg lg:w-2/3 h-full flex flex-col'>
        <Row justify='space-between' align='middle' gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={5} style={{ marginBottom: 0 }}>
              Permission Management
            </Title>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Button
              type='primary'
              icon={<TbPlus className='w-4 h-4' />}
              onClick={() => setOpenCreateModal(true)}
              className='bg-[#00B894] hover:!bg-[#019a7d] text-white font-semibold'
            >
              Create Role
            </Button>
          </Col>
        </Row>

        <div className='permission-management-wrapper flex-1 flex flex-col mt-4'>
          <Row justify='space-between' className='permission-management-header'>
            <Col flex='2'>Role</Col>
            <Col flex='2'>Permissions</Col>
            <Col flex='1' style={{ textAlign: 'right' }}>
              Action
            </Col>
          </Row>

          <div className='flex-1 mt-2 overflow-y-auto'>
            {isLoading ? (
              <div className='flex justify-center items-center py-8'>
                <Spin size='large' />
              </div>
            ) : roles.length === 0 ? (
              <Empty description='No roles found' className='py-8' />
            ) : (
              <List
                itemLayout='horizontal'
                dataSource={roles}
                split={false}
                renderItem={role => {
                  // Cannot edit Admin role permissions (backend enforces this too)
                  // Cannot delete default roles (admin, manager, student)
                  const canEdit = role.roleName !== 'admin';
                  const canDelete = !role.isDefault && role.roleName !== 'admin';
                  return (
                    <List.Item className='permission-list-item flex items-center'>
                      <Row align='middle' style={{ width: '100%' }}>
                        <Col flex='2'>
                          <div className='flex items-center gap-2'>
                            <Text strong>{role.displayName || role.roleName}</Text>
                            {role.isDefault && (
                              <Tag color='blue' size='small'>Default</Tag>
                            )}
                          </div>
                        </Col>
                        <Col flex='2'>
                          <Text type='secondary'>
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
