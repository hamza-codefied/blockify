'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import studentBg from '@/images/student_bg.png';
import studentIcon from '@/images/attendance_student_bg.png';
import studentSession from '@/images/attendance_session_bg.png';

export default function StatsCard() {
  const data1 = [
    { name: 'Signed In', value: 140 },
    { name: 'Not Signed In', value: 10 },
  ];
  const data2 = [
    { name: 'Before 08:00 am', value: 98 },
    { name: 'After 08:00 am', value: 42 },
  ];

  const COLORS1 = ['#80dcae', '#ffb180'];
  const COLORS2 = ['#80dcd4', '#e58080'];

  return (
    <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8'>
      {/* ===== Card 1 ===== */}
      <div className='relative bg-white bg-cover bg-right rounded-2xl shadow px-5 py-4 flex flex-col justify-between overflow-hidden'>
        <img
          src={studentIcon}
          alt='students background'
          className='absolute top-[70px] right-[-20px] w-48 h-48 object-contain opacity-100 pointer-events-none select-none'
        />

        {/* Content container */}
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6'>
          {/* Left section */}
          <div className='flex-1'>
            <p className='text-xl sm:text-2xl text-[#a0aec0]'>Total Students</p>
            <h3 className='text-2xl sm:text-3xl font-bold text-gray-800'>
              150
            </h3>

            {/* keys */}
            <div className='mt-6 sm:mt-10 flex flex-wrap items-center justify-start gap-4 text-sm'>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#80dcae]'></span>
                <span className='text-[#a0aec0]'>Signed In</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#ffb180]'></span>
                <span className='text-[#a0aec0]'>Not Signed In</span>
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
              <span className='absolute inset-0 flex items-center justify-center text-base sm:text-lg font-semibold text-gray-700'>
                95%
              </span>
            </div>

            {/* Stats list */}
            <div className='flex flex-col items-start justify-start gap-4 sm:gap-10 text-xs sm:text-sm'>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#80dcae]'></span>
                <span>140 Students Signed In</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#ffb180]'></span>
                <span>10 Students Not Signed In</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Card 2 ===== */}
      <div className='relative bg-white bg-cover bg-right rounded-2xl shadow px-5 py-4 flex flex-col justify-between overflow-hidden'>
        <img
          src={studentSession}
          alt='students background'
          className='absolute top-[70px] right-[-20px] w-48 h-48 object-contain opacity-100 pointer-events-none select-none'
        />

        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6'>
          {/* Left section */}
          <div className='flex-1'>
            <p className='text-xl sm:text-2xl text-[#a0aec0]'>Total Students</p>
            <h3 className='text-2xl sm:text-3xl font-bold text-gray-800'>
              140
            </h3>

            {/* keys */}
            <div className='mt-6 sm:mt-10 flex flex-wrap items-center justify-start gap-4 text-sm'>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#80dcd4]'></span>
                <span className='text-[#a0aec0]'>Before 08:00 am</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#e58080]'></span>
                <span className='text-[#a0aec0]'>After 08:00 am</span>
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
              <span className='absolute inset-0 flex items-center justify-center text-base sm:text-lg font-semibold text-gray-700'>
                70%
              </span>
            </div>

            {/* Stats list */}
            <div className='flex flex-col items-start justify-start gap-4 sm:gap-10 text-xs sm:text-sm'>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#80dcd4]'></span>
                <span>98 Students Signed In</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='w-4 h-4 bg-[#e58080]'></span>
                <span>42 Students Not Signed In</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
