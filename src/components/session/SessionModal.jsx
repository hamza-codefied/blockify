'use client';
import React, { useEffect } from 'react';
import { Modal, Form, Select, DatePicker, Button, Space } from 'antd';
import dayjs from 'dayjs';
import { useCreateSession, useUpdateSession } from '@/hooks/useSessions';
import { useGetStudents } from '@/hooks/useStudents';
import { useGetGrades } from '@/hooks/useGrades';

const { RangePicker } = DatePicker;

export const SessionModal = ({ open, onClose, mode, sessionData, onSuccess }) => {
  const [form] = Form.useForm();
  const createSessionMutation = useCreateSession();
  const updateSessionMutation = useUpdateSession();

  //>>> Fetch students and grades for dropdowns
  const { data: studentsData } = useGetStudents({ page: 1, limit: 100 });
  const students = studentsData?.data || [];

  const { data: gradesData } = useGetGrades({ page: 1, limit: 100 });
  const grades = gradesData?.data || [];

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && sessionData) {
        //>>> Pre-fill form for edit
        const startTime = sessionData.startTimestamp ? dayjs(sessionData.startTimestamp) : null;
        const endTime = sessionData.endTimestamp ? dayjs(sessionData.endTimestamp) : null;

        form.setFieldsValue({
          studentId: sessionData.studentId,
          status: sessionData.status,
          startTimestamp: startTime,
          endTimestamp: endTime,
        });
      } else {
        form.resetFields();
        //>>> Set default status to active for new sessions
        form.setFieldsValue({ status: 'active' });
      }
    }
  }, [open, mode, sessionData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      //>>> Convert dayjs to ISO string
      const startTimestamp = values.startTimestamp 
        ? values.startTimestamp.toISOString() 
        : new Date().toISOString();
      
      const endTimestamp = values.endTimestamp 
        ? values.endTimestamp.toISOString() 
        : null;

      if (mode === 'edit' && sessionData) {
        //>>> Update session
        const updateData = {
          studentId: values.studentId,
          startTimestamp,
          endTimestamp,
          status: values.status,
        };

        await updateSessionMutation.mutateAsync({
          sessionId: sessionData.id,
          data: updateData,
        });
      } else {
        //>>> Create session
        const createData = {
          studentId: values.studentId,
          startTimestamp,
          endTimestamp,
          status: values.status || 'active',
        };

        await createSessionMutation.mutateAsync(createData);
      }

      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error handled by mutation hook
      console.error('Form validation or API error:', error);
    }
  };

  const isLoading = mode === 'edit' 
    ? updateSessionMutation.isPending 
    : createSessionMutation.isPending;

  return (
    <Modal
      title={mode === 'edit' ? 'Edit Session' : 'Add Session'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={mode === 'edit' ? 'Update' : 'Create'}
      cancelText="Cancel"
      confirmLoading={isLoading}
      centered
      okButtonProps={{
        style: {
          backgroundColor: '#00B894',
          borderColor: '#00B894',
        },
      }}
      width={600}
    >
      <Form form={form} layout="vertical">
        {/* Student Selection */}
        <Form.Item
          label="Student"
          name="studentId"
          rules={[{ required: true, message: 'Please select a student' }]}
        >
          <Select
            placeholder="Select student"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={students.map(student => ({
              value: student.id,
              label: `${student.fullName} (${student.email})`,
            }))}
          />
        </Form.Item>

        {/* Start Timestamp */}
        <Form.Item
          label="Start Time"
          name="startTimestamp"
          rules={[{ required: true, message: 'Please select start time' }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            placeholder="Select start time"
          />
        </Form.Item>

        {/* End Timestamp (optional for active sessions) */}
        <Form.Item
          label="End Time"
          name="endTimestamp"
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                const status = getFieldValue('status');
                if (status === 'ended' && !value) {
                  return Promise.reject(new Error('End time is required for ended sessions'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            placeholder="Select end time (optional)"
          />
        </Form.Item>

        {/* Status */}
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select placeholder="Select status">
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="ended">Ended</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

