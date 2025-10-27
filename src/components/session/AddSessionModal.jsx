'use client';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  TimePicker,
  Typography,
} from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const AddSessionModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedDays([]);
    }
  }, [open, form]);

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
      console.log('Session Saved:', data);
      onClose();
    });
  };

  return (
    <Modal
      title='Add Session'
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
          <Input placeholder='Enter session name' />
        </Form.Item>

        {/* ===== Grade Select ===== */}
        <Form.Item
          label='Grade'
          name='grade'
          rules={[{ required: true, message: 'Please select grade' }]}
        >
          <Select placeholder='Select grade'>
            <Option value='8th Grade'>8th Grade</Option>
            <Option value='9th Grade'>9th Grade</Option>
            <Option value='10th Grade'>10th Grade</Option>
            <Option value='11th Grade'>11th Grade</Option>
            <Option value='12th Grade'>12th Grade</Option>
          </Select>
        </Form.Item>

        {/* ===== Select Days (Mon–Fri) ===== */}
        <Text strong>Select Days</Text>
        <div className='flex flex-wrap mt-2 mb-4 w-full justify-between'>
          {daysList.map(day => {
            const selected = selectedDays.includes(day);
            return (
              <div
                key={day}
                onClick={() => toggleDay(day)}
                className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selected
                    ? 'bg-[#151515] text-white border-b-4 border-[#00B894]'
                    : 'bg-white hover:bg-gray-200 text-black border-2 border-gray-200 shadow-lg'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

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
                  defaultOpenValue={dayjs('08:00', 'HH:mm')}
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
                  defaultOpenValue={dayjs('09:00', 'HH:mm')}
                />
              </Form.Item>
            </Col>
          </Row>
        ))}

        {/* ===== Save Button ===== */}
        <Form.Item className='text-center mt-6'>
          <Button
            type='primary'
            onClick={handleSave}
            className='bg-[#00B894] hover:bg-[#019a7d] font-semibold px-10'
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
