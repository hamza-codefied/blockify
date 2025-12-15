import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, TimePicker, Button, Input } from 'antd';
import dayjs from 'dayjs';
import { useUpdateSchedule } from '@/hooks/useSchedules';
import { useGetGrades } from '@/hooks/useGrades';
import { useGetSubjects } from '@/hooks/useSubjects';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const EditSessionModal = ({ open, onClose, session, onSuccess }) => {
  const [form] = Form.useForm();
  const [pendingStartTime, setPendingStartTime] = useState(null);
  const [pendingEndTime, setPendingEndTime] = useState(null);
  const updateScheduleMutation = useUpdateSchedule();
  const { data: gradesData } = useGetGrades({ page: 1, limit: 100 });
  const { data: subjectsData } = useGetSubjects({ page: 1, limit: 100, status: 'active' });
  //>>> API returns { success: true, data: [...grades], pagination: {...} }
  const grades = gradesData?.data || [];
  const subjects = subjectsData?.data || [];

  useEffect(() => {
    if (open && session) {
      //>>> Convert HH:mm to dayjs for TimePicker
      const startTime = session.startTime ? dayjs(session.startTime, 'HH:mm') : null;
      const endTime = session.endTime ? dayjs(session.endTime, 'HH:mm') : null;

      form.setFieldsValue({
        dayOfWeek: session.dayOfWeek,
        startTime: startTime,
        endTime: endTime,
        subjectId: session.subjectId,
        name: session.name || undefined,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, session, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      //>>> Convert dayjs to HH:mm format
      const startTime = values.startTime ? values.startTime.format('HH:mm') : null;
      const endTime = values.endTime ? values.endTime.format('HH:mm') : null;

      const updateData = {
        dayOfWeek: values.dayOfWeek,
        startTime: startTime,
        endTime: endTime,
        subjectId: values.subjectId,
        name: values.name || null,
      };

      await updateScheduleMutation.mutateAsync({
        scheduleId: session.id,
        data: updateData,
      });

      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error('Form validation or API error:', error);
    }
  };

  const isLoading = updateScheduleMutation.isPending;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      title='Edit Schedule'
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
      >
        {/* Day of Week */}
        <Form.Item
          label='Day of Week'
          name='dayOfWeek'
          rules={[{ required: true, message: 'Please select day of week' }]}
        >
          <Select placeholder='Select Day'>
            {DAY_NAMES.map((day, index) => (
              <Select.Option key={index} value={index}>
                {day}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Subject */}
        <Form.Item
          label='Subject'
          name='subjectId'
          rules={[{ required: true, message: 'Please select subject' }]}
        >
          <Select placeholder='Select subject' loading={!subjectsData}>
            {subjects.map(subject => (
              <Select.Option key={subject.id} value={subject.id}>
                {subject.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Name (Optional) */}
        <Form.Item
          label='Schedule Name (Optional)'
          name='name'
          tooltip='Optional name for this schedule'
        >
          <Input
            placeholder='e.g., Morning Session'
            maxLength={200}
          />
        </Form.Item>

        {/* Time Range */}
        <div className='flex gap-2'>
          <Form.Item
            label='Start Time'
            name='startTime'
            className='flex-1'
            rules={[{ required: true, message: 'Please select start time' }]}
          >
            <TimePicker 
              use12Hours 
              format='hh:mm a' 
              className='w-full'
              onSelect={(time) => {
                setPendingStartTime(time);
                form.setFieldValue('startTime', time);
              }}
              onOpenChange={(open) => {
                if (!open && pendingStartTime) {
                  form.setFieldValue('startTime', pendingStartTime);
                  setPendingStartTime(null);
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label='End Time'
            name='endTime'
            className='flex-1'
            rules={[{ required: true, message: 'Please select end time' }]}
          >
            <TimePicker 
              use12Hours 
              format='hh:mm a' 
              className='w-full'
              onSelect={(time) => {
                setPendingEndTime(time);
                form.setFieldValue('endTime', time);
              }}
              onOpenChange={(open) => {
                if (!open && pendingEndTime) {
                  form.setFieldValue('endTime', pendingEndTime);
                  setPendingEndTime(null);
                }
              }}
            />
          </Form.Item>
        </div>

        {/* Save Button */}
        <Form.Item className='mt-4 text-center'>
          <Button
            type='primary'
            onClick={handleSubmit}
            loading={isLoading}
            style={{
              backgroundColor: '#00B894',
              borderColor: '#00B894',
              color: '#fff',
            }}
            className='font-semibold px-20 py-2 rounded-md transition hover:!bg-[#019a7d]'
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
