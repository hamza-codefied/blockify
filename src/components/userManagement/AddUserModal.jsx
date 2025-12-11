'use client';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { useCreateStudent } from '@/hooks/useStudents';
import { useCreateManager } from '@/hooks/useManagers';
import { useGetGrades } from '@/hooks/useGrades';
import { formatGradeDisplayName, getDefaultGradeQueryParams } from '@/utils/grade.utils';

const { Option } = Select;

export const AddUserModal = ({ open, onClose, activeTab, onSuccess }) => {
  const [form] = Form.useForm();
  const createStudentMutation = useCreateStudent();
  const createManagerMutation = useCreateManager();
  
  // Fetch grades for dropdown
  const { data: gradesData } = useGetGrades({ 
    limit: 100, 
    ...getDefaultGradeQueryParams()
  });
  const grades = gradesData?.data || [];

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
        // Map form values to API format - convert gradeId to gradeName
        const selectedGrade = grades.find(g => g.id === values.gradeId);
        const studentData = {
          fullName: values.name || values.fullName,
          email: values.email,
          gradeName: selectedGrade?.gradeName || values.gradeName, // Use gradeName from selected grade
          // Password removed - students authenticate via email/NFC tokens
          status: values.status || 'active',
        };
        
        await createStudentMutation.mutateAsync(studentData);
      } else {
        // Map form values to API format - convert gradeIds to gradeNames array
        const selectedGradeNames = (values.gradeIds || []).map(gradeId => {
          const grade = grades.find(g => g.id === gradeId);
          return grade?.gradeName;
        }).filter(Boolean);
        
        const managerData = {
          fullName: values.name || values.fullName,
          email: values.email,
          password: values.password, // Required for managers
          department: values.department || null,
          gradeNames: selectedGradeNames.length > 0 ? selectedGradeNames : (values.gradeNames || []), // Array of grade names
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
              label='Grade' 
              name='gradeId'
              rules={[{ required: true, message: 'Grade is required' }]}
            >
              <Select 
                placeholder='Select grade'
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={grades.map(grade => ({
                  value: grade.id,
                  label: formatGradeDisplayName(grade)
                }))}
              />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item 
              label='Password' 
              name='password'
              rules={[
                { required: true, message: 'Password is required' },
                { min: 8, message: 'Password must be at least 8 characters' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
                }
              ]}
            >
              <Input.Password placeholder='Enter password' />
            </Form.Item>

            <Form.Item label='Department' name='department'>
              <Input placeholder='Enter department (optional)' />
            </Form.Item>

            <Form.Item 
              label='Grades' 
              name='gradeIds'
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
                  value: grade.id,
                  label: formatGradeDisplayName(grade)
                }))}
              />
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
