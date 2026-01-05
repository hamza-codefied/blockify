import React, { useState, useMemo } from 'react';
import { LogIn, LogOut, ClipboardList, UserPlus, UserMinus, Settings, FileText } from 'lucide-react';
import RecentActivitiesModal from './RecentActivitiesModal';
import { useGetActivities } from '@/hooks/useDashboard';
import { Spin } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Get icon based on activity type and action
const getActivityIcon = (activityType, action) => {
  if (action === 'created' || action === 'activated') {
    if (activityType === 'user') return <LogIn className='text-gray-700 my-2' size={28} />;
    if (activityType === 'system') return <Settings className='text-gray-700 my-2' size={28} />;
    return <UserPlus className='text-gray-700 my-2' size={28} />;
  }
  if (action === 'deleted' || action === 'deactivated' || action === 'signed out') {
    if (activityType === 'user') return <LogOut className='text-gray-700 my-2' size={28} />;
    return <UserMinus className='text-gray-700 my-2' size={28} />;
  }
  if (action === 'updated') {
    return <Settings className='text-gray-700 my-2' size={28} />;
  }
  return <FileText className='text-gray-700 my-2' size={28} />;
};

export default function RecentActivities() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch 10 activities, display first 3
  const { data: activitiesData, isLoading } = useGetActivities({ page: 1, limit: 10 });
  const allActivities = activitiesData?.data || [];
  
  // Display only first 3 activities
  const displayedActivities = useMemo(() => {
    return allActivities.slice(0, 3).map(activity => ({
      id: activity.id,
      icon: getActivityIcon(activity.activity_type, activity.action),
      action: activity.description || `${activity.action}: ${activity.entity_type || 'Activity'}`,
      time: dayjs(activity.created_at).fromNow(),
    }));
  }, [allActivities]);

  return (
    <div className='bg-white dark:bg-gray-800 h-full rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700'>
      {/* Header */}
      <div className='flex justify-between items-center mb-3'>
        <h2 className='font-semibold text-gray-800 dark:text-gray-200 text-lg'>
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
      {isLoading ? (
        <div className='flex justify-center items-center py-8'>
          <Spin size='small' />
        </div>
      ) : displayedActivities.length === 0 ? (
        <div className='text-center py-4 text-gray-500 text-sm'>
          No recent activities
        </div>
      ) : (
        <div className='relative'>
          {/* Vertical line */}
          <div className='absolute left-[13px] top-0 bottom-0 w-[2px] bg-[#00B894]' />

          <div className='flex flex-col gap-8'>
            {displayedActivities.map((item) => (
              <div key={item.id} className='relative flex items-start'>
                {/* Icon circle */}
                <div className='bg-white dark:bg-gray-800 mr-2 z-10 flex items-center justify-center'>
                  {item.icon}
                </div>

                {/* Content */}
                <div>
                  <p className='text-sm text-gray-800 dark:text-gray-200'>{item.action}</p>
                  <p className='text-xs text-[#00B894] mt-1'>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Modal */}
      <RecentActivitiesModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
