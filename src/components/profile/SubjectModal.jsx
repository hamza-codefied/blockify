'use client';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Select } from 'antd';
import { useCreateSubject, useUpdateSubject } from '@/hooks/useSubjects';

const { TextArea } = Input;
const { Option } = Select;

export const SubjectModal = ({ open, onClose, mode, subjectData, onSuccess }) => {
  const [form] = Form.useForm();
  const createSubjectMutation = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();

  // When opening modal, pre-fill form if in edit mode
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && subjectData) {
        form.setFieldsValue({
          name: subjectData.name,
          description: subjectData.description || '',
        });
      } else {
        form.resetFields();
        // Status defaults to 'active' and is not shown in add mode
      }
    }
  }, [mode, subjectData, form, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (mode === 'edit' && subjectData) {
        // Update subject - status is not changeable
        const updateData = {};
        if (values.name) updateData.name = values.name;
        if (values.description !== undefined) updateData.description = values.description || null;
        // Status is not included in update - it remains unchanged
        
        await updateSubjectMutation.mutateAsync({
          subjectId: subjectData.id,
          data: updateData,
        });
      } else {
        // Create subject - status always defaults to 'active'
        const createData = {
          name: values.name,
          description: values.description || null,
          status: 'active', // Always active when creating
        };
        await createSubjectMutation.mutateAsync(createData);
      }
      
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error('Form validation or API error:', error);
    }
  };

  const isLoading = mode === 'edit' 
    ? updateSubjectMutation.isPending 
    : createSubjectMutation.isPending;

  return (
    <Modal
      title={mode === 'edit' ? 'Edit Subject' : 'Add Subject'}
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
        {/* ===== Subject Name ===== */}
        <Form.Item
          label='Subject Name'
          name='name'
          rules={[
            { required: mode === 'add', message: 'Please enter subject name' },
            { min: 2, message: 'Subject name must be at least 2 characters' },
            { max: 100, message: 'Subject name must not exceed 100 characters' },
          ]}
        >
          <Input placeholder='e.g., Mathematics, Science, English' />
        </Form.Item>

        {/* ===== Description (Optional) ===== */}
        <Form.Item
          label='Description (Optional)'
          name='description'
          rules={[
            { max: 500, message: 'Description must not exceed 500 characters' },
          ]}
        >
          <TextArea 
            rows={3}
            placeholder='Enter subject description...'
            showCount
            maxLength={500}
          />
        </Form.Item>

      </Form>
    </Modal>
  );
};

