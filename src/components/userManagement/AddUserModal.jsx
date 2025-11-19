'use client';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { useCreateStudent } from '@/hooks/useStudents';
import { useCreateManager } from '@/hooks/useManagers';

const { Option } = Select;

export const AddUserModal = ({ open, onClose, activeTab, onSuccess }) => {
  const [form] = Form.useForm();
  const createStudentMutation = useCreateStudent();
  const createManagerMutation = useCreateManager();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (activeTab === 'students') {
        // Map form values to API format
        const studentData = {
          fullName: values.name || values.fullName,
          email: values.email,
          gradeLevel: values.grade ? parseInt(values.grade) : values.gradeLevel,
          password: values.password || null, // Optional for students
          status: values.status || 'active',
        };
        
        await createStudentMutation.mutateAsync(studentData);
      } else {
        // Map form values to API format
        const managerData = {
          fullName: values.name || values.fullName,
          email: values.email,
          password: values.password, // Required for managers
          department: values.department || null,
          status: values.status || 'active',
        };
        
        await createManagerMutation.mutateAsync(managerData);
      }
      
      form.resetFields();
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error('Form validation or API error:', error);
    }
  };

  const isLoading = activeTab === 'students' 
    ? createStudentMutation.isPending 
    : createManagerMutation.isPending;

  return (
    <Modal
      title={`Add ${activeTab === 'students' ? 'Student' : 'Manager'}`}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText='Save'
      cancelText='Cancel'
      confirmLoading={isLoading}
      centered
      style={{ top: 0 }}
      bodyStyle={{
        maxHeight: '70vh',
        overflowY: 'auto',
        paddingRight: '12px',
      }}
      okButtonProps={{
        style: {
          backgroundColor: '#00B894',
          borderColor: '#00B894',
        },
        className: 'hover:!bg-[#00b894] hover:!border-[#00b894]',
      }}
      cancelButtonProps={{
        style: {
          borderColor: '#00B894',
        },
        className: 'hover:!text-[#00b894] hover:!border-[#00b894]',
      }}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          status: 'active',
        }}
      >
        <Form.Item 
          label='Full Name' 
          name='fullName'
          rules={[{ required: true, message: 'Full name is required' }]}
        >
          <Input placeholder='Enter full name' />
        </Form.Item>

        <Form.Item 
          label='Email' 
          name='email'
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input placeholder='Enter email' />
        </Form.Item>

        {activeTab === 'students' ? (
          <>
            <Form.Item 
              label='Grade Level' 
              name='gradeLevel'
              rules={[{ required: true, message: 'Grade level is required' }]}
            >
              <Select placeholder='Select grade'>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                  <Option key={grade} value={grade}>
                    {grade}th Grade
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item 
              label='Password (Optional)' 
              name='password'
              tooltip='Students authenticate via email/NFC tokens. Password is optional.'
            >
              <Input.Password placeholder='Enter password (optional)' />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item 
              label='Password' 
              name='password'
              rules={[
                { required: true, message: 'Password is required' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <Input.Password placeholder='Enter password' />
            </Form.Item>

            <Form.Item label='Department' name='department'>
              <Input placeholder='Enter department (optional)' />
            </Form.Item>
          </>
        )}

        <Form.Item label='Status' name='status'>
          <Select>
            <Option value='active'>Active</Option>
            <Option value='inactive'>Inactive</Option>
            <Option value='suspended'>Suspended</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
