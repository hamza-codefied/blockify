'use client';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';
import { useCreateCustomGroupSession } from '@/hooks/useCustomGroups';
import { useGetCustomGroup } from '@/hooks/useCustomGroups';
import { useGetStudents } from '@/hooks/useStudents';

export const CustomGroupSessionModal = ({ open, onClose, customGroupId, onSuccess }) => {
  const [form] = Form.useForm();
  const createSessionMutation = useCreateCustomGroupSession();

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  //>>> Fetch custom group details to get schedules and member IDs
  const { data: customGroupData, isLoading: groupLoading } = useGetCustomGroup(
    customGroupId,
    open && !!customGroupId
  );
  const customGroup = customGroupData?.data || null;
  const schedules = customGroup?.schedules || [];
  const memberStudentIds = customGroup?.members?.map(m => m.studentId) || [];

  //>>> Fetch all students to get their details (we'll filter by member IDs)
  const { data: studentsData } = useGetStudents({ page: 1, limit: 1000 });
  const allStudents = studentsData?.data || [];
  
  //>>> Filter students to only show those who are members of the custom group
  const groupStudents = allStudents.filter(student => 
    memberStudentIds.includes(student.id)
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
      //>>> Set default session date to today
      form.setFieldsValue({ 
        sessionDate: dayjs() // Default to today
      });
      setSelectedStudentId(null);
      setSelectedScheduleId(null);
    }
  }, [open, form, customGroupId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      //>>> Convert sessionDate to YYYY-MM-DD format
      const sessionDate = values.sessionDate 
        ? values.sessionDate.format('YYYY-MM-DD')
        : null;

      //>>> Create session
      const createData = {
        studentId: values.studentId,
        scheduleId: values.scheduleId,
        sessionDate: sessionDate,
        startTimestamp: null, // Always null on creation
        endTimestamp: null, // Always null on creation
        status: 'active', // Always active for session creation
      };

      await createSessionMutation.mutateAsync({
        customGroupId: customGroupId,
        data: createData,
      });

      form.resetFields();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      // Error handled by mutation hook
      console.error('Form validation or API error:', error);
    }
  };

  const isLoading = createSessionMutation.isPending;

  //>>> Day names for display
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Modal
      title={`Add Session - ${customGroup?.name || 'Custom Group'}`}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Create"
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
            loading={groupLoading}
            disabled={!customGroup || groupStudents.length === 0}
            onChange={(value) => setSelectedStudentId(value)}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={groupStudents.map(student => ({
              value: student.id,
              label: `${student.fullName || student.name || 'Student'} (${student.email || 'No email'})`,
            }))}
            notFoundContent={
              groupLoading 
                ? 'Loading students...' 
                : groupStudents.length === 0 
                  ? 'No students in this custom group' 
                  : 'No students found'
            }
          />
        </Form.Item>

        {/* Schedule Selection */}
        <Form.Item
          label="Schedule"
          name="scheduleId"
          rules={[{ required: true, message: 'Please select a schedule' }]}
        >
          <Select
            placeholder={schedules.length === 0 ? "No schedules available" : "Select schedule"}
            disabled={!customGroup || schedules.length === 0}
            loading={groupLoading}
            showSearch
            onChange={(value) => setSelectedScheduleId(value)}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={schedules.map(schedule => {
              const dayName = dayNames[schedule.dayOfWeek];
              return {
                value: schedule.id,
                label: `${dayName} - ${schedule.startTime} to ${schedule.endTime}`,
              };
            })}
            notFoundContent={
              groupLoading 
                ? 'Loading schedules...' 
                : schedules.length === 0 
                  ? 'No schedules found for this custom group' 
                  : 'No schedules found'
            }
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


      </Form>
    </Modal>
  );
};

