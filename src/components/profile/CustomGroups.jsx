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
  Input,
  Select,
  TimePicker,
  Space,
} from 'antd';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import './grades.css';
import { CustomGroupModal } from './CustomGroupModal';
import dayjs from 'dayjs';
import { TbEdit } from 'react-icons/tb';
import { RiDeleteBinLine } from 'react-icons/ri';

const { Title, Text } = Typography;
const { Option } = Select;

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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editData, setEditData] = useState(null);

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

  const handleEditClick = group => {
    setSelectedGroup(group);
    setEditData(JSON.parse(JSON.stringify(group))); // deep clone
    setEditModalOpen(true);
  };

  const handleDeleteClick = group => {
    setSelectedGroup(group);
    setDeleteModalOpen(true);
  };

  // ===== Edit Modal field changes (UI only) =====
  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleTimeChange = (day, type, time) => {
    setEditData(prev => ({
      ...prev,
      times: {
        ...prev.times,
        [day]: {
          ...prev.times[day],
          [type]: time ? time.format('HH:mm') : '',
        },
      },
    }));
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
        className='w-full lg:w-1/3 bg-white rounded-xl shadow-lg border-2 border-gray-200'
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
              marginTop: 18,
              marginBottom: 2,
              fontWeight: 500,
              background: '#fff',
              boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
              border: '2px solid rgba(0,0,0,0.05)',
              borderRadius: 12,
              padding: '20px 16px',
            }}
          >
            <Col flex='2'>Session Name</Col>
            <Col flex='1'>Students</Col>
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
                  <Col flex='1' className='flex justify-end gap-3'>
                    <AiOutlineEye
                      size={14}
                      color='#186ee8'
                      className='cursor-pointer'
                      onClick={() => handleViewClick(group)}
                    />
                    <TbEdit
                      size={14}
                      color='#00B894'
                      className='cursor-pointer'
                      onClick={() => handleEditClick(group)}
                    />
                    <RiDeleteBinLine
                      size={14}
                      color='#801818'
                      className='cursor-pointer'
                      onClick={() => handleDeleteClick(group)}
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

      {/* ===== Add/Edit Modal (existing component) ===== */}
      <CustomGroupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        groupData={selectedGroup}
      />

      {/* ===== View Modal ===== */}
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

            <Title level={5}>Schedule</Title>
            <div className='space-y-2 mt-2'>
              {selectedGroup.selectedDays?.map(day => (
                <div
                  key={day}
                  className='p-3 border rounded-lg flex justify-between items-center text-white'
                  style={{
                    background: '#2f2f2f',
                    borderRadius: 10,
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
          </div>
        )}
      </Modal>

      {/* ===== Edit Modal (Interactive UI) ===== */}
      <Modal
        title='Edit Group'
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        centered
        width={650}
      >
        {editData && (
          <div className='space-y-4'>
            <Input
              placeholder='Session Name'
              value={editData.session_name}
              onChange={e => handleEditChange('session_name', e.target.value)}
            />

            <Select
              mode='tags'
              style={{ width: '100%' }}
              placeholder='Add Students'
              value={editData.students}
              onChange={value => handleEditChange('students', value)}
            />

            <Select
              mode='multiple'
              style={{ width: '100%' }}
              placeholder='Select Days'
              value={editData.selectedDays}
              onChange={value => handleEditChange('selectedDays', value)}
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(
                day => (
                  <Option key={day} value={day}>
                    {day}
                  </Option>
                )
              )}
            </Select>

            <Divider />
            <Title level={5}>Edit Timings</Title>

            <div className='space-y-3'>
              {editData.selectedDays.map(day => (
                <div
                  key={day}
                  className='flex justify-between items-center border p-2 rounded-lg'
                >
                  <Text style={{ width: 100 }}>{day}</Text>
                  <Space>
                    <TimePicker
                      format='HH:mm'
                      value={
                        editData.times[day]?.start
                          ? dayjs(editData.times[day].start, 'HH:mm')
                          : null
                      }
                      onChange={time => handleTimeChange(day, 'start', time)}
                    />
                    <Text>-</Text>
                    <TimePicker
                      format='HH:mm'
                      value={
                        editData.times[day]?.end
                          ? dayjs(editData.times[day].end, 'HH:mm')
                          : null
                      }
                      onChange={time => handleTimeChange(day, 'end', time)}
                    />
                  </Space>
                </div>
              ))}
            </div>

            <div className='flex justify-end mt-4'>
              <Button
                type='primary'
                style={{
                  backgroundColor: '#00B894',
                  borderColor: '#00B894',
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ===== Delete Confirmation Modal ===== */}
      <Modal
        title='Confirm Delete'
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={() => setDeleteModalOpen(false)}
        okText='Delete'
        okButtonProps={{ danger: true }}
        centered
      >
        <Text>
          Are you sure you want to delete{' '}
          <strong>{selectedGroup?.session_name}</strong>?
        </Text>
      </Modal>
    </>
  );
};
