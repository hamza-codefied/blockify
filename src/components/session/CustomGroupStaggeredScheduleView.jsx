'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Select, Spin, Empty } from 'antd';
import { useGetCustomGroups } from '@/hooks/useCustomGroups';
import { useGetSchoolSettings } from '@/hooks/useSchool';
import { useAuthStore } from '@/store/authStore';
import { formatTime } from '@/utils/time';

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

export const CustomGroupStaggeredScheduleView = () => {
  const { user } = useAuthStore();
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

  const [selectedCustomGroupId, setSelectedCustomGroupId] = useState(null);
  const [selectedCustomGroupName, setSelectedCustomGroupName] = useState(null);
  const [activeDay, setActiveDay] = useState('Monday');

  // Fetch custom groups (Admin) - schedules are included in response
  const { data: customGroupsData, isLoading } = useGetCustomGroups({
    page: 1,
    limit: 100, // Get all groups for dropdown
    sort: 'created_at',
    sortOrder: 'DESC',
  });
  const customGroups = customGroupsData?.data || [];

  // Set default custom group when groups load
  useEffect(() => {
    if (customGroups.length > 0 && !selectedCustomGroupId) {
      const firstGroup = customGroups[0];
      setSelectedCustomGroupId(firstGroup.id);
      setSelectedCustomGroupName(firstGroup.name);
    }
  }, [customGroups, selectedCustomGroupId]);

  // Get schedules from selected group (schedules are already included in group data)
  const selectedGroup = customGroups.find(g => g.id === selectedCustomGroupId);
  const schedules = selectedGroup?.schedules || [];

  // Get schedules for the active day
  const activeDayNumber = DAY_NUMBERS[activeDay];
  const daySchedules = useMemo(() => {
    return schedules.filter(schedule => schedule.dayOfWeek === activeDayNumber);
  }, [schedules, activeDayNumber]);

  const handleCustomGroupChange = customGroupId => {
    const group = customGroups.find(g => g.id === customGroupId);
    setSelectedCustomGroupId(customGroupId);
    setSelectedCustomGroupName(group?.name || null);
  };

  return (
    <div className='w-full mx-auto bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg rounded-2xl p-5 sm:p-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-3'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-800 dark:text-white'>
          Custom Group Schedules
        </h2>
        <Select
          value={selectedCustomGroupId}
          onChange={handleCustomGroupChange}
          size='small'
          style={{ width: 200 }}
          loading={!customGroupsData}
          placeholder='Select Custom Group'
          options={customGroups.map(group => ({
            value: group.id,
            label: group.name,
          }))}
        />
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
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
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
      ) : !selectedCustomGroupId ? (
        <div className='text-center py-8 text-gray-500'>
          Please select a custom group to view schedules
        </div>
      ) : customGroups.length === 0 ? (
        <div className='text-center py-8'>
          <Empty description='No custom groups found. Create a custom group first.' />
        </div>
      ) : daySchedules.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          No schedules found for{' '}
          {selectedCustomGroupName || 'this custom group'} on {activeDay}
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4'>
          {daySchedules.map((schedule, index) => (
            <div
              key={schedule.id}
              className='flex flex-col items-center relative'
            >
              <div className='text-gray-700 dark:text-white font-medium mb-2 text-sm'>
                Schedule {index + 1}
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
    </div>
  );
};
