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
  InputNumber,
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

export const AddSessionModal = ({ open, onClose, onSuccess, defaultDay }) => {
  const [form] = Form.useForm();
  const [selectedDays, setSelectedDays] = useState([]);
  const createScheduleMutation = useCreateSchedule();

  const [scheduleType, setScheduleType] = useState('grade'); // 'grade' | 'custom'

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
  //>>> Managers API returns { success: true, data: { managers: [...], pagination: {...} } }
  const allManagers = managersData?.data?.managers || managersData?.data || [];

  // Watch selected grade to filter managers
  const selectedGradeId = Form.useWatch('gradeId', form);

  // Filter managers by selected grade
  const managers = useMemo(() => {
    if (!selectedGradeId) {
      return []; // Don't show any managers until a grade is selected
    }
    return allManagers.filter(manager => {
      // Check if manager has the selected grade in their gradeIds array
      return manager.gradeIds && manager.gradeIds.includes(selectedGradeId);
    });
  }, [allManagers, selectedGradeId]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedDays([]);
      setScheduleType('grade');
      form.setFieldsValue({ type: 'grade' });
    } else if (defaultDay && typeof defaultDay === 'string') {
      // If a default day is provided (from clicking "+" on row), pre-select it
      setSelectedDays([defaultDay]);
      // Initialize with one empty slot for the default day
      form.setFieldsValue({
        times: {
          [defaultDay]: [{ startTime: null, endTime: null }]
        }
      });
    }
  }, [open, form, defaultDay]);

  //>>> Clear manager selection when grade changes
  useEffect(() => {
    if (selectedGradeId) {
      const currentManagerId = form.getFieldValue('managerId');
      if (currentManagerId) {
        //>>> Check if current manager is still valid for the new grade
        const currentManager = allManagers.find(m => m.id === currentManagerId);
        if (!currentManager || !currentManager.gradeIds?.includes(selectedGradeId)) {
          form.setFieldValue('managerId', undefined);
        }
      }
    } else {
      //>>> Clear manager if no grade is selected
      form.setFieldValue('managerId', undefined);
    }
  }, [selectedGradeId, allManagers, form]);

  const toggleDay = day => {
    if (selectedDays.includes(day)) {
      const newSelectedDays = selectedDays.filter(d => d !== day);
      setSelectedDays(newSelectedDays);

      // Clear times for unselected day
      const currentTimes = form.getFieldValue('times') || {};
      const newTimes = { ...currentTimes };
      delete newTimes[day];
      form.setFieldValue('times', newTimes);
    } else {
      setSelectedDays([...selectedDays, day]);
      // Initialize with one empty slot for the new day
      const currentTimes = form.getFieldValue('times') || {};
      form.setFieldValue('times', {
        ...currentTimes,
        [day]: [{ startTime: null, endTime: null }]
      });
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const { gradeId, managerId, name, additionalGradeIds, type, capacity, times } = values;

      // Filter out primary grade from additional grades if it's included
      const filteredAdditionalGradeIds = (additionalGradeIds || []).filter(
        id => id !== gradeId
      );

      const schedulePromises = [];

      selectedDays.forEach(day => {
        const dayOfWeek = DAY_NUMBERS[day];
        const dayTimes = times[day] || [];

        dayTimes.forEach(({ startTime, endTime }) => {
          if (!startTime || !endTime) return;

          // Convert dayjs to HH:mm format
          const startTimeStr = startTime.format('HH:mm');
          const endTimeStr = endTime.format('HH:mm');

          const payload = {
            type,
            name: name.trim(),
            dayOfWeek,
            startTime: startTimeStr,
            endTime: endTimeStr,
          };

          if (type === 'grade') {
            payload.gradeId = gradeId;
            payload.managerId = managerId;
            if (filteredAdditionalGradeIds.length > 0) {
              payload.additionalGradeIds = filteredAdditionalGradeIds;
            }
          } else {
            payload.capacity = capacity;
          }

          schedulePromises.push(createScheduleMutation.mutateAsync(payload));
        });
      });

      if (schedulePromises.length === 0) {
        return; // No valid times to save
      }

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
      <Form form={form} layout='vertical' initialValues={{ type: 'grade' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Schedule Type"
              name="type"
              rules={[{ required: true, message: 'Please select type' }]}
            >
              <Select onChange={setScheduleType}>
                <Select.Option value="grade">Grade Schedule</Select.Option>
                <Select.Option value="custom">Custom Group</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
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
          </Col>
        </Row>

        {scheduleType === 'grade' ? (
          <>
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
          </>
        ) : (
          <Form.Item
            label="Capacity (Optional)"
            name="capacity"
            tooltip="Maximum number of students allowed in this group"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Max students" />
          </Form.Item>
        )}

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
                  className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selected
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

        {/* ===== Time Selection (Dynamic List per Day) ===== */}
        {selectedDays.length > 0 && (
          <div className='space-y-6'>
            {selectedDays.map(day => (
              <div
                key={day}
                className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/50'
              >
                <div className='flex justify-between items-center mb-3'>
                  <Text strong className='text-base'>
                    {day}
                  </Text>
                </div>

                <Form.List name={['times', day]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }, index) => (
                        <Row key={key} gutter={16} align="middle" className="mb-3">
                          <Col flex="1">
                            <Form.Item
                              {...restField}
                              name={[name, 'startTime']}
                              rules={[{ required: true, message: 'Required' }]}
                              className="mb-0"
                            >
                              <TimePicker
                                style={{ width: '100%' }}
                                use12Hours
                                format='hh:mm A'
                                placeholder='Start'
                                defaultOpenValue={dayjs('08:00', 'HH:mm')}
                              />
                            </Form.Item>
                          </Col>
                          <Col flex="none">
                            <span className="text-gray-400 font-medium">-</span>
                          </Col>
                          <Col flex="1">
                            <Form.Item
                              {...restField}
                              name={[name, 'endTime']}
                              rules={[{ required: true, message: 'Required' }]}
                              className="mb-0"
                            >
                              <TimePicker
                                style={{ width: '100%' }}
                                use12Hours
                                format='hh:mm A'
                                placeholder='End'
                                defaultOpenValue={dayjs('09:00', 'HH:mm')}
                              />
                            </Form.Item>
                          </Col>
                          <Col flex="none">
                            {fields.length > 1 ? (
                              <Button
                                type="text"
                                danger
                                onClick={() => remove(name)}
                                className="flex items-center justify-center"
                              >
                                Using
                                <span className="text-xl">×</span>
                              </Button>
                            ) : (
                              <div className="w-[32px]"></div> // Placeholder for alignment
                            )}
                          </Col>
                        </Row>
                      ))}

                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        className="mt-2 text-gray-500 hover:text-[#00B894] hover:border-[#00B894]"
                      >
                        + Add Time Slot
                      </Button>
                    </>
                  )}
                </Form.List>
              </div>
            ))}
          </div>
        )}

        {selectedDays.length > 0 && (
          <div className='mt-6 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <Text type='secondary' className='text-sm'>
              This will create separate schedule entries for each time slot.
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
            Save Schedules
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSessionModal;
