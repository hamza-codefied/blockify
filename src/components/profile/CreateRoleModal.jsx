'use client';
import React, { useState } from 'react';
import { Modal, Form, Input, Button, Alert } from 'antd';
import { useCreateRole } from '@/hooks/useRoles';
import './permission-management.css';

const { TextArea } = Input;

export const CreateRoleModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [roleName, setRoleName] = useState('');

  const createRoleMutation = useCreateRole();

  const handleRoleNameChange = (e) => {
    const value = e.target.value;
    setRoleName(value);
  };

  const handleRoleNameBlur = (e) => {
    const value = e.target.value;
    // Auto-generate display name suggestion only if display name is empty
    if (value && !form.getFieldValue('displayName')) {
      const displayName = value
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      form.setFieldsValue({ displayName });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const roleData = {
        roleName: values.roleName.trim().toLowerCase(),
        displayName: values.displayName.trim(),
        description: values.description?.trim() || null,
        permissionIds: [], // Permissions can be assigned after creation
      };

      await createRoleMutation.mutateAsync(roleData);
      form.resetFields();
      setRoleName('');
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error is handled by the mutation hook
      if (error?.errorFields) {
        // Form validation error
        return;
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setRoleName('');
    onClose();
  };

  return (
    <Modal
      title='Create New Role'
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      width={600}
      className='dark-mode-modal'
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
        autoComplete='off'
      >
        <Form.Item
          label='Role Name'
          name='roleName'
          rules={[
            { required: true, message: 'Role name is required' },
            { min: 2, message: 'Role name must be at least 2 characters' },
            { max: 50, message: 'Role name must not exceed 50 characters' },
            {
              pattern: /^[a-z0-9_-]+$/,
              message: 'Role name must contain only lowercase letters, numbers, hyphens, and underscores',
            },
          ]}
          tooltip='Lowercase letters, numbers, hyphens, and underscores only (e.g., "custom-manager", "assistant-admin")'
        >
          <Input
            placeholder='e.g., custom-manager'
            onChange={handleRoleNameChange}
            onBlur={handleRoleNameBlur}
            disabled={createRoleMutation.isPending}
          />
        </Form.Item>

        <Form.Item
          label='Display Name'
          name='displayName'
          rules={[
            { required: true, message: 'Display name is required' },
            { min: 2, message: 'Display name must be at least 2 characters' },
            { max: 100, message: 'Display name must not exceed 100 characters' },
          ]}
        >
          <Input
            placeholder='e.g., Custom Manager'
            disabled={createRoleMutation.isPending}
          />
        </Form.Item>

        <Form.Item
          label='Description'
          name='description'
          rules={[
            { max: 500, message: 'Description must not exceed 500 characters' },
          ]}
        >
          <TextArea
            rows={3}
            placeholder='Optional description for this role'
            disabled={createRoleMutation.isPending}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Alert
          message='Note'
          description='You can assign permissions to this role after creation by clicking the edit icon.'
          type='info'
          showIcon
          style={{ marginBottom: 24 }}
        />

        <div className='flex justify-end gap-3 mt-6'>
          <Button onClick={handleCancel} disabled={createRoleMutation.isPending}>
            Cancel
          </Button>
          <Button
            type='primary'
            htmlType='submit'
            className='bg-[#00B894] hover:!bg-[#019a7d] text-white font-semibold'
            loading={createRoleMutation.isPending}
          >
            Create Role
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

