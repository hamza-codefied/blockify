'use client';
import React, { useEffect } from 'react';
import { Modal, Input, Form, Button, Select } from 'antd';
import { useUpdateStudent } from '@/hooks/useStudents';
import { useUpdateManager } from '@/hooks/useManagers';

const { Option } = Select;

export const EditUserModal = ({ open, onClose, user, activeTab, onSuccess }) => {
  const [form] = Form.useForm();
  const updateStudentMutation = useUpdateStudent();
  const updateManagerMutation = useUpdateManager();

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        gradeLevel: user.gradeLevel,
        department: user.department,
        status: user.status,
      });
    }
  }, [open, user, form]);

  if (!user) return null;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (activeTab === 'students') {
        const updateData = {
          fullName: values.fullName,
          email: values.email,
          gradeLevel: values.gradeLevel,
          status: values.status,
          ...(values.password && { password: values.password }),
        };
        
        await updateStudentMutation.mutateAsync({
          studentId: user.id,
          data: updateData,
        });
      } else {
        const updateData = {
          fullName: values.fullName,
          email: values.email,
          department: values.department || null,
          status: values.status,
          ...(values.password && { password: values.password }),
        };
        
        await updateManagerMutation.mutateAsync({
          managerId: user.id,
          data: updateData,
        });
      }
      
      form.resetFields();
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Form validation or API error:', error);
    }
  };

  const isLoading = activeTab === 'students' 
    ? updateStudentMutation.isPending 
    : updateManagerMutation.isPending;

  return (
    <Modal
      title={`Edit ${user.fullName || user.name}`}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      okButtonProps={{
        style: {
          backgroundColor: '#00B894',
          borderColor: '#00B894',
        },
      }}
      cancelButtonProps={{
        style: {
          borderColor: '#00B894',
        },
        className: 'hover:!text-[#00b894] hover:!border-[#00b894]',
      }}
    >
      <Form form={form} layout='vertical'>
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
              tooltip='Leave empty to keep current password. Students authenticate via email/NFC tokens.'
            >
              <Input.Password placeholder='Enter new password (optional)' />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item label='Department' name='department'>
              <Input placeholder='Enter department (optional)' />
            </Form.Item>

            <Form.Item 
              label='Password (Optional)' 
              name='password'
              tooltip='Leave empty to keep current password'
            >
              <Input.Password placeholder='Enter new password (optional)' />
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

        <div className='flex justify-end mt-4 gap-2'>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type='primary'
            loading={isLoading}
            onClick={handleSubmit}
            style={{
              backgroundColor: '#00B894',
              borderColor: '#00B894',
            }}
            className='hover:!bg-[#00b894] hover:!border-[#00b894]'
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
