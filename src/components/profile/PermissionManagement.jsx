'use client';
import React, { useState } from 'react';
import { Card, List, Row, Col, Typography } from 'antd';
import { TbEdit } from 'react-icons/tb';
import { ManagerPermissionModal } from './ManagerPermissionModal';
import './permission-management.css';

const { Title, Text } = Typography;

export const PermissionManagement = () => {
  const [openModal, setOpenModal] = useState(false);

  const roles = [
    { id: 1, name: 'Student', permissions: '20 Permissions' },
    { id: 2, name: 'Manager', permissions: '40 Permissions' },
  ];

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

          <div className='flex-1 overflow-y-auto'>
            <List
              itemLayout='horizontal'
              dataSource={roles}
              split={false}
              renderItem={role => (
                <List.Item className='permission-list-item flex items-center'>
                  <Row align='middle' style={{ width: '100%' }}>
                    <Col flex='2'>
                      <Text strong>{role.name}</Text>
                    </Col>
                    <Col flex='2'>
                      <Text>{role.permissions}</Text>
                    </Col>
                    <Col flex='1' style={{ textAlign: 'right' }}>
                      <TbEdit
                        className='text-[#00B894] cursor-pointer w-5 h-5 inline'
                        onClick={() => {
                          if (role.name === 'Manager') setOpenModal(true);
                        }}
                      />
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </div>
        </div>
      </Card>

      {/* Modal Render */}
      <ManagerPermissionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
};
