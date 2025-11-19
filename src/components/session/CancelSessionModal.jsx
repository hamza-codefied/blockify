'use client';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useCancelSession } from '@/hooks/useSessions';

const { TextArea } = Input;

export const CancelSessionModal = ({ open, onClose, session, onSuccess }) => {
  const [form] = Form.useForm();
  const cancelSessionMutation = useCancelSession();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        reason: '',
      });
    } else {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const cancelData = {
        reason: values.reason || null,
      };

      await cancelSessionMutation.mutateAsync({
        sessionId: session.id,
        data: cancelData,
      });

      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error handled by mutation hook
      console.error('Form validation or API error:', error);
    }
  };

  const isLoading = cancelSessionMutation.isPending;

  return (
    <Modal
      title="Cancel Session"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Cancel Session"
      cancelText="Close"
      confirmLoading={isLoading}
      centered
      okButtonProps={{
        style: {
          backgroundColor: '#ff4d4f',
          borderColor: '#ff4d4f',
        },
      }}
    >
      <Form form={form} layout="vertical">
        <p style={{ marginBottom: 16 }}>
          This will cancel the active session for <strong>{session?.student?.fullName || 'this student'}</strong>.
        </p>

        {/* Reason (optional) */}
        <Form.Item
          label="Reason (Optional)"
          name="reason"
        >
          <TextArea
            rows={3}
            placeholder="Enter reason for cancelling this session"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

