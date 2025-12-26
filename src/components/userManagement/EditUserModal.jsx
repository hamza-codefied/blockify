'use client';
import React, { useEffect, useMemo } from 'react';
import { Modal, Input, Form, Button, Select, Divider } from 'antd';
import './UserModal.css';
import { useGetStudent, useUpdateStudent } from '@/hooks/useStudents';
import { useUpdateManager } from '@/hooks/useManagers';
import { useGetGrades } from '@/hooks/useGrades';
import { useGetRoles } from '@/hooks/useRoles';
import { useGetSchedules } from '@/hooks/useSchedules';
import { useQueryClient } from '@tanstack/react-query';
import { formatGradeDisplayName, getDefaultGradeQueryParams } from '@/utils/grade.utils';
import { ScheduleSelector } from './ScheduleSelector';

const { Option } = Select;

export const EditUserModal = ({ open, onClose, user, activeTab, onSuccess }) => {
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = React.useState(null);
  const queryClient = useQueryClient();
  const updateStudentMutation = useUpdateStudent();
  const updateManagerMutation = useUpdateManager();
  
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

  // Get selected grade ID for schedule fetching (from form watch)
  const selectedGradeId = Form.useWatch('gradeId', form);
  
  // Also compute gradeId from user object for initial load (fallback)
  const userGradeId = React.useMemo(() => {
    if (!user || !grades.length || activeTab !== 'students') return null;
    if (user.gradeName) {
      const matchingGrade = grades.find(g => {
        const displayName = formatGradeDisplayName(g);
        return displayName === user.gradeName || g.gradeName === user.gradeName;
      });
      return matchingGrade?.id || null;
    }
    return null;
  }, [user, grades, activeTab]);
  
  // Use selectedGradeId from form if available, otherwise fall back to userGradeId
  const effectiveGradeId = selectedGradeId || userGradeId;
  
  // Get selected schedule IDs (must be at top level, not conditional)
  const selectedScheduleIds = Form.useWatch('scheduleIds', form) || [];
  
  // Fetch schedules for selected grade (students only)
  // When editing a student, include studentId to get isSelected flags
  const { data: schedulesData, isLoading: schedulesLoading } = useGetSchedules(
    activeTab === 'students' && effectiveGradeId
      ? { 
          gradeId: effectiveGradeId, 
          limit: 1000,
          ...(user?.id && activeTab === 'students' ? { studentId: user.id } : {})
        }
      : {},
    activeTab === 'students' && !!effectiveGradeId
  );
  // API returns: { success: true, message: "...", data: [...schedules...], pagination: {...} }
  // So data is already the schedules array
  const availableSchedules = Array.isArray(schedulesData?.data) ? schedulesData.data : [];

  // Fetch latest student details (includes scheduleIds) when modal opens
  const { data: studentDetailsData } = useGetStudent(
    user?.id,
    open && activeTab === 'students' && !!user?.id
  );
  const studentScheduleIdsFromAPI = Array.isArray(studentDetailsData?.data?.scheduleIds)
    ? studentDetailsData.data.scheduleIds
    : [];

  // Invalidate and refetch schedules when modal opens for a student
  // This ensures fresh data with correct isSelected flags
  useEffect(() => {
    if (open && user && activeTab === 'students' && effectiveGradeId) {
      // Invalidate schedules query to force refetch when modal opens
      queryClient.invalidateQueries({ 
        queryKey: ['schedules', { gradeId: effectiveGradeId, studentId: user.id }] 
      });
      // Also invalidate student details so scheduleIds are always fresh
      queryClient.invalidateQueries({
        queryKey: ['students', user.id]
      });
    }
  }, [open, user, activeTab, effectiveGradeId, queryClient]);

  // Student edit: always sync selected schedules from student details (single source of truth).
  // Keep this independent from schedules list loading, so it works consistently on every open.
  useEffect(() => {
    if (!open || activeTab !== 'students' || !user?.id) return;
    if (!studentDetailsData?.data) return;

    form.setFieldsValue({ scheduleIds: studentScheduleIdsFromAPI });

    setInitialValues(prev => {
      const baseValues = prev || {
        fullName: user.fullName,
        email: user.email,
        gradeId: effectiveGradeId || null,
        status: user.status || 'active',
      };
      return {
        ...baseValues,
        scheduleIds: studentScheduleIdsFromAPI
      };
    });
  }, [open, activeTab, user?.id, studentDetailsData?.data, studentScheduleIdsFromAPI, effectiveGradeId, form]);

  useEffect(() => {
    if (open && user && grades.length > 0) {
      // Find grade ID from gradeName for students
      let gradeId = null;
      if (user.gradeName && grades.length > 0) {
        // Try to find exact match first (gradeName + section if exists)
        const matchingGrade = grades.find(g => {
          const displayName = formatGradeDisplayName(g);
          return displayName === user.gradeName || g.gradeName === user.gradeName;
        });
        gradeId = matchingGrade?.id || null;
      }
      
      // Find grade IDs from gradeNames for managers
      let gradeIds = [];
      if (user.grades && user.grades.length > 0) {
        gradeIds = user.grades.map(grade => {
          const matchingGrade = grades.find(g => g.gradeName === grade.gradeName);
          return matchingGrade?.id;
        }).filter(Boolean);
      } else if (user.gradeNames && user.gradeNames.length > 0) {
        gradeIds = user.gradeNames.map(gradeName => {
          const matchingGrade = grades.find(g => g.gradeName === gradeName);
          return matchingGrade?.id;
        }).filter(Boolean);
      }
      
      const formValues = {
        fullName: user.fullName,
        email: user.email,
        gradeId: gradeId, // Use gradeId instead of gradeName
        gradeIds: gradeIds.length > 0 ? gradeIds : [], // For managers
        roleId: user.roleId || user.role?.id, // For managers
        phone: user.phone || null,
        address: user.address || null,
        zipcode: user.zipcode || null,
        // Student guardian fields
        guardian_name: user.guardian_name || null,
        guardian_phone: user.guardian_phone || null,
        guardian_email: user.guardian_email || null,
        guardian_address: user.guardian_address || null,
        guardian_zipcode: user.guardian_zipcode || null,
        scheduleIds: [], // Will be updated by schedules useEffect after API loads with isSelected flags
        status: user.status,
      };
      
      form.setFieldsValue(formValues);
      //>>> Store initial values for change detection (without scheduleIds - will be set by schedules useEffect)
      setInitialValues({ ...formValues, scheduleIds: [] });
    }
  }, [open, user, form, grades]);

  if (!user) return null;

  //>>> Helper to compare arrays (for scheduleIds and gradeIds)
  const arraysEqual = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  //>>> Helper to get only changed fields
  const getChangedFields = (currentValues, initialValues) => {
    const changed = {};
    
    for (const key in currentValues) {
      const currentValue = currentValues[key];
      const initialValue = initialValues[key];
      
      //>>> Handle arrays (scheduleIds, gradeIds)
      if (Array.isArray(currentValue) || Array.isArray(initialValue)) {
        if (!arraysEqual(currentValue || [], initialValue || [])) {
          changed[key] = currentValue || [];
        }
      }
      //>>> Handle null/undefined/empty string normalization
      else if (currentValue !== initialValue) {
        //>>> Only include if value actually changed (not just null -> null)
        if (currentValue !== null && currentValue !== undefined && currentValue !== '') {
          changed[key] = currentValue;
        } else if (initialValue !== null && initialValue !== undefined && initialValue !== '') {
          //>>> Field was cleared
          changed[key] = null;
        }
      }
    }
    
    return changed;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (activeTab === 'students') {
        //>>> Get only changed fields
        const changedFields = getChangedFields(values, initialValues || {});
        
        //>>> If nothing changed, don't send request
        if (Object.keys(changedFields).length === 0) {
          onClose();
          return;
        }
        
        //>>> Build update data with only changed fields
        const updateData = {};
        
        if ('fullName' in changedFields) updateData.fullName = changedFields.fullName;
        if ('email' in changedFields) updateData.email = changedFields.email;
        if ('gradeId' in changedFields) {
          const selectedGrade = grades.find(g => g.id === changedFields.gradeId);
          updateData.gradeName = selectedGrade?.gradeName || changedFields.gradeName;
        }
        if ('phone' in changedFields) updateData.phone = changedFields.phone || null;
        if ('address' in changedFields) updateData.address = changedFields.address || null;
        if ('zipcode' in changedFields) updateData.zipcode = changedFields.zipcode || null;
        if ('guardian_name' in changedFields) updateData.guardian_name = changedFields.guardian_name || null;
        if ('guardian_phone' in changedFields) updateData.guardian_phone = changedFields.guardian_phone || null;
        if ('guardian_email' in changedFields) updateData.guardian_email = changedFields.guardian_email || null;
        if ('guardian_address' in changedFields) updateData.guardian_address = changedFields.guardian_address || null;
        if ('guardian_zipcode' in changedFields) updateData.guardian_zipcode = changedFields.guardian_zipcode || null;
        if ('status' in changedFields) updateData.status = changedFields.status;
        if ('scheduleIds' in changedFields) updateData.scheduleIds = changedFields.scheduleIds || [];
        if ('password' in changedFields && changedFields.password) updateData.password = changedFields.password;
        
        await updateStudentMutation.mutateAsync({
          studentId: user.id,
          data: updateData,
        });
      } else {
        //>>> Get only changed fields
        const changedFields = getChangedFields(values, initialValues || {});
        
        //>>> If nothing changed, don't send request
        if (Object.keys(changedFields).length === 0) {
          onClose();
          return;
        }
        
        //>>> Build update data with only changed fields
        const updateData = {};
        
        if ('fullName' in changedFields) updateData.fullName = changedFields.fullName;
        if ('email' in changedFields) updateData.email = changedFields.email;
        if ('roleId' in changedFields) updateData.roleId = changedFields.roleId;
        if ('phone' in changedFields) updateData.phone = changedFields.phone || null;
        if ('address' in changedFields) updateData.address = changedFields.address || null;
        if ('zipcode' in changedFields) updateData.zipcode = changedFields.zipcode || null;
        if ('gradeIds' in changedFields) updateData.gradeIds = changedFields.gradeIds || [];
        if ('status' in changedFields) updateData.status = changedFields.status;
        if ('password' in changedFields && changedFields.password) updateData.password = changedFields.password;
        
        await updateManagerMutation.mutateAsync({
          managerId: user.id,
          data: updateData,
        });
      }
      
      //>>> Call onSuccess callback before closing to allow parent to refetch data
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Form validation or API error:', error);
    }
  };

  const isLoading = activeTab === 'students' 
    ? updateStudentMutation.isPending 
    : updateManagerMutation.isPending;

  return (
      <Modal
        title={<div className="user-modal-header">{`Edit ${activeTab === 'students' ? 'Student' : 'Manager'}`}</div>}
        open={open}
        destroyOnClose
        onCancel={() => {
          onClose();
        }}
      footer={
        <div className="user-modal-footer">
          <Button key="cancel" onClick={() => {
            onClose();
          }}>
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
            Save Changes
          </Button>
        </div>
      }
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
      <div className="user-modal-body">
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
        </Form>
      </div>
    </Modal>
  );
};
