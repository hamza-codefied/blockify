'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  Select,
  Row,
  Col,
  Button,
  TimePicker,
  Typography,
  Input,
} from 'antd';
import dayjs from 'dayjs';
import { useCreateSchedule } from '@/hooks/useSchedules';
import { useGetGrades } from '@/hooks/useGrades';
import { useGetSchoolSettings } from '@/hooks/useSchool';
import { useAuthStore } from '@/store/authStore';
import {
  formatGradeDisplayName,
  getDefaultGradeQueryParams,
} from '@/utils/grade.utils';
import { useGetManagers } from '@/hooks/useManagers';

const { Text } = Typography;

// Full day mapping including weekends: Monday=1, Tuesday=2, ..., Saturday=6, Sunday=0
const ALL_DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_NUMBERS = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export const AddSessionModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [selectedDays, setSelectedDays] = useState([]);
  const [pendingTimes, setPendingTimes] = useState({});
  const createScheduleMutation = useCreateSchedule();

  const { user } = useAuthStore();
  const schoolId = user?.schoolId || user?.school_id || user?.school?.id;

  // Fetch school settings to check enableWeekendSessions
  const { data: settingsData } = useGetSchoolSettings(schoolId);
  const enableWeekendSessions =
    settingsData?.data?.enableWeekendSessions ?? false;

  // Dynamic days list based on school settings
  const daysList = useMemo(() => {
    return enableWeekendSessions ? ALL_DAY_NAMES : WEEKDAY_NAMES;
  }, [enableWeekendSessions]);

  // Fetch grades and managers
  const { data: gradesData } = useGetGrades({
    page: 1,
    limit: 100,
    ...getDefaultGradeQueryParams(),
  });
  const { data: managersData } = useGetManagers({
    page: 1,
    limit: 100,
    status: 'active',
  });
  const grades = gradesData?.data || [];
  const managers = managersData?.data || [];

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedDays([]);
    }
  }, [open, form]);

  const toggleDay = day => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const { gradeId, managerId, name, additionalGradeIds } = values;

      // Filter out primary grade from additional grades if it's included
      const filteredAdditionalGradeIds = (additionalGradeIds || []).filter(
        id => id !== gradeId
      );

      // Create a schedule for each selected day with its specific times
      const schedulePromises = selectedDays.map(day => {
        const dayOfWeek = DAY_NUMBERS[day];
        const startTimeKey = `startTime_${day}`;
        const endTimeKey = `endTime_${day}`;
        const startTime = values[startTimeKey];
        const endTime = values[endTimeKey];

        // Convert dayjs to HH:mm format
        const startTimeStr = startTime ? startTime.format('HH:mm') : null;
        const endTimeStr = endTime ? endTime.format('HH:mm') : null;

        return createScheduleMutation.mutateAsync({
          gradeId,
          managerId,
          name: name.trim(),
          dayOfWeek,
          startTime: startTimeStr,
          endTime: endTimeStr,
          additionalGradeIds: filteredAdditionalGradeIds.length > 0 ? filteredAdditionalGradeIds : undefined,
        });
      });

      await Promise.all(schedulePromises);

      form.resetFields();
      setSelectedDays([]);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to create schedules:', error);
    }
  };

  return (
    <Modal
      title='Add Schedule'
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={700}
      bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
      className='rounded-xl'
    >
      <Form form={form} layout='vertical'>
        {/* ===== Grade Select ===== */}
        <Form.Item
          label='Primary Grade'
          name='gradeId'
          rules={[{ required: true, message: 'Please select primary grade' }]}
          tooltip='The primary grade for this schedule. You can add additional grades below.'
        >
          <Select placeholder='Select primary grade' loading={!gradesData}>
            {grades.map(grade => (
              <Select.Option key={grade.id} value={grade.id}>
                {formatGradeDisplayName(grade)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* ===== Additional Grades Select ===== */}
        <Form.Item
          label='Additional Grades (Optional)'
          name='additionalGradeIds'
          tooltip='Select additional grades that can also use this schedule (e.g., for cross-grade classes)'
        >
          <Select
            mode='multiple'
            placeholder='Select additional grades (optional)'
            loading={!gradesData}
            filterOption={(input, option) =>
              (option?.children?.toLowerCase() ?? '').includes(input.toLowerCase())
            }
          >
            {grades.map(grade => (
              <Select.Option key={grade.id} value={grade.id}>
                {formatGradeDisplayName(grade)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* ===== Manager Select ===== */}
        <Form.Item
          label='Manager'
          name='managerId'
          rules={[{ required: true, message: 'Please select manager' }]}
        >
          <Select placeholder='Select manager' loading={!managersData}>
            {managers.map(manager => (
              <Select.Option key={manager.id} value={manager.id}>
                {manager.fullName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* ===== Course Name (Required) ===== */}
        <Form.Item
          label='Course Name'
          name='name'
          rules={[
            { required: true, message: 'Please enter course name' },
            { whitespace: true, message: 'Course name cannot be empty' }
          ]}
          tooltip='Enter the course name for this schedule (e.g., "Math", "English", "Science")'
        >
          <Input placeholder='e.g., Math, English, Science' maxLength={200} />
        </Form.Item>

        {/* ===== Select Days (Mon–Fri) ===== */}
        <Form.Item
          label='Select Days'
          required
          validateStatus={selectedDays.length === 0 ? 'error' : ''}
          help={
            selectedDays.length === 0 ? 'Please select at least one day' : ''
          }
        >
          <div className='flex flex-wrap mt-2 mb-4 w-full justify-between'>
            {daysList.map(day => {
              const selected = selectedDays.includes(day);
              return (
                <div
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    selected
                      ? 'bg-[#151515] text-white border-b-4 border-[#00B894]'
                      : 'bg-white hover:bg-gray-200 text-black border-2 border-gray-200 shadow-lg'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </Form.Item>

        {/* ===== Time Selection (Separate for each selected day) ===== */}
        {selectedDays.length > 0 && (
          <div className='space-y-4'>
            {selectedDays.map(day => (
              <div
                key={day}
                className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'
              >
                <Text strong className='text-base mb-3 block'>
                  {day}
                </Text>
                <Row gutter={16}>
                  <Col xs={12}>
                    <Form.Item
                      label='Start Time'
                      name={`startTime_${day}`}
                      rules={[
                        { required: true, message: 'Please select start time' },
                      ]}
                    >
                      <TimePicker
                        style={{ width: '100%' }}
                        use12Hours
                        format='hh:mm A'
                        defaultOpenValue={dayjs('08:00', 'HH:mm')}
                        placeholder='Select start time'
                        onSelect={time => {
                          const key = `startTime_${day}`;
                          setPendingTimes(prev => ({ ...prev, [key]: time }));
                          form.setFieldValue(key, time);
                        }}
                        onOpenChange={open => {
                          const key = `startTime_${day}`;
                          if (!open && pendingTimes[key]) {
                            form.setFieldValue(key, pendingTimes[key]);
                            setPendingTimes(prev => {
                              const newState = { ...prev };
                              delete newState[key];
                              return newState;
                            });
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12}>
                    <Form.Item
                      label='End Time'
                      name={`endTime_${day}`}
                      rules={[
                        { required: true, message: 'Please select end time' },
                      ]}
                    >
                      <TimePicker
                        style={{ width: '100%' }}
                        use12Hours
                        format='hh:mm A'
                        defaultOpenValue={dayjs('17:00', 'HH:mm')}
                        placeholder='Select end time'
                        onSelect={time => {
                          const key = `endTime_${day}`;
                          setPendingTimes(prev => ({ ...prev, [key]: time }));
                          form.setFieldValue(key, time);
                        }}
                        onOpenChange={open => {
                          const key = `endTime_${day}`;
                          if (!open && pendingTimes[key]) {
                            form.setFieldValue(key, pendingTimes[key]);
                            setPendingTimes(prev => {
                              const newState = { ...prev };
                              delete newState[key];
                              return newState;
                            });
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        )}

        {selectedDays.length > 0 && (
          <div className='mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <Text type='secondary' className='text-sm'>
              This will create schedules for: {selectedDays.join(', ')}
            </Text>
          </div>
        )}

        {/* ===== Save Button ===== */}
        <Form.Item className='text-center mt-6'>
          <Button
            type='primary'
            onClick={handleSave}
            loading={createScheduleMutation.isPending}
            disabled={selectedDays.length === 0}
            className='bg-[#00B894] hover:bg-[#019a7d] font-semibold px-10'
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSessionModal;
