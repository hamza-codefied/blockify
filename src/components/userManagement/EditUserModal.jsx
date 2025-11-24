'use client';
import React, { useEffect } from 'react';
import { Modal, Input, Form, Button, Select } from 'antd';
import { useUpdateStudent } from '@/hooks/useStudents';
import { useUpdateManager } from '@/hooks/useManagers';
import { useGetGrades } from '@/hooks/useGrades';

const { Option } = Select;

export const EditUserModal = ({ open, onClose, user, activeTab, onSuccess }) => {
  const [form] = Form.useForm();
  const updateStudentMutation = useUpdateStudent();
  const updateManagerMutation = useUpdateManager();
  
  // Fetch grades for dropdown
  const { data: gradesData } = useGetGrades({ 
    limit: 100, 
    sort: 'grade_name', 
    sortOrder: 'ASC' 
  });
  const grades = gradesData?.data || [];

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        gradeName: user.gradeName, // Use gradeName instead of gradeLevel
        gradeNames: user.grades?.map(g => g.gradeName) || user.gradeNames || [], // For managers
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
          gradeName: values.gradeName, // Use gradeName instead of gradeLevel
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
          gradeNames: values.gradeNames || [], // Array of grade names
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
              label='Grade' 
              name='gradeName'
              rules={[{ required: true, message: 'Grade is required' }]}
            >
              <Select 
                placeholder='Select grade'
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={grades.map(grade => ({
                  value: grade.gradeName,
                  label: grade.gradeName
                }))}
              />
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
              label='Grades' 
              name='gradeNames'
              rules={[
                { required: true, message: 'At least one grade is required' },
                { type: 'array', min: 1, message: 'Manager must be assigned to at least one grade' }
              ]}
              tooltip='Select one or more grades this manager will manage'
            >
              <Select
                mode="multiple"
                placeholder='Select grades'
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={grades.map(grade => ({
                  value: grade.gradeName,
                  label: grade.gradeName
                }))}
              />
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
