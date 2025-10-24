'use client';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Avatar,
  Row,
  Col,
  Button,
  Typography,
  TimePicker,
} from 'antd';
import dayjs from 'dayjs';
import './custom-groups.css';

const { Title, Text } = Typography;
const { Option } = Select;

const dummyStudents = [
  {
    id: 1,
    name: 'Aiden Andrews',
    grade: '9th Grade',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    name: 'Sophia Johnson',
    grade: '10th Grade',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 3,
    name: 'Michael Brown',
    grade: '11th Grade',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: 4,
    name: 'Emily Davis',
    grade: '12th Grade',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: 1,
    name: 'Aiden Andrews',
    grade: '9th Grade',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    name: 'Sophia Johnson',
    grade: '10th Grade',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 3,
    name: 'Michael Brown',
    grade: '11th Grade',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: 4,
    name: 'Emily Davis',
    grade: '12th Grade',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: 1,
    name: 'Aiden Andrews',
    grade: '9th Grade',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    name: 'Sophia Johnson',
    grade: '10th Grade',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 3,
    name: 'Michael Brown',
    grade: '11th Grade',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: 4,
    name: 'Emily Davis',
    grade: '12th Grade',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
];

const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const CustomGroupModal = ({ open, onClose, mode, groupData }) => {
  const [form] = Form.useForm();
  const [selectedDays, setSelectedDays] = useState([]);
  const isViewMode = mode === 'view';

  useEffect(() => {
    if (isViewMode && groupData) {
      form.setFieldsValue({
        session_name: groupData.session_name,
        students: groupData.students,
        times: groupData.times || {},
      });
      setSelectedDays(groupData.selectedDays || []);
    } else {
      form.resetFields();
      setSelectedDays([]);
    }
  }, [mode, groupData, form]);

  const toggleDay = day => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const data = {
        ...values,
        selectedDays,
      };
      console.log('Saved group:', data);
      onClose();
    });
  };

  return (
    <Modal
      title={isViewMode ? 'View Custom Group' : 'Add Custom Group'}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={700}
      bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
      className='rounded-xl'
    >
      <Form form={form} layout='vertical'>
        {/* ===== Session Name ===== */}
        <Form.Item
          label='Session Name'
          name='session_name'
          rules={[{ required: true, message: 'Please enter session name' }]}
        >
          <Input placeholder='Enter session name' disabled={isViewMode} />
        </Form.Item>

        {/* ===== Select Students ===== */}
        <Form.Item
          label='Select Students'
          name='students'
          rules={[{ required: true, message: 'Please select students' }]}
        >
          <Select
            mode='multiple'
            placeholder='Select students'
            showSearch
            optionFilterProp='value'
            disabled={isViewMode}
            filterOption={(input, option) =>
              option?.value?.toLowerCase().includes(input.toLowerCase())
            }
            getPopupContainer={trigger => trigger.parentNode} // ✅ keeps dropdown inside modal
          >
            {dummyStudents.map(student => (
              <Option
                key={student.id}
                value={student.name}
                label={student.name}
              >
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center justify-start gap-3'>
                    <Avatar size={28} src={student.avatar} />
                    {student.name}
                  </div>
                  <span>
                    <Text className='text-black' type='secondary'>
                      {student.grade}
                    </Text>
                  </span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* ===== Select Days (Mon–Fri) ===== */}
        {!isViewMode && (
          <>
            <Text strong>Select Days</Text>
            <div className='flex flex-wrap gap-3 mt-2 mb-4 w-full justify-between'>
              {daysList.map(day => {
                const selected = selectedDays.includes(day);
                return (
                  <div
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selected
                        ? 'bg-[#151515] text-white  border-b-4 border-[#00B894]'
                        : 'bg-white hover:bg-gray-200 text-black border-2 border-gray-200 shadow-lg'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== Time Selection for Each Selected Day ===== */}
        {selectedDays.map(day => (
          <Row key={day} gutter={16} className='mb-3 w-full'>
            <Col span={24}>
              <Text strong>{day}</Text>
            </Col>
            <Col xs={12}>
              <Form.Item
                name={['times', day, 'start']}
                label='Start Time'
                rules={[{ required: true, message: 'Select start time' }]}
              >
                <TimePicker
                  style={{ width: '100%' }}
                  format='HH:mm'
                  disabled={isViewMode}
                  defaultOpenValue={dayjs('09:00', 'HH:mm')}
                />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item
                name={['times', day, 'end']}
                label='End Time'
                rules={[{ required: true, message: 'Select end time' }]}
              >
                <TimePicker
                  style={{ width: '100%' }}
                  format='HH:mm'
                  disabled={isViewMode}
                  defaultOpenValue={dayjs('10:00', 'HH:mm')}
                />
              </Form.Item>
            </Col>
          </Row>
        ))}

        {/* ===== Save Button ===== */}
        {!isViewMode && (
          <Form.Item className='text-center mt-6'>
            <Button
              type='primary'
              onClick={handleSave}
              className='bg-[#00B894] hover:bg-[#019a7d] font-semibold px-10'
            >
              Save
            </Button>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
