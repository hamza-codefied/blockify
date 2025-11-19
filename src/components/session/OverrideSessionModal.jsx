'use client';
import React, { useEffect } from 'react';
import { Modal, Form, DatePicker, Input, Button } from 'antd';
import dayjs from 'dayjs';
import { useOverrideSession } from '@/hooks/useSessions';

const { TextArea } = Input;

export const OverrideSessionModal = ({ open, onClose, session, onSuccess }) => {
  const [form] = Form.useForm();
  const overrideSessionMutation = useOverrideSession();

  useEffect(() => {
    if (open && session) {
      //>>> Pre-fill with current time as default end timestamp
      form.setFieldsValue({
        endTimestamp: dayjs(),
        reason: '',
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, session, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const overrideData = {
        endTimestamp: values.endTimestamp ? values.endTimestamp.toISOString() : new Date().toISOString(),
        reason: values.reason || null,
      };

      await overrideSessionMutation.mutateAsync({
        sessionId: session.id,
        data: overrideData,
      });

      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error handled by mutation hook
      console.error('Form validation or API error:', error);
    }
  };

  const isLoading = overrideSessionMutation.isPending;

  return (
    <Modal
      title="Override Session"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Override"
      cancelText="Cancel"
      confirmLoading={isLoading}
      centered
      okButtonProps={{
        style: {
          backgroundColor: '#1890ff',
          borderColor: '#1890ff',
        },
      }}
    >
      <Form form={form} layout="vertical">
        <p style={{ marginBottom: 16 }}>
          This will manually end the active session for <strong>{session?.student?.fullName || 'this student'}</strong>.
        </p>

        {/* End Timestamp */}
        <Form.Item
          label="End Time"
          name="endTimestamp"
          rules={[{ required: true, message: 'Please select end time' }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            placeholder="Select end time"
          />
        </Form.Item>

        {/* Reason (optional) */}
        <Form.Item
          label="Reason (Optional)"
          name="reason"
        >
          <TextArea
            rows={3}
            placeholder="Enter reason for overriding this session"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

