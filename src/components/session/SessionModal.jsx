'use client';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, DatePicker, Button, Space } from 'antd';
import dayjs from 'dayjs';
import { useCreateSession, useUpdateSession } from '@/hooks/useSessions';
import { useGetStudents } from '@/hooks/useStudents';
import { useGetGrades } from '@/hooks/useGrades';
import { useGetSchedules } from '@/hooks/useSchedules';

const { RangePicker } = DatePicker;

export const SessionModal = ({ open, onClose, mode, sessionData, onSuccess }) => {
  const [form] = Form.useForm();
  const createSessionMutation = useCreateSession();
  const updateSessionMutation = useUpdateSession();

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentGradeId, setSelectedStudentGradeId] = useState(null);

  //>>> Fetch students and grades for dropdowns
  const { data: studentsData } = useGetStudents({ page: 1, limit: 100 });
  const students = studentsData?.data || [];

  const { data: gradesData } = useGetGrades({ page: 1, limit: 100 });
  const grades = gradesData?.data || [];

  //>>> Fetch schedules for the selected student's grade
  const { data: schedulesData } = useGetSchedules({
    page: 1,
    limit: 100,
    ...(selectedStudentGradeId && { gradeId: selectedStudentGradeId })
  });
  const schedules = schedulesData?.data || [];

  //>>> Update selected student and grade when student changes
  useEffect(() => {
    if (selectedStudentId) {
      const student = students.find(s => s.id === selectedStudentId);
      if (student && student.gradeId) {
        setSelectedStudentGradeId(student.gradeId);
      }
    } else {
      setSelectedStudentGradeId(null);
    }
  }, [selectedStudentId, students]);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && sessionData) {
        //>>> Pre-fill form for edit
        const startTime = sessionData.startTimestamp ? dayjs(sessionData.startTimestamp) : null;
        const endTime = sessionData.endTimestamp ? dayjs(sessionData.endTimestamp) : null;
        const sessionDate = sessionData.sessionDate ? dayjs(sessionData.sessionDate) : null;

        form.setFieldsValue({
          studentId: sessionData.studentId,
          scheduleId: sessionData.scheduleId,
          sessionDate: sessionDate,
          status: sessionData.status,
          startTimestamp: startTime,
          endTimestamp: endTime,
        });
        setSelectedStudentId(sessionData.studentId);
      } else {
        form.resetFields();
        //>>> Set default status to active for new sessions
        form.setFieldsValue({ 
          status: 'active',
          sessionDate: dayjs() // Default to today
        });
        setSelectedStudentId(null);
        setSelectedStudentGradeId(null);
      }
    }
  }, [open, mode, sessionData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      //>>> Convert dayjs to ISO string (optional fields)
      const startTimestamp = values.startTimestamp 
        ? values.startTimestamp.toISOString() 
        : null; // Allow null for manual creation by admin
      
      const endTimestamp = values.endTimestamp 
        ? values.endTimestamp.toISOString() 
        : null;

      //>>> Convert sessionDate to YYYY-MM-DD format
      const sessionDate = values.sessionDate 
        ? values.sessionDate.format('YYYY-MM-DD')
        : null;

      if (mode === 'edit' && sessionData) {
        //>>> Update session
        const updateData = {
          studentId: values.studentId,
          scheduleId: values.scheduleId,
          sessionDate: sessionDate,
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
          scheduleId: values.scheduleId,
          sessionDate: sessionDate,
          startTimestamp: null, // Always null on creation
          endTimestamp: null, // Always null on creation
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
            onChange={(value) => setSelectedStudentId(value)}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={students.map(student => ({
              value: student.id,
              label: `${student.fullName} (${student.email})`,
            }))}
          />
        </Form.Item>

        {/* Schedule Selection */}
        <Form.Item
          label="Schedule"
          name="scheduleId"
          rules={[{ required: true, message: 'Please select a schedule' }]}
        >
          <Select
            placeholder={selectedStudentGradeId ? "Select schedule" : "Select student first"}
            disabled={!selectedStudentGradeId}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={schedules.map(schedule => {
              const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              const dayName = dayNames[schedule.dayOfWeek];
              return {
                value: schedule.id,
                label: `${dayName} - ${schedule.startTime} to ${schedule.endTime}`,
              };
            })}
          />
        </Form.Item>

        {/* Session Date */}
        <Form.Item
          label="Session Date"
          name="sessionDate"
          rules={[{ required: true, message: 'Please select session date' }]}
        >
          <DatePicker
            format="YYYY-MM-DD"
            style={{ width: '100%' }}
            placeholder="Select session date"
            disabledDate={(current) => {
              // Disable future dates
              return current && current > dayjs().endOf('day');
            }}
          />
        </Form.Item>

        {/* Start Timestamp (optional) */}
        <Form.Item
          label="Start Time"
          name="startTimestamp"
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            placeholder="Select start time (optional)"
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

