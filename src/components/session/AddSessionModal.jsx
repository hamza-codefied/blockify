'use client';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Row,
  Col,
  Button,
  TimePicker,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useCreateSchedule } from '@/hooks/useSchedules';
import { useGetGrades } from '@/hooks/useGrades';
import { useGetManagers } from '@/hooks/useManagers';

const { Text } = Typography;

// Day mapping: Monday=1, Tuesday=2, ..., Sunday=0
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NUMBERS = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const AddSessionModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [selectedDays, setSelectedDays] = useState([]);
  const createScheduleMutation = useCreateSchedule();
  
  // Fetch grades and managers
  const { data: gradesData } = useGetGrades({ page: 1, limit: 100 });
  const { data: managersData } = useGetManagers({ page: 1, limit: 100 });
  const grades = gradesData?.data || [];
  const managers = managersData?.data || [];

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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const { gradeId, managerId } = values;
      
      // Create a schedule for each selected day with its specific times
      const schedulePromises = selectedDays.map(day => {
        const dayOfWeek = DAY_NUMBERS[day];
        const startTimeKey = `startTime_${day}`;
        const endTimeKey = `endTime_${day}`;
        const startTime = values[startTimeKey];
        const endTime = values[endTimeKey];
        
        // Convert dayjs to HH:mm format
        const startTimeStr = startTime ? startTime.format('HH:mm') : null;
        const endTimeStr = endTime ? endTime.format('HH:mm') : null;
        
        return createScheduleMutation.mutateAsync({
          gradeId,
          managerId,
          dayOfWeek,
          startTime: startTimeStr,
          endTime: endTimeStr,
        });
      });
      
      await Promise.all(schedulePromises);
      
      form.resetFields();
      setSelectedDays([]);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to create schedules:', error);
    }
  };

  return (
    <Modal
      title='Add Schedule'
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={700}
      bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
      className='rounded-xl'
    >
      <Form form={form} layout='vertical'>
        {/* ===== Grade Select ===== */}
        <Form.Item
          label='Grade'
          name='gradeId'
          rules={[{ required: true, message: 'Please select grade' }]}
        >
          <Select placeholder='Select grade' loading={!gradesData}>
            {grades.map(grade => (
              <Select.Option key={grade.id} value={grade.id}>
                {grade.gradeName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* ===== Manager Select ===== */}
        <Form.Item
          label='Manager'
          name='managerId'
          rules={[{ required: true, message: 'Please select manager' }]}
        >
          <Select 
            placeholder='Select manager' 
            loading={!managersData}
          >
            {managers.map(manager => (
              <Select.Option key={manager.id} value={manager.id}>
                {manager.fullName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* ===== Select Days (Mon–Fri) ===== */}
        <Form.Item
          label='Select Days'
          required
          validateStatus={selectedDays.length === 0 ? 'error' : ''}
          help={selectedDays.length === 0 ? 'Please select at least one day' : ''}
        >
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
        </Form.Item>

        {/* ===== Time Selection (Separate for each selected day) ===== */}
        {selectedDays.length > 0 && (
          <div className='space-y-4'>
            {selectedDays.map(day => (
              <div key={day} className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
                <Text strong className='text-base mb-3 block'>{day}</Text>
                <Row gutter={16}>
                  <Col xs={12}>
                    <Form.Item
                      label='Start Time'
                      name={`startTime_${day}`}
                      rules={[{ required: true, message: 'Please select start time' }]}
                    >
                      <TimePicker
                        style={{ width: '100%' }}
                        format='HH:mm'
                        defaultOpenValue={dayjs('08:00', 'HH:mm')}
                        placeholder='Select start time'
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12}>
                    <Form.Item
                      label='End Time'
                      name={`endTime_${day}`}
                      rules={[{ required: true, message: 'Please select end time' }]}
                    >
                      <TimePicker
                        style={{ width: '100%' }}
                        format='HH:mm'
                        defaultOpenValue={dayjs('17:00', 'HH:mm')}
                        placeholder='Select end time'
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        )}

        {selectedDays.length > 0 && (
          <div className='mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <Text type='secondary' className='text-sm'>
              This will create schedules for: {selectedDays.join(', ')}
            </Text>
          </div>
        )}

        {/* ===== Save Button ===== */}
        <Form.Item className='text-center mt-6'>
          <Button
            type='primary'
            onClick={handleSave}
            loading={createScheduleMutation.isPending}
            disabled={selectedDays.length === 0}
            className='bg-[#00B894] hover:bg-[#019a7d] font-semibold px-10'
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
