'use client';
import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Divider,
  Radio,
} from 'antd';
import dayjs from 'dayjs';
import {
  useCreateCustomGroup,
  useUpdateCustomGroup,
} from '@/hooks/useCustomGroups';
import { useGetGrades } from '@/hooks/useGrades';
import { useGetStudents } from '@/hooks/useStudents';
import { useGetSchoolSettings } from '@/hooks/useSchool';
import { useAuthStore } from '@/store/authStore';
import { useDebounce } from '@/hooks/useDebounce';
import {
  CustomGroupScheduleSection,
  DAY_NUMBERS,
} from './CustomGroupScheduleSection';
import {
  formatGradeDisplayName,
  getDefaultGradeQueryParams,
} from '@/utils/grade.utils';
import './custom-groups.css';

const { Text } = Typography;
const { Option } = Select;

export const CustomGroupModal = ({
  open,
  onClose,
  mode,
  groupData,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedGradeIds, setSelectedGradeIds] = useState([]);
  const [addEntireGrade, setAddEntireGrade] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [originalData, setOriginalData] = useState(null); // Track original data for delta updates

  const { user } = useAuthStore();
  const schoolId = user?.schoolId || user?.school_id || user?.school?.id;

  // Fetch school settings to check enableWeekendSessions
  const { data: settingsData } = useGetSchoolSettings(schoolId);
  const enableWeekendSessions =
    settingsData?.data?.enableWeekendSessions ?? false;

  const createGroupMutation = useCreateCustomGroup();
  const updateGroupMutation = useUpdateCustomGroup();
  const isEditMode = mode === 'edit';

  // Fetch grades
  const { data: gradesData } = useGetGrades({
    page: 1,
    limit: 100,
    ...getDefaultGradeQueryParams(),
  });
  const grades = gradesData?.data || [];

  // Debounce search input to avoid too many API calls
  const debouncedStudentSearch = useDebounce(studentSearch, 300);

  // Fetch students with server-side search and optional grade filter
  // Fetch when modal is open, not in "add entire grade" mode, and at least one grade is selected
  const shouldFetchStudents =
    open && !addEntireGrade && selectedGradeIds.length > 0;

  // Build query params for students API
  const studentsQueryParams = useMemo(() => {
    const params = {
      page: 1,
      limit: 50, // Fetch 50 at a time (reasonable for dropdown)
    };

    // Add search if user has typed something
    if (debouncedStudentSearch && debouncedStudentSearch.trim()) {
      params.search = debouncedStudentSearch.trim();
    }

    // Filter by selected grades - support both single and multiple grades
    if (selectedGradeIds.length === 1) {
      params.gradeId = selectedGradeIds[0];
    } else if (selectedGradeIds.length > 1) {
      params.gradeIds = selectedGradeIds;
    }

    return params;
  }, [debouncedStudentSearch, selectedGradeIds]);

  // Fetch students with server-side search
  const { data: studentsData, isLoading: studentsLoading } = useGetStudents(
    studentsQueryParams,
    { enabled: shouldFetchStudents }
  );

  // API returns { success: true, message: "...", data: [...students...], pagination: {...} }
  // So data is the students array directly, not data.students
  const students = Array.isArray(studentsData?.data) ? studentsData.data : [];

  useEffect(() => {
    if (open) {
      if (isEditMode && groupData) {
        const gradeIds = groupData.grades?.map(g => g.id) || [];
        const studentIds = groupData.members?.map(m => m.studentId) || [];
        const schedules = groupData.schedules || [];
        const addEntireGradeValue = groupData.addEntireGrade || false;

        // Extract days from schedules
        const days = schedules.map(s => {
          const dayNames = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ];
          return dayNames[s.dayOfWeek];
        });

        setSelectedGradeIds(gradeIds);
        setSelectedDays(days);
        setAddEntireGrade(addEntireGradeValue);

        // Store original data for delta comparison
        const original = {
          name: groupData.name,
          description: groupData.description || null,
          gradeIds: [...gradeIds],
          studentIds: [...studentIds],
          addEntireGrade: addEntireGradeValue,
          schedules: schedules.map(s => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        };
        setOriginalData(original);

        // Set form values
        const formValues = {
          name: groupData.name,
          description: groupData.description || '',
          gradeIds,
          studentIds,
          addEntireGrade: addEntireGradeValue,
        };

        // Set schedule values
        schedules.forEach(schedule => {
          const dayNames = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ];
          const dayName = dayNames[schedule.dayOfWeek];
          formValues[`startTime_${dayName}`] = dayjs(
            schedule.startTime,
            'HH:mm'
          );
          formValues[`endTime_${dayName}`] = dayjs(schedule.endTime, 'HH:mm');
        });

        form.setFieldsValue(formValues);
      } else {
        form.resetFields();
        setSelectedGradeIds([]);
        setSelectedDays([]);
        setAddEntireGrade(false);
        setStudentSearch(''); // Reset search when modal closes
        setStudentDropdownOpen(false); // Reset dropdown state
        setOriginalData(null); // Clear original data
      }
    }
  }, [open, isEditMode, groupData, form]);

  const toggleDay = day => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
      // Clear time fields for removed day
      form.setFieldsValue({
        [`startTime_${day}`]: undefined,
        [`endTime_${day}`]: undefined,
      });
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const gradeIds = values.gradeIds || [];
      const studentIds = values.studentIds || [];
      const addEntireGradeValue = values.addEntireGrade || false;

      // Validate: if addEntireGrade is true, gradeIds must be provided
      if (addEntireGradeValue && (!gradeIds || gradeIds.length === 0)) {
        form.setFields([
          {
            name: 'gradeIds',
            errors: [
              'Please select at least one grade when "Add Entire Grade" is enabled',
            ],
          },
        ]);
        return;
      }

      // Validate: if addEntireGrade is false, studentIds must be provided
      if (!addEntireGradeValue && (!studentIds || studentIds.length === 0)) {
        form.setFields([
          {
            name: 'studentIds',
            errors: ['Please select at least one student'],
          },
        ]);
        return;
      }

      // Build schedules array
      const schedules = selectedDays.map(day => {
        const dayOfWeek = DAY_NUMBERS[day];
        const startTime = values[`startTime_${day}`]?.format('HH:mm');
        const endTime = values[`endTime_${day}`]?.format('HH:mm');
        return { dayOfWeek, startTime, endTime };
      });

      if (isEditMode && groupData?.id) {
        // Build delta payload - only include changed fields
        const deltaPayload = {};

        // Compare and add only changed fields
        if (values.name !== originalData.name) {
          deltaPayload.name = values.name;
        }

        if ((values.description || null) !== originalData.description) {
          deltaPayload.description = values.description || null;
        }

        // Compare gradeIds (arrays need deep comparison)
        const gradeIdsChanged =
          gradeIds.length !== originalData.gradeIds.length ||
          !gradeIds.every(id => originalData.gradeIds.includes(id)) ||
          !originalData.gradeIds.every(id => gradeIds.includes(id));
        if (gradeIdsChanged) {
          deltaPayload.gradeIds = gradeIds.length > 0 ? gradeIds : [];
        }

        // Compare addEntireGrade
        if (addEntireGradeValue !== originalData.addEntireGrade) {
          deltaPayload.addEntireGrade = addEntireGradeValue;
        }

        // Compare studentIds (only if addEntireGrade is false)
        if (!addEntireGradeValue) {
          const studentIdsChanged =
            studentIds.length !== originalData.studentIds.length ||
            !studentIds.every(id => originalData.studentIds.includes(id)) ||
            !originalData.studentIds.every(id => studentIds.includes(id));
          if (studentIdsChanged) {
            deltaPayload.studentIds = studentIds.length > 0 ? studentIds : [];
          }
        } else {
          // If addEntireGrade is true, don't send studentIds (backend will auto-add)
          // But if it was false before and now true, we need to clear studentIds
          if (!originalData.addEntireGrade && addEntireGradeValue) {
            deltaPayload.studentIds = [];
          }
        }

        // Compare schedules (arrays need deep comparison)
        const schedulesChanged =
          schedules.length !== originalData.schedules.length ||
          !schedules.every(s => {
            return originalData.schedules.some(
              os =>
                os.dayOfWeek === s.dayOfWeek &&
                os.startTime === s.startTime &&
                os.endTime === s.endTime
            );
          }) ||
          !originalData.schedules.every(os => {
            return schedules.some(
              s =>
                s.dayOfWeek === os.dayOfWeek &&
                s.startTime === os.startTime &&
                s.endTime === os.endTime
            );
          });
        if (schedulesChanged) {
          deltaPayload.schedules = schedules.length > 0 ? schedules : [];
        }

        // Only update if there are changes
        if (Object.keys(deltaPayload).length === 0) {
          // No changes, just close the modal
          onClose();
          return;
        }

        // Update existing group with delta payload
        await updateGroupMutation.mutateAsync({
          customGroupId: groupData.id,
          data: deltaPayload,
        });
      } else {
        // Create new group - send full payload
        const payload = {
          name: values.name,
          description: values.description || undefined,
          gradeIds: gradeIds.length > 0 ? gradeIds : undefined,
          studentIds: addEntireGradeValue
            ? undefined
            : studentIds.length > 0
              ? studentIds
              : undefined,
          addEntireGrade: addEntireGradeValue,
          schedules: schedules.length > 0 ? schedules : undefined,
        };
        await createGroupMutation.mutateAsync(payload);
      }

      form.resetFields();
      setSelectedDays([]);
      setSelectedGradeIds([]);
      setAddEntireGrade(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const isLoading = isEditMode
    ? updateGroupMutation.isPending
    : createGroupMutation.isPending;

  return (
    <Modal
      title={isEditMode ? 'Edit Custom Group' : 'Add Custom Group'}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={800}
      bodyStyle={{ maxHeight: '85vh', overflowY: 'auto' }}
      className='rounded-xl'
    >
      <Form form={form} layout='vertical'>
        {/* ===== Group Name ===== */}
        <Form.Item
          label='Group Name'
          name='name'
          rules={[
            { required: true, message: 'Please enter group name' },
            { min: 2, message: 'Group name must be at least 2 characters' },
            { max: 200, message: 'Group name must not exceed 200 characters' },
          ]}
        >
          <Input placeholder='Enter group name' />
        </Form.Item>

        {/* ===== Description ===== */}
        {/* <Form.Item
          label='Description'
          name='description'
          rules={[
            { max: 1000, message: 'Description must not exceed 1000 characters' },
          ]}
        >
          <Input.TextArea
            placeholder='Enter group description (optional)'
            rows={3}
            showCount
            maxLength={1000}
          />
        </Form.Item> */}

        <Divider />

        {/* ===== Entire Grade Selection ===== */}
        <Form.Item
          label='Do you want to add entire grade?'
          name='addEntireGrade'
          initialValue={false}
        >
          <Radio.Group
            onChange={e => {
              const value = e.target.value;
              setAddEntireGrade(value);
              form.setFieldsValue({ addEntireGrade: value });
              // Clear student selection when enabling addEntireGrade
              if (value) {
                form.setFieldsValue({ studentIds: [] });
              }
            }}
            value={addEntireGrade}
          >
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>

        {/* ===== Grades Selection ===== */}
        <Form.Item
          label='Select grades'
          name='gradeIds'
          help='Select one or more grades (optional - used to validate students belong to these grades)'
        >
          <Select
            mode='multiple'
            placeholder='Select grades (optional)'
            allowClear
            loading={!gradesData}
            onChange={value => {
              setSelectedGradeIds(value || []);
              // If grades cleared and addEntireGrade is true, disable it
              if ((!value || value.length === 0) && addEntireGrade) {
                setAddEntireGrade(false);
                form.setFieldsValue({ addEntireGrade: false });
              }
            }}
          >
            {grades.map(grade => (
              <Option key={grade.id} value={grade.id}>
                {formatGradeDisplayName(grade)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* ===== Students Selection ===== */}
        {!addEntireGrade && (
          <Form.Item
            label='Students'
            name='studentIds'
            rules={[
              {
                required: !addEntireGrade,
                message: 'Please select at least one student',
              },
              {
                type: 'array',
                min: addEntireGrade ? 0 : 1,
                message: 'At least one student must be selected',
              },
            ]}
            help={
              selectedGradeIds.length === 0
                ? 'Please select at least one grade first to enable student selection'
                : 'Select students from selected grades (required if "Add Entire Grade" is No)'
            }
          >
            <Select
              mode='multiple'
              placeholder={
                selectedGradeIds.length === 0
                  ? 'Please select grades first...'
                  : 'Type to search students...'
              }
              allowClear
              disabled={selectedGradeIds.length === 0}
              loading={studentsLoading}
              showSearch
              // Custom filter: always return true to show all fetched options
              // Server-side search is handled via onSearch and query params
              filterOption={() => true}
              onSearch={value => setStudentSearch(value)}
              onDropdownVisibleChange={open => {
                setStudentDropdownOpen(open);
                // Reset search when dropdown closes
                if (!open) {
                  setStudentSearch('');
                }
              }}
              notFoundContent={
                selectedGradeIds.length === 0
                  ? 'Please select grades first'
                  : studentsLoading
                    ? 'Loading students...'
                    : studentSearch
                      ? 'No students found'
                      : students.length === 0
                        ? 'No students available'
                        : 'Type to search students'
              }
            >
              {students.length > 0
                ? students.map(student => (
                    <Option key={student.id} value={student.id}>
                      {student.fullName ||
                        student.name ||
                        `Student ${student.id}`}
                    </Option>
                  ))
                : null}
            </Select>
          </Form.Item>
        )}

        <Divider />

        {/* ===== Schedules Section ===== */}
        <CustomGroupScheduleSection
          form={form}
          selectedDays={selectedDays}
          onToggleDay={toggleDay}
          enableWeekendSessions={enableWeekendSessions}
        />

        {/* ===== Save Button ===== */}
        <Form.Item className='text-center mt-6'>
          <Button
            type='primary'
            onClick={handleSave}
            loading={isLoading}
            className='bg-[#00B894] hover:bg-[#019A7D] font-semibold px-10'
          >
            {isEditMode ? 'Update Group' : 'Create Group'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
