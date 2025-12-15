'use client';
import React, { useState, useMemo } from 'react';
import { RiDeleteBinLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import { HiMiniSignal } from 'react-icons/hi2';
import { EditSessionModal } from './EditSessionModal';
import { DeleteSessionModal } from './DeleteSessionModal';
import { Select, Spin } from 'antd';
import { useGetSchedules } from '@/hooks/useSchedules';
import { useGetGrades } from '@/hooks/useGrades';
import { useGetSchoolSettings } from '@/hooks/useSchool';
import { useAuthStore } from '@/store/authStore';
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

export const UnstaggeredScheduleView = () => {
  const { user } = useAuthStore();
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

  //>>> Fetch schedules filtered by grade
  const {
    data: schedulesData,
    isLoading,
    refetch,
  } = useGetSchedules({
    gradeId: selectedGradeId,
    page: 1,
    limit: 100, // Get all schedules for the grade
  });

  const deleteScheduleMutation = useDeleteSchedule();

  //>>> API returns { success: true, data: [...schedules], pagination: {...} }
  const schedules = schedulesData?.data || [];

  //>>> Group schedules by day of week and get the first one for each day
  const schedulesByDay = useMemo(() => {
    const grouped = {};
    schedules.forEach(schedule => {
      const dayName = DAY_NAMES[schedule.dayOfWeek];
      if (!grouped[dayName]) {
        grouped[dayName] = schedule;
      }
    });
    return grouped;
  }, [schedules]);

  //>>> Get current day of week (0=Sunday, 1=Monday, etc.)
  const currentDayOfWeek = new Date().getDay();
  const currentDayName = DAY_NAMES[currentDayOfWeek];

  //>>> Create array of all days with their schedules
  const allDaysWithSchedules = DAY_NAMES.map(dayName => ({
    day: dayName,
    dayOfWeek: DAY_NUMBERS[dayName],
    schedule: schedulesByDay[dayName] || null,
    active: dayName === currentDayName,
  }));

  const handleGradeChange = gradeId => {
    const grade = grades.find(g => g.id === gradeId);
    setSelectedGradeId(gradeId);
    setSelectedGradeName(grade ? formatGradeDisplayName(grade) : null);
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
    <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700'>
      {/* Header */}
      <div className='flex justify-between items-center mb-14 max-sm:flex-col max-sm:items-start max-sm:gap-3'>
        <h2 className='text-lg font-semibold max-sm:text-base text-gray-800 dark:text-gray-200'>
          Manage Session Schedules
        </h2>
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
      ) : allDaysWithSchedules.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          No schedules found for {selectedGradeName || 'this grade'}
        </div>
      ) : (
        <div className='flex flex-col justify-between gap-[25px]'>
          {allDaysWithSchedules.map((dayData, index) => {
            const schedule = dayData.schedule;
            const hasSchedule = !!schedule;

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
                  <div className='flex flex-col gap-1 max-sm:flex-col max-sm:items-start max-sm:gap-2 w-full sm:w-[60%]'>
                    {hasSchedule ? (
                      <>
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
                        {schedule.subject && (
                          <div className='text-xs text-gray-500 dark:text-gray-400'>
                            {schedule.name && (
                              <span className='font-medium'>
                                {schedule.name} -{' '}
                              </span>
                            )}
                            {schedule.subject.name}
                          </div>
                        )}
                        {schedule.name && !schedule.subject && (
                          <div className='text-xs text-gray-500 dark:text-gray-400'>
                            {schedule.name}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className='text-sm text-gray-400 italic'>
                        No schedule
                      </span>
                    )}
                  </div>
                </div>

                {/* Action icons */}
                {hasSchedule && (
                  <div className='flex space-x-2 max-sm:mt-2 max-sm:self-end'>
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
                )}
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
