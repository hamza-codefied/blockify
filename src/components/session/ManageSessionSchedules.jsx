'use client';
import React, { useState } from 'react';
import { RiDeleteBinLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import { HiMiniSignal } from 'react-icons/hi2';
import { EditSessionModal } from './EditSessionModal';
import { DeleteSessionModal } from './DeleteSessionModal';

export const ManageSessionSchedules = () => {
  const schedulesData = [
    { day: 'Monday', start: '08:00 am', end: '02:00 pm', active: true },
    { day: 'Tuesday', start: '08:00 am', end: '02:00 pm', active: false },
    { day: 'Wednesday', start: '08:00 am', end: '02:00 pm', active: false },
    { day: 'Thursday', start: '08:00 am', end: '02:00 pm', active: false },
    { day: 'Friday', start: '08:00 am', end: '02:00 pm', active: false },
    { day: 'Saturday', start: '08:00 am', end: '02:00 pm', active: false },
    { day: 'Sunday', start: '08:00 am', end: '02:00 pm', active: false },
  ];

  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEdit = schedule => {
    setSelectedSchedule(schedule);
    setIsEditOpen(true);
  };

  const handleDelete = schedule => {
    setSelectedSchedule(schedule);
    setIsDeleteOpen(true);
  };

  const handleLoadMore = () => setVisibleCount(prev => prev + 5);

  return (
    <div className='bg-white p-4 rounded-lg shadow-md'>
      {/* Header */}
      <div className='flex justify-between items-center mb-14 max-sm:flex-col max-sm:items-start max-sm:gap-3'>
        <h2 className='text-lg font-semibold max-sm:text-base'>
          Manage Session Schedules
        </h2>
        <select className='border border-gray-300 rounded-md p-1 max-sm:w-full max-sm:text-sm'>
          <option>9th Grade</option>
          <option>10th Grade</option>
          <option>11th Grade</option>
        </select>
      </div>

      {/* Schedules */}
      <div className='h-full flex flex-col justify-between gap-[38px]'>
        {schedulesData.slice(0, visibleCount).map((schedule, index) => (
          <div
            key={index}
            className={`relative py-4 flex items-center justify-between gap-5 border-2 shadow-lg rounded-lg px-4 transition-all duration-300
              max-sm:flex-col max-sm:items-start max-sm:gap-3 ${
                schedule.active
                  ? 'bg-[#2f2f2f] text-white border-[#2f2f2f]'
                  : 'bg-white text-gray-800 border-gray-200'
              }`}
          >
            {/* Active badge */}
            {schedule.active && (
              <div className='absolute -top-[26px] right-0 flex items-center justify-center gap-2 text-[#00B894] text-sm max-sm:text-xs'>
                <HiMiniSignal className='text-[#00B894] w-5 h-5 max-sm:w-4 max-sm:h-4' />
                <span>Active</span>
              </div>
            )}

            <div className='flex flex-col sm:flex-row justify-start gap-24 max-md:gap-10 max-lg:gap-18 max-xl:gap-5 w-full'>
              {/* Day */}
              <div className='font-medium text-base max-sm:text-sm w-[100px]'>
                {schedule.day}
              </div>

              {/* Time line */}
              <div className='flex items-center max-sm:flex-col max-sm:items-start max-sm:gap-2 w-full sm:w-[60%]'>
                <div className='flex items-center justify-between w-full max-sm:w-full'>
                  <span className='mr-2 text-sm max-sm:text-xs'>
                    {schedule.start}
                  </span>
                  <div
                    className='flex-1 mx-2 h-[1px] w-full lg:w-20'
                    style={{ borderBottom: '3px dotted #00B894' }}
                  ></div>
                  <span className='ml-2 text-sm max-sm:text-xs'>
                    {schedule.end}
                  </span>
                </div>
              </div>
            </div>

            {/* Action icons */}
            <div className='flex space-x-2 max-sm:mt-2 max-sm:self-end'>
              <RiDeleteBinLine
                onClick={() => handleDelete(schedule)}
                className={`w-5 h-5 cursor-pointer ${
                  schedule.active ? 'text-red-500' : 'text-[#801818]'
                }`}
              />
              <TbEdit
                onClick={() => handleEdit(schedule)}
                className={`w-5 h-5 cursor-pointer ${
                  schedule.active ? 'text-green-500' : 'text-[#00B894]'
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {visibleCount < schedulesData.length && (
        <div className='mt-5 flex justify-center'>
          <button
            onClick={handleLoadMore}
            className='bg-[#00B894] text-white px-5 py-2 rounded-md hover:bg-[#01956e] transition-all max-sm:w-full max-sm:text-sm'
          >
            Load More
          </button>
        </div>
      )}

      {/* Modals */}
      <EditSessionModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        session={selectedSchedule}
      />
      <DeleteSessionModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        session={selectedSchedule}
      />
    </div>
  );
};
