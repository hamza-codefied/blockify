'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { RiDeleteBinLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import '@/components/session/early-session-requests.css';
import { Select, Modal, Form, Button, Spin, Empty } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {
  useGetSchedules,
  useDeleteSchedule,
  useUpdateSchedule,
} from '@/hooks/useSchedules';
import { useGetGrades } from '@/hooks/useGrades';
import { useGetSchoolSettings } from '@/hooks/useSchool';
import { useAuthStore } from '@/store/authStore';
import { PERMISSIONS } from '@/utils/permissions';
import { EditSessionModal } from './EditSessionModal';
import { DeleteSessionModal } from './DeleteSessionModal';
import { formatTime } from '@/utils/time';
import {
  formatGradeDisplayName,
  getDefaultGradeQueryParams,
} from '@/utils/grade.utils';
import dayjs from 'dayjs';

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
const ALL_DAY_NUMBERS = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0,
};

export const StaggeredScheduleView = ({ onAddSchedule, onImportCSV }) => {
  const { user, hasPermission } = useAuthStore();
  const schoolId = user?.schoolId || user?.school_id || user?.school?.id;

  // Fetch school settings to check enableWeekendSessions
  const { data: settingsData } = useGetSchoolSettings(schoolId);
  const enableWeekendSessions =
    settingsData?.data?.enableWeekendSessions ?? false;

  // Dynamic days based on school settings
  const days = useMemo(() => {
    return enableWeekendSessions ? ALL_DAY_NAMES : WEEKDAY_NAMES;
  }, [enableWeekendSessions]);

  const DAY_NUMBERS = ALL_DAY_NUMBERS;

  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [selectedGradeName, setSelectedGradeName] = useState(null);
  const [selectedCourseName, setSelectedCourseName] = useState(null);
  const [activeDay, setActiveDay] = useState('Monday');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch grades
  const { data: gradesData } = useGetGrades({
    page: 1,
    limit: 100,
    ...getDefaultGradeQueryParams(),
  });
  const grades = gradesData?.data || [];

  // Set default grade when grades load
  useEffect(() => {
    if (grades.length > 0 && !selectedGradeId) {
      const firstGrade = grades[0];
      setSelectedGradeId(firstGrade.id);
      setSelectedGradeName(formatGradeDisplayName(firstGrade));
    }
  }, [grades, selectedGradeId]);

  // Fetch all schedules for the selected grade (to populate course dropdown)
  const {
    data: schedulesData,
    isLoading,
    refetch,
  } = useGetSchedules({
    gradeId: selectedGradeId,
    page: 1,
    limit: 1000, // Get all schedules to extract unique course names
  }, !!selectedGradeId);

  const deleteScheduleMutation = useDeleteSchedule();
  const allSchedules = schedulesData?.data || [];

  // Extract unique course names from schedules for the selected grade
  const courseNames = useMemo(() => {
    const uniqueNames = [...new Set(allSchedules.map(s => s.name).filter(Boolean))];
    return uniqueNames.sort();
  }, [allSchedules]);

  // Filter schedules by selected course name - only show when both grade and course are selected
  const schedules = useMemo(() => {
    if (!selectedCourseName) {
      return []; // Don't show any schedules if course is not selected
    }
    return allSchedules.filter(s => s.name === selectedCourseName);
  }, [allSchedules, selectedCourseName]);

  // Get schedules for the active day
  const activeDayNumber = DAY_NUMBERS[activeDay];
  const daySchedules = useMemo(() => {
    return schedules.filter(schedule => schedule.dayOfWeek === activeDayNumber);
  }, [schedules, activeDayNumber]);

  const handleGradeChange = gradeId => {
    const grade = grades.find(g => g.id === gradeId);
    setSelectedGradeId(gradeId);
    setSelectedGradeName(grade ? formatGradeDisplayName(grade) : null);
    setSelectedCourseName(null); // Reset course when grade changes
  };

  const handleCourseChange = courseName => {
    setSelectedCourseName(courseName);
  };

  const handleEdit = schedule => {
    setSelectedSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleDelete = schedule => {
    setSelectedSchedule(schedule);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedSchedule) {
      try {
        await deleteScheduleMutation.mutateAsync(selectedSchedule.id);
        setIsDeleteModalOpen(false);
        setSelectedSchedule(null);
        refetch();
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  };

  return (
    <div 
      className='w-full mx-auto bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg rounded-2xl p-5 sm:p-8'
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div className='mb-10'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3'>
          <h2 className='text-lg sm:text-xl font-semibold text-gray-800 dark:text-white'>
            Schedules
          </h2>
          {onAddSchedule && hasPermission(PERMISSIONS.SCHEDULES_CREATE) && (
            <div className='flex gap-2'>
              <button
                onClick={onAddSchedule}
                className='bg-[#00B894] text-white font-semibold text-sm px-4 py-2 rounded-[4px] hover:bg-[#019a7d]'
              >
                Add Schedule +
              </button>
              {onImportCSV && (
                <button
                  onClick={onImportCSV}
                  className='bg-[#00B894] text-white font-semibold text-sm px-4 py-2 rounded-[4px] hover:bg-[#019a7d] flex items-center gap-2'
                >
                  <UploadOutlined />
                  Import CSV
                </button>
              )}
            </div>
          )}
        </div>
        <div className='flex gap-2'>
          <Select
            value={selectedGradeId}
            onChange={handleGradeChange}
            size='small'
            style={{ width: 140 }}
            loading={!gradesData}
            placeholder='Select Grade'
            options={grades.map(grade => ({
              value: grade.id,
              label: formatGradeDisplayName(grade),
            }))}
          />
          <Select
            value={selectedCourseName}
            onChange={handleCourseChange}
            size='small'
            style={{ width: 180 }}
            loading={isLoading}
            placeholder='Select Course'
            allowClear
            disabled={!selectedGradeId || courseNames.length === 0}
            options={courseNames.map(courseName => ({
              value: courseName,
              label: courseName,
            }))}
          />
        </div>
      </div>

      {/* Day Selector */}
      <div className='flex flex-wrap gap-2 mb-10 relative'>
        {days.map(day => (
          <div key={day} className='flex flex-col items-center relative'>
            {activeDay === day && (
              <span className='w-1.5 h-1.5 bg-[#00B894] rounded-full absolute -top-2'></span>
            )}
            <button
              onClick={() => setActiveDay(day)}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 gap-2 ${
                activeDay === day
                  ? 'bg-black text-white border-b-4 border-[#00B894]'
                  : 'bg-white dark:bg-gray-800 text-black dark:text-white border-2 border-gray-200 dark:border-gray-700'
              }`}
            >
              {day}
            </button>
          </div>
        ))}
      </div>

      {/* Schedules for Active Day */}
      {isLoading ? (
        <div className='flex justify-center items-center py-8'>
          <Spin size='large' />
        </div>
      ) : !selectedGradeId ? (
        <div className='text-center py-8 text-gray-500'>
          Please select a grade to view schedules
        </div>
      ) : !selectedCourseName ? (
        <div className='text-center py-8 text-gray-500'>
          Please select a course to view schedules
        </div>
      ) : daySchedules.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          No schedules found for {selectedCourseName} in {selectedGradeName || 'this grade'} on {activeDay}
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4' style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {daySchedules.map((schedule, index) => (
            <div
              key={schedule.id}
              className='flex flex-col items-center relative'
            >
              {/* Action Icons */}
              <div className='absolute top-0 right-0 flex gap-2 z-10'>
                <RiDeleteBinLine
                  className='w-4 h-4 cursor-pointer text-[#801818] hover:text-red-600'
                  onClick={() => handleDelete(schedule)}
                />
                <TbEdit
                  className='w-4 h-4 text-[#00B894] cursor-pointer hover:text-[#019a7d]'
                  onClick={() => handleEdit(schedule)}
                />
              </div>

              <div className='text-gray-700 dark:text-white font-medium mb-2 text-sm'>
                {schedule.name || `Schedule ${index + 1}`}
              </div>
              <div className='w-full bg-white dark:bg-gray-800 p-2 flex flex-col items-center gap-2 text-center border-2 border-gray-200 dark:border-gray-700 rounded-lg'>
                <div className='text-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold text-center py-1 w-[80px]'>
                  {formatTime(schedule.startTime)}
                </div>
                <div className='h-40 w-[2px] border-l-2 border-dotted border-[#00B894]'></div>
                <div className='text-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold text-center py-1 w-[80px]'>
                  {formatTime(schedule.endTime)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <EditSessionModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSchedule(null);
        }}
        session={selectedSchedule}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setSelectedSchedule(null);
          refetch();
        }}
      />
      <DeleteSessionModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSchedule(null);
        }}
        session={selectedSchedule}
        onConfirm={handleDeleteConfirm}
        loading={deleteScheduleMutation.isPending}
      />
    </div>
  );
};
