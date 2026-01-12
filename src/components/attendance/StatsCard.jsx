'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Spin } from 'antd';
import studentBg from '@/images/student_bg.png';
import studentIcon from '@/images/attendance_student_bg.png';
import studentSession from '@/images/attendance_session_bg.png';
import { useGetAttendanceStatistics } from '@/hooks/useAttendance';

export default function StatsCard() {
  const { data: statsData, isLoading } = useGetAttendanceStatistics();
  
  const statistics = statsData?.data || {
    totalStudents: 0,
    signedInStudents: 0,
    notSignedInStudents: 0,
    before8AM: 0,
    after8AM: 0,
  };

  const data1 = [
    { name: 'Signed In', value: statistics.signedInStudents },
    { name: 'Not Signed In', value: statistics.notSignedInStudents },
  ];
  const data2 = [
    { name: 'Before 08:00 am', value: statistics.before8AM },
    { name: 'After 08:00 am', value: statistics.after8AM },
  ];

  // Calculate percentages
  const signedInPercentage = statistics.totalStudents > 0
    ? Math.round((statistics.signedInStudents / statistics.totalStudents) * 100)
    : 0;
  
  const before8AMPercentage = statistics.signedInStudents > 0
    ? Math.round((statistics.before8AM / statistics.signedInStudents) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-8'>
        <Spin size='large' />
      </div>
    );
  }

  const COLORS1 = ['#80dcae', '#ffb180'];
  const COLORS2 = ['#80dcd4', '#e58080'];

  return (
    <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6'>
      {/* ===== Card 1 ===== */}
      <div className='relative bg-white dark:bg-gray-800 bg-cover bg-right rounded-2xl shadow dark:shadow-gray-900/50 px-5 py-4 flex flex-col justify-between overflow-hidden border border-gray-100 dark:border-gray-700'>
        <img
          src={studentIcon}
          alt='students background'
          className='absolute top-[70px] right-[-20px] w-48 h-48 object-contain opacity-100 pointer-events-none select-none'
        />

        {/* Content container */}
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6'>
          {/* Left section */}
          <div className='flex-1'>
            <p className='text-xl sm:text-2xl text-[#a0aec0] dark:text-gray-400'>Total Students</p>
            <h3 className='text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200'>
              {statistics.totalStudents}
            </h3>

            {/* keys */}
            <div className='mt-6 sm:mt-10 flex flex-wrap items-center justify-start gap-4 text-sm'>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#80dcae]'></span>
                <span className='text-[#a0aec0] dark:text-gray-400'>Signed In</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#ffb180]'></span>
                <span className='text-[#a0aec0] dark:text-gray-400'>Not Signed In</span>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className='flex flex-col sm:flex-row items-center justify-center sm:gap-6 gap-4 w-full sm:w-auto'>
            {/* Pie chart */}
            <div className='relative w-36 h-36 sm:w-56 sm:h-56'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={data1}
                    cx='50%'
                    cy='50%'
                    innerRadius='60%'
                    outerRadius='70%'
                    dataKey='value'
                    startAngle={90}
                    endAngle={-270}
                  >
                    {data1.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS1[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <span className='absolute inset-0 flex items-center justify-center text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200'>
                {signedInPercentage}%
              </span>
            </div>

            {/* Stats list */}
            <div className='flex flex-col items-start justify-start gap-4 sm:gap-10 text-xs sm:text-sm'>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#80dcae]'></span>
                <span className='text-gray-800 dark:text-gray-200'>{statistics.signedInStudents} Students Signed In</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#ffb180]'></span>
                <span className='text-gray-800 dark:text-gray-200'>{statistics.notSignedInStudents} Students Not Signed In</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Card 2 ===== */}
      <div className='relative bg-white dark:bg-gray-800 bg-cover bg-right rounded-2xl shadow dark:shadow-gray-900/50 px-5 py-4 flex flex-col justify-between overflow-hidden border border-gray-100 dark:border-gray-700'>
        <img
          src={studentSession}
          alt='students background'
          className='absolute top-[70px] right-[-20px] w-48 h-48 object-contain opacity-100 pointer-events-none select-none'
        />

        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6'>
          {/* Left section */}
          <div className='flex-1'>
            <p className='text-xl sm:text-2xl text-[#a0aec0] dark:text-gray-400'>Total Students</p>
            <h3 className='text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200'>
              {statistics.signedInStudents}
            </h3>

            {/* keys */}
            <div className='mt-6 sm:mt-10 flex flex-wrap items-center justify-start gap-4 text-sm'>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#80dcd4]'></span>
                <span className='text-[#a0aec0] dark:text-gray-400'>Before 08:00 am</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#e58080]'></span>
                <span className='text-[#a0aec0] dark:text-gray-400'>After 08:00 am</span>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className='flex flex-col sm:flex-row items-center justify-center sm:gap-6 gap-4 w-full sm:w-auto'>
            {/* Pie chart */}
            <div className='relative w-36 h-36 sm:w-56 sm:h-56'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={data2}
                    cx='50%'
                    cy='50%'
                    innerRadius='60%'
                    outerRadius='70%'
                    dataKey='value'
                    startAngle={90}
                    endAngle={-270}
                  >
                    {data2.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS2[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <span className='absolute inset-0 flex items-center justify-center text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200'>
                {before8AMPercentage}%
              </span>
            </div>

            {/* Stats list */}
            <div className='flex flex-col items-start justify-start gap-4 sm:gap-10 text-xs sm:text-sm'>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#80dcd4]'></span>
                <span className='text-gray-800 dark:text-gray-200'>{statistics.before8AM} Students Before 08:00 am</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#e58080]'></span>
                <span className='text-gray-800 dark:text-gray-200'>{statistics.after8AM} Students After 08:00 am</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
