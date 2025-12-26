'use client';
import React, { useState, useMemo } from 'react';
import { RiDeleteBinLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import { HiMiniSignal } from 'react-icons/hi2';
import { EditSessionModal } from './EditSessionModal';
import { DeleteSessionModal } from './DeleteSessionModal';
import { Select, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useGetSchedules } from '@/hooks/useSchedules';
import { useGetGrades } from '@/hooks/useGrades';
import { useGetSchoolSettings } from '@/hooks/useSchool';
import { useAuthStore } from '@/store/authStore';
import { PERMISSIONS } from '@/utils/permissions';
import { useDeleteSchedule } from '@/hooks/useSchedules';
import { formatTime } from '@/utils/time';
import {
  formatGradeDisplayName,
  getDefaultGradeQueryParams,
} from '@/utils/grade.utils';

//>>> Full day of week mapping (0=Sunday, 1=Monday, ..., 6=Saturday)
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

export const UnstaggeredScheduleView = ({ onAddSchedule, onImportCSV }) => {
  const { user, hasPermission } = useAuthStore();
  const schoolId = user?.schoolId || user?.school_id || user?.school?.id;

  // Fetch school settings to check enableWeekendSessions
  const { data: settingsData } = useGetSchoolSettings(schoolId);
  const enableWeekendSessions =
    settingsData?.data?.enableWeekendSessions ?? false;

  // Dynamic day names based on school settings
  const DAY_NAMES = useMemo(() => {
    return enableWeekendSessions ? ALL_DAY_NAMES : WEEKDAY_NAMES;
  }, [enableWeekendSessions]);

  const DAY_NUMBERS = ALL_DAY_NUMBERS;

  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [selectedGradeName, setSelectedGradeName] = useState(null);
  const [selectedCourseName, setSelectedCourseName] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  //>>> Fetch grades for dropdown
  const { data: gradesData } = useGetGrades({
    page: 1,
    limit: 100,
    ...getDefaultGradeQueryParams(),
  });
  //>>> API returns { success: true, data: [...grades], pagination: {...} }
  const grades = gradesData?.data || [];

  //>>> Set default grade when grades load
  React.useEffect(() => {
    if (grades.length > 0 && !selectedGradeId) {
      const firstGrade = grades[0];
      setSelectedGradeId(firstGrade.id);
      setSelectedGradeName(formatGradeDisplayName(firstGrade));
    }
  }, [grades, selectedGradeId]);

  //>>> Fetch all schedules for the selected grade (to populate course dropdown)
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

  //>>> API returns { success: true, data: [...schedules], pagination: {...} }
  const allSchedules = schedulesData?.data || [];

  //>>> Extract unique course names from schedules for the selected grade
  const courseNames = useMemo(() => {
    const uniqueNames = [...new Set(allSchedules.map(s => s.name).filter(Boolean))];
    return uniqueNames.sort();
  }, [allSchedules]);

  //>>> Filter schedules by selected course name - only show when both grade and course are selected
  const schedules = useMemo(() => {
    if (!selectedCourseName) {
      return []; // Don't show any schedules if course is not selected
    }
    return allSchedules.filter(s => s.name === selectedCourseName);
  }, [allSchedules, selectedCourseName]);

  //>>> Group schedules by day of week (now allows multiple schedules per day for different courses)
  const schedulesByDay = useMemo(() => {
    const grouped = {};
    schedules.forEach(schedule => {
      // Backend dayOfWeek: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
      // DAY_NAMES array: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      // Mapping: 0=Sunday→index6, 1=Monday→index0, 2=Tuesday→index1, 3=Wednesday→index2, 4=Thursday→index3, 5=Friday→index4, 6=Saturday→index5
      const dayIndex = schedule.dayOfWeek === 0 ? 6 : schedule.dayOfWeek - 1;
      const dayName = DAY_NAMES[dayIndex];
      if (dayName) {
        if (!grouped[dayName]) {
          grouped[dayName] = [];
        }
        grouped[dayName].push(schedule);
      }
    });
    return grouped;
  }, [schedules, DAY_NAMES]);

  //>>> Get current day of week (0=Sunday, 1=Monday, etc.)
  const currentDayOfWeek = new Date().getDay();
  // JavaScript getDay(): 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  // DAY_NAMES array: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  // Mapping: 0=Sunday→index6, 1=Monday→index0, 2=Tuesday→index1, 3=Wednesday→index2, 4=Thursday→index3, 5=Friday→index4, 6=Saturday→index5
  const currentDayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const currentDayName = DAY_NAMES[currentDayIndex];

  //>>> Create array of all days with their schedules (now supports multiple schedules per day)
  const allDaysWithSchedules = DAY_NAMES.map(dayName => ({
    day: dayName,
    dayOfWeek: DAY_NUMBERS[dayName],
    schedules: schedulesByDay[dayName] || [], // Array of schedules for this day
    active: dayName === currentDayName,
  }));

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
    if (schedule) {
      setSelectedSchedule(schedule);
      setIsEditOpen(true);
    }
  };

  const handleDelete = schedule => {
    if (schedule) {
      setSelectedSchedule(schedule);
      setIsDeleteOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedSchedule) {
      try {
        await deleteScheduleMutation.mutateAsync(selectedSchedule.id);
        setIsDeleteOpen(false);
        setSelectedSchedule(null);
        refetch();
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  };

  return (
    <div 
      className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700'
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div className='mb-14'>
        <div className='flex justify-between items-center mb-4 max-sm:flex-col max-sm:items-start max-sm:gap-3'>
          <h2 className='text-lg font-semibold max-sm:text-base text-gray-800 dark:text-gray-200'>
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
            style={{
              width: 140,
            }}
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
            style={{
              width: 180,
            }}
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

      {/* Schedules */}
      {isLoading ? (
        <div className='flex justify-center items-center py-4'>
          <Spin size='large' />
        </div>
      ) : !selectedGradeId ? (
        <div className='text-center py-4 text-gray-500'>
          Please select a grade to view schedules
        </div>
      ) : !selectedCourseName ? (
        <div className='text-center py-8 text-gray-500'>
          Please select a course to view schedules
        </div>
      ) : allDaysWithSchedules.length === 0 || allDaysWithSchedules.every(day => day.schedules.length === 0) ? (
        <div className='text-center py-8 text-gray-500'>
          No schedules found for {selectedCourseName} in {selectedGradeName || 'this grade'}
        </div>
      ) : (
        <div className='flex flex-col justify-between gap-[28px]' style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {allDaysWithSchedules.map((dayData, index) => {
            const daySchedules = dayData.schedules || [];
            const hasSchedules = daySchedules.length > 0;

            return (
              <div
                key={index}
                className={`relative py-4 flex items-center justify-between gap-5 border-2 shadow-lg rounded-lg px-4 transition-all duration-300
                  max-sm:flex-col max-sm:items-start max-sm:gap-3 ${
                  dayData.active
                    ? 'bg-[#2f2f2f] dark:bg-gray-700 text-white border-[#2f2f2f] dark:border-gray-600'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Active badge */}
                {dayData.active && (
                  <div className='absolute -top-[26px] right-0 flex items-center justify-center gap-2 text-[#00B894] text-sm max-sm:text-xs'>
                    <HiMiniSignal className='text-[#00B894] w-5 h-5 max-sm:w-4 max-sm:h-4' />
                    <span>Active</span>
                  </div>
                )}

                <div className='flex flex-col sm:flex-row justify-start gap-24 max-md:gap-10 max-lg:gap-18 max-xl:gap-5 w-full'>
                  {/* Day */}
                  <div className='font-medium text-base max-sm:text-sm w-[100px]'>
                    {dayData.day}
                  </div>

                  {/* Time line */}
                  <div className='flex items-center max-sm:flex-col max-sm:items-start max-sm:gap-2 w-full sm:w-[60%]'>
                    {hasSchedules ? (
                      <div className='flex flex-col gap-3 w-full'>
                        {daySchedules.map((schedule, scheduleIndex) => (
                          <div key={schedule.id || scheduleIndex} className='flex items-center justify-between w-full'>
                            <div className='flex items-center justify-between w-full max-sm:w-full'>
                              <span className='mr-2 text-sm max-sm:text-xs'>
                                {formatTime(schedule.startTime)}
                              </span>
                              <div
                                className='flex-1 mx-2 h-[1px] w-full lg:w-20'
                                style={{ borderBottom: '3px dotted #00B894' }}
                              ></div>
                              <span className='ml-2 text-sm max-sm:text-xs'>
                                {formatTime(schedule.endTime)}
                              </span>
                            </div>
                            {/* Action icons */}
                            <div className='flex space-x-2 ml-4'>
                              <RiDeleteBinLine
                                onClick={() => handleDelete(schedule)}
                                className={`w-5 h-5 cursor-pointer ${
                                  dayData.active ? 'text-red-500' : 'text-[#801818]'
                                }`}
                              />
                              <TbEdit
                                onClick={() => handleEdit(schedule)}
                                className={`w-5 h-5 cursor-pointer ${
                                  dayData.active ? 'text-green-500' : 'text-[#00B894]'
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className='text-sm text-gray-400 italic'>
                        No schedule
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <EditSessionModal
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedSchedule(null);
        }}
        session={selectedSchedule}
        onSuccess={() => {
          setIsEditOpen(false);
          setSelectedSchedule(null);
          refetch();
        }}
      />
      <DeleteSessionModal
        open={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedSchedule(null);
        }}
        session={selectedSchedule}
        onConfirm={handleDeleteConfirm}
        loading={deleteScheduleMutation.isPending}
      />
    </div>
  );
};
