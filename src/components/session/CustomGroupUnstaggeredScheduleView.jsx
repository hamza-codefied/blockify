'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { HiMiniSignal } from 'react-icons/hi2';
import { Select, Spin, Empty } from 'antd';
import { useGetCustomGroups } from '@/hooks/useCustomGroups';
import { formatTime } from '@/utils/time';

//>>> Day of week mapping (0=Sunday, 1=Monday, ..., 6=Saturday)
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NUMBERS = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export const CustomGroupUnstaggeredScheduleView = () => {
  const [selectedCustomGroupId, setSelectedCustomGroupId] = useState(null);
  const [selectedCustomGroupName, setSelectedCustomGroupName] = useState(null);

  //>>> Fetch custom groups for dropdown (Admin) - schedules are included in response
  const { data: customGroupsData, isLoading } = useGetCustomGroups();
  const customGroups = customGroupsData?.data?.groups || [];

  //>>> Set default custom group when groups load
  useEffect(() => {
    if (customGroups.length > 0 && !selectedCustomGroupId) {
      const firstGroup = customGroups[0];
      setSelectedCustomGroupId(firstGroup.id);
      setSelectedCustomGroupName(firstGroup.name);
    }
  }, [customGroups, selectedCustomGroupId]);

  //>>> Get schedules from selected group (schedules are already included in group data)
  const selectedGroup = customGroups.find(g => g.id === selectedCustomGroupId);
  const schedules = selectedGroup?.schedules || [];

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

  const handleCustomGroupChange = (customGroupId) => {
    const group = customGroups.find(g => g.id === customGroupId);
    setSelectedCustomGroupId(customGroupId);
    setSelectedCustomGroupName(group?.name || null);
  };


  return (
    <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700'>
      {/* Header */}
      <div className='flex justify-between items-center mb-14 max-sm:flex-col max-sm:items-start max-sm:gap-3'>
        <h2 className='text-lg font-semibold max-sm:text-base text-gray-800 dark:text-gray-200'>
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

      {/* Schedules */}
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
          <Empty description="No custom groups found. Create a custom group first." />
        </div>
      ) : schedules.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          No schedules found for {selectedCustomGroupName || 'this custom group'}
        </div>
      ) : (
        <div className='h-full flex flex-col justify-between gap-[38px]'>
          {allDaysWithSchedules.map((dayData) => {
            const schedule = dayData.schedule;
            const hasSchedule = !!schedule;
            
            return (
              <div
                key={`${dayData.day}-${schedule?.id || 'no-schedule'}`}
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
                    {hasSchedule ? (
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
                    ) : (
                      <span className='text-sm text-gray-400 italic'>No schedule</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

