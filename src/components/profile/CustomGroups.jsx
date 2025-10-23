'use client';
import React, { useState } from 'react';
import {
  Card,
  List,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  Tag,
  Avatar,
  Divider,
} from 'antd';
import { AiOutlineEye } from 'react-icons/ai';
import './grades.css';
import { CustomGroupModal } from './CustomGroupModal';

const { Title, Text } = Typography;

export const CustomGroups = () => {
  const [groups, setGroups] = useState([
    {
      id: 1,
      session_name: 'SAT Class',
      students: ['Aiden Andrews', 'Sophia Johnson'],
      selectedDays: ['Monday', 'Wednesday'],
      times: {
        Monday: { start: '09:00', end: '10:30' },
        Wednesday: { start: '11:00', end: '12:30' },
      },
    },
    {
      id: 2,
      session_name: 'MCAT Class',
      students: ['Michael Brown', 'Emily Davis'],
      selectedDays: ['Tuesday', 'Thursday'],
      times: {
        Tuesday: { start: '10:00', end: '11:30' },
        Thursday: { start: '12:00', end: '13:30' },
      },
    },
    {
      id: 3,
      session_name: 'MCAT Class',
      students: ['Michael Brown', 'Emily Davis'],
      selectedDays: ['Tuesday', 'Thursday'],
      times: {
        Tuesday: { start: '10:00', end: '11:30' },
        Thursday: { start: '12:00', end: '13:30' },
      },
    },
    {
      id: 4,
      session_name: 'MCAT Class',
      students: ['Michael Brown', 'Emily Davis'],
      selectedDays: ['Tuesday', 'Thursday'],
      times: {
        Tuesday: { start: '10:00', end: '11:30' },
        Thursday: { start: '12:00', end: '13:30' },
      },
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedGroup, setSelectedGroup] = useState(null);

  // ===== Handlers =====
  const handleAddClick = () => {
    setModalMode('add');
    setSelectedGroup(null);
    setModalOpen(true);
  };

  const handleViewClick = group => {
    setSelectedGroup(group);
    setViewModalOpen(true);
  };

  return (
    <>
      <Card
        variant='outlined'
        style={{
          borderRadius: 12,
          marginTop: 22,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
        className='w-full lg:w-1/3 bg-white rounded-xl shadow-lg'
      >
        {/* ===== Header ===== */}
        <Row justify='space-between' align='middle' gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Title level={5} style={{ marginBottom: 0 }}>
              Custom Groups
            </Title>
          </Col>
          <Col xs={24} md={16} style={{ textAlign: 'right' }}>
            <Button
              type='text'
              className='add-grade-btn'
              onClick={handleAddClick}
            >
              Add Custom Group +
            </Button>
          </Col>
        </Row>

        {/* ===== Scrollable Table Wrapper ===== */}
        <div className='grades-wrapper'>
          <Row
            justify='space-between'
            className='grades-header'
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
            <Col flex='2'>Session Name</Col>
            <Col flex='1'>No of Students</Col>
            <Col flex='1' className='text-right'>
              Action
            </Col>
          </Row>

          <List
            itemLayout='horizontal'
            dataSource={groups}
            renderItem={group => (
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
                    <Text>{group.session_name}</Text>
                  </Col>
                  <Col flex='1'>
                    <Text>{group.students.length}</Text>
                  </Col>
                  <Col flex='1' className='flex justify-end'>
                    <AiOutlineEye
                      size={20}
                      color='#00B894'
                      className='cursor-pointer'
                      onClick={() => handleViewClick(group)}
                    />
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </div>

        {/* ===== Footer ===== */}
        <Row justify='space-between' align='middle' style={{ marginTop: 8 }}>
          <Col>
            <Text type='secondary' style={{ fontSize: 12 }}>
              Showing results {groups.length} of {groups.length}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* ===== Add/Edit Modal ===== */}
      <CustomGroupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        groupData={selectedGroup}
      />

      {/* ===== View Details Modal ===== */}
      <Modal
        title={
          <div className='text-center'>
            <Title level={4} style={{ marginBottom: 0, color: '#00B894' }}>
              {selectedGroup?.session_name || 'Group Details'}
            </Title>
            <Text type='secondary'>Group Overview</Text>
          </div>
        }
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        centered
        width={600}
        bodyStyle={{
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: '20px 24px',
          borderRadius: 12,
        }}
      >
        {selectedGroup && (
          <div>
            {/* ===== Students Section ===== */}
            <Title level={5}>Students</Title>
            <div className='flex flex-wrap gap-3 mb-4'>
              {selectedGroup.students.map((name, index) => (
                <Tag
                  key={index}
                  color='green'
                  style={{
                    borderRadius: 20,
                    padding: '5px 12px',
                    fontWeight: 500,
                  }}
                >
                  <Avatar
                    size={24}
                    src={`https://i.pravatar.cc/150?img=${index + 1}`}
                    className='mr-2'
                  />
                  {name}
                </Tag>
              ))}
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* ===== Days & Timings ===== */}
            <Title level={5}>Schedule</Title>
            <div className='space-y-2 mt-2'>
              {selectedGroup.selectedDays?.map(day => (
                <div
                  key={day}
                  className='p-3 border rounded-lg flex justify-between items-center text-white'
                  style={{
                    background: '#2f2f2f',
                    border: '1px solid #eee',
                    borderRadius: 10,
                    color: 'white',
                  }}
                >
                  <Text className='text-white' strong>
                    {day}
                  </Text>
                  <Tag color='green' style={{ borderRadius: 8 }}>
                    {selectedGroup.times?.[day]?.start || '--:--'} -{' '}
                    {selectedGroup.times?.[day]?.end || '--:--'}
                  </Tag>
                </div>
              ))}
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* ===== Summary Section ===== */}
            <div className='flex justify-between mt-3'>
              <Text type='secondary'>Total Students:</Text>
              <Text strong>{selectedGroup.students.length}</Text>
            </div>
            <div className='flex justify-between mt-1'>
              <Text type='secondary'>Days Scheduled:</Text>
              <Text strong>{selectedGroup.selectedDays.length}</Text>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
