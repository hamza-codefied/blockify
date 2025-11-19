'use client';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useCreateGrade, useUpdateGrade } from '@/hooks/useGrades';

export const GradeModal = ({ open, onClose, mode, gradeData, onSuccess }) => {
  const [form] = Form.useForm();
  const createGradeMutation = useCreateGrade();
  const updateGradeMutation = useUpdateGrade();

  // When opening modal, pre-fill form if in edit mode
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && gradeData) {
        form.setFieldsValue({
          gradeName: gradeData.gradeName,
        });
      } else {
        form.resetFields();
      }
    }
  }, [mode, gradeData, form, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (mode === 'edit' && gradeData) {
        // Update grade
        const updateData = {
          gradeName: values.gradeName,
        };
        await updateGradeMutation.mutateAsync({
          gradeId: gradeData.id,
          data: updateData,
        });
      } else {
        // Create grade
        const createData = {
          gradeName: values.gradeName,
        };
        await createGradeMutation.mutateAsync(createData);
      }
      
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error('Form validation or API error:', error);
    }
  };

  const isLoading = mode === 'edit' 
    ? updateGradeMutation.isPending 
    : createGradeMutation.isPending;

  return (
    <Modal
      title={mode === 'edit' ? 'Edit Grade' : 'Add Grade'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={mode === 'edit' ? 'Update' : 'Add'}
      cancelText='Cancel'
      confirmLoading={isLoading}
      centered
      okButtonProps={{
        style: {
          backgroundColor: '#00B894',
          borderColor: '#00B894',
        },
      }}
    >
      <Form form={form} layout='vertical'>
        {/* ===== Grade Name ===== */}
        <Form.Item
          label='Grade Name'
          name='gradeName'
          rules={[
            { required: true, message: 'Please enter grade name' },
            { min: 2, message: 'Grade name must be at least 2 characters' },
            { max: 100, message: 'Grade name must not exceed 100 characters' },
          ]}
        >
          <Input placeholder='e.g., Grade 9, 9th Grade' />
        </Form.Item>
      </Form>
    </Modal>
  );
};
