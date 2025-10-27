import React, { useState } from 'react';
import { LogIn, LogOut, ClipboardList } from 'lucide-react';
import RecentActivitiesModal from './RecentActivitiesModal';

export default function RecentActivities() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activities = [
    {
      icon: <LogIn className='text-gray-700' size={18} />,
      action: 'App Login: Alex Smith Signed In',
      time: '2 hours ago',
    },
    {
      icon: <LogOut className='text-gray-700' size={18} />,
      action: 'App Logout: Andrew Miles Signed Out',
      time: '1 hour ago',
    },
    {
      icon: <ClipboardList className='text-gray-700' size={18} />,
      action: 'Login: Alex Smith Signed In',
      time: '3 hours ago',
    },
  ];

  return (
    <div className='bg-white h-full rounded-2xl shadow-sm p-4'>
      {/* Header */}
      <div className='flex justify-between items-center mb-3'>
        <h2 className='font-semibold text-gray-800 text-lg'>
          Recent Activities
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className='text-[#00B894] text-sm font-medium hover:underline'
        >
          View All
        </button>
      </div>

      {/* Activities List */}
      <div className='relative'>
        {/* Vertical line */}
        <div className='absolute left-[13px] top-0 bottom-0 w-[2px] bg-[#00B894]' />

        <div className='flex flex-col gap-6 pl-8'>
          {activities.map((item, index) => (
            <div key={index} className='relative flex items-start'>
              {/* Icon circle */}
              <div className='absolute -left-[25px] bg-white z-10 flex items-center justify-center'>
                {item.icon}
              </div>

              {/* Content */}
              <div>
                <p className='text-sm text-gray-800'>{item.action}</p>
                <p className='text-xs text-[#00B894] mt-1'>{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Modal */}
      <RecentActivitiesModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
