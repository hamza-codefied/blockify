'use client';
import React, { useState } from 'react';
import { Card, List, Row, Col, Typography, Spin, Empty, Tag } from 'antd';
import { TbEdit, TbEye } from 'react-icons/tb';
import { ManagerPermissionModal } from './ManagerPermissionModal';
import { useGetRoles } from '@/hooks/useRoles';
import './permission-management.css';

const { Title, Text } = Typography;

export const PermissionManagement = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const { data: rolesData, isLoading } = useGetRoles();

  const roles = rolesData?.data || [];

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

  return (
    <>
      <Card className='permission-management-card border-2 border-gray-200 w-full shadow-lg lg:w-2/3 h-full flex flex-col'>
        <Row justify='space-between' align='middle' gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={5} style={{ marginBottom: 0 }}>
              Permission Management
            </Title>
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
                  const canEdit = role.roleName !== 'admin';
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
                          {canEdit ? (
                            <TbEdit
                              className='text-[#00B894] cursor-pointer w-5 h-5 inline hover:text-[#019a7d] transition'
                              onClick={() => handleEditRole(role)}
                              title='Edit permissions'
                            />
                          ) : (
                            <TbEye
                              className='text-[#00B894] cursor-pointer w-5 h-5 inline hover:text-[#019a7d] transition'
                              onClick={() => handlePreviewRole(role)}
                              title='Preview permissions'
                            />
                          )}
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

      {/* Modal Render */}
      {selectedRole && (
        <ManagerPermissionModal
          open={openModal}
          role={selectedRole}
          readOnly={isReadOnly}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
