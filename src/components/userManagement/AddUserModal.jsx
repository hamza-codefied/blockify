'use client';
import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Input, Select, Divider, Button } from 'antd';
import './UserModal.css';
import { useCreateStudent } from '@/hooks/useStudents';
import { useCreateManager } from '@/hooks/useManagers';
import { useGetGrades } from '@/hooks/useGrades';
import { useGetRoles } from '@/hooks/useRoles';
import { useGetSchedules } from '@/hooks/useSchedules';
import { formatGradeDisplayName, getDefaultGradeQueryParams } from '@/utils/grade.utils';
import { ScheduleSelector } from './ScheduleSelector';

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

  // Fetch roles for manager role selection
  const { data: rolesData } = useGetRoles(activeTab === 'managers');
  const roles = rolesData?.data || [];

  // Filter roles: only "manager" default role OR custom roles (isSystemRole = false)
  const availableRoles = useMemo(() => {
    if (activeTab !== 'managers') return [];
    return roles.filter(role =>
      role.roleName === 'manager' || !role.isSystemRole
    );
  }, [roles, activeTab]);

  // Get selected grade ID for schedule fetching
  const selectedGradeId = Form.useWatch('gradeId', form);

  // Get selected schedule IDs (must be at top level, not conditional)
  const selectedScheduleIds = Form.useWatch('scheduleIds', form) || [];

  // Fetch schedules for selected grade (students only)
  const { data: schedulesData, isLoading: schedulesLoading } = useGetSchedules(
    activeTab === 'students' && selectedGradeId
      ? { gradeId: selectedGradeId, includeCustom: true, limit: 1000 }
      : {},
    activeTab === 'students' && !!selectedGradeId
  );
  // API returns: { success: true, message: "...", data: [...schedules...], pagination: {...} }
  // So data is already the schedules array, not nested
  const availableSchedules = Array.isArray(schedulesData?.data) ? schedulesData.data : (schedulesData?.data?.schedules || []);

  // Debug: Log schedules data
  useEffect(() => {
    if (activeTab === 'students' && selectedGradeId) {
      console.log('Schedules Data:', schedulesData);
      console.log('Available Schedules:', availableSchedules);
    }
  }, [schedulesData, availableSchedules, activeTab, selectedGradeId]);

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
          phone: values.phone || null,
          address: values.address || null,
          zipcode: values.zipcode || null,
          guardian_name: values.guardian_name || null,
          guardian_phone: values.guardian_phone || null,
          guardian_email: values.guardian_email || null,
          guardian_address: values.guardian_address || null,
          guardian_zipcode: values.guardian_zipcode || null,
          status: values.status || 'active',
          scheduleIds: values.scheduleIds || [], // Optional array of schedule IDs
        };

        await createStudentMutation.mutateAsync(studentData);
      } else {
        // Map form values to API format - send gradeIds directly (UUIDs)
        const managerData = {
          fullName: values.name || values.fullName,
          email: values.email,
          password: values.password, // Required for managers
          roleId: values.roleId, // Required - UUID of role
          phone: values.phone || null,
          address: values.address || null,
          zipcode: values.zipcode || null,
          gradeIds: values.gradeIds || [], // Array of grade UUIDs (from dropdown selection)
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
      title={<div className="user-modal-header">{`Add ${activeTab === 'students' ? 'Student' : 'Manager'}`}</div>}
      open={open}
      onCancel={onClose}
      centered
      className="user-modal-content"
      styles={{
        content: {
          padding: 0,
        },
        body: {
          padding: 0,
        },
        header: {
          padding: 0,
        },
        footer: {
          padding: 0,
        }
      }}
      footer={
        <div className="user-modal-footer">
          <Button key="cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button
            key="save"
            type='primary'
            loading={isLoading}
            onClick={handleSubmit}
            style={{
              backgroundColor: '#00B894',
              borderColor: '#00B894',
            }}
            className='hover:!bg-[#00b894] hover:!border-[#00b894]'
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="user-modal-body">
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

              <Form.Item
                label='Schedules (Optional)'
                name='scheduleIds'
                tooltip='Select schedules for this student. Schedules must not conflict (same day, overlapping times).'
              >
                {activeTab === 'students' && selectedGradeId ? (
                  <ScheduleSelector
                    schedules={availableSchedules}
                    selectedScheduleIds={selectedScheduleIds}
                    onChange={(scheduleIds) => form.setFieldsValue({ scheduleIds })}
                    loading={schedulesLoading}
                    disabled={!selectedGradeId || schedulesLoading}
                  />
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    {!selectedGradeId ? 'Please select a grade first' : 'Schedules are only available for students'}
                  </div>
                )}
              </Form.Item>

              <Divider orientation="left" style={{ margin: '16px 0' }}>Contact Information</Divider>

              <Form.Item
                label='Phone'
                name='phone'
                rules={[{ max: 20, message: 'Phone must not exceed 20 characters' }]}
              >
                <Input placeholder='Enter phone number (optional)' />
              </Form.Item>

              <Form.Item
                label='Address'
                name='address'
                rules={[{ max: 500, message: 'Address must not exceed 500 characters' }]}
              >
                <Input.TextArea
                  placeholder='Enter address (optional)'
                  rows={2}
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label='Zipcode'
                name='zipcode'
                rules={[{ max: 20, message: 'Zipcode must not exceed 20 characters' }]}
              >
                <Input placeholder='Enter zipcode (optional)' />
              </Form.Item>

              <Divider orientation="left" style={{ margin: '16px 0' }}>Guardian Information</Divider>

              <Form.Item
                label='Guardian Name'
                name='guardian_name'
                rules={[{ max: 200, message: 'Guardian name must not exceed 200 characters' }]}
              >
                <Input placeholder='Enter guardian name (optional)' />
              </Form.Item>

              <Form.Item
                label='Guardian Phone'
                name='guardian_phone'
                rules={[{ max: 20, message: 'Guardian phone must not exceed 20 characters' }]}
              >
                <Input placeholder='Enter guardian phone (optional)' />
              </Form.Item>

              <Form.Item
                label='Guardian Email'
                name='guardian_email'
                rules={[
                  { type: 'email', message: 'Please enter a valid email address' },
                  { max: 200, message: 'Guardian email must not exceed 200 characters' }
                ]}
              >
                <Input placeholder='Enter guardian email (optional)' />
              </Form.Item>

              <Form.Item
                label='Guardian Address'
                name='guardian_address'
                rules={[{ max: 500, message: 'Guardian address must not exceed 500 characters' }]}
              >
                <Input.TextArea
                  placeholder='Enter guardian address (optional)'
                  rows={2}
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label='Guardian Zipcode'
                name='guardian_zipcode'
                rules={[{ max: 20, message: 'Guardian zipcode must not exceed 20 characters' }]}
              >
                <Input placeholder='Enter guardian zipcode (optional)' />
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

              <Form.Item
                label='Role'
                name='roleId'
                rules={[{ required: true, message: 'Role is required' }]}
                tooltip='Select a role for this manager. Only manager default role and custom roles are available.'
              >
                <Select
                  placeholder='Select role'
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={availableRoles.map(role => ({
                    value: role.id,
                    label: role.displayName || role.roleName
                  }))}
                />
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

              <Divider orientation="left" style={{ margin: '16px 0' }}>Contact Information</Divider>

              <Form.Item
                label='Phone'
                name='phone'
                rules={[{ max: 20, message: 'Phone must not exceed 20 characters' }]}
              >
                <Input placeholder='Enter phone number (optional)' />
              </Form.Item>

              <Form.Item
                label='Address'
                name='address'
                rules={[{ max: 500, message: 'Address must not exceed 500 characters' }]}
              >
                <Input.TextArea
                  placeholder='Enter address (optional)'
                  rows={2}
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label='Zipcode'
                name='zipcode'
                rules={[{ max: 20, message: 'Zipcode must not exceed 20 characters' }]}
              >
                <Input placeholder='Enter zipcode (optional)' />
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
      </div>
    </Modal>
  );
};
