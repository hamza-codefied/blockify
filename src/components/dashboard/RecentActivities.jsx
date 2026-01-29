import React, { useState, useMemo } from 'react';
import { LogIn, LogOut, ClipboardList, Clock, BarChart3, UserPlus, UserMinus, Settings, FileText } from 'lucide-react';
import RecentActivitiesModal from './RecentActivitiesModal';
import { useGetActivities } from '@/hooks/useDashboard';
import { Spin, Empty } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Typography as PageTitle } from '@/components/common/PageTitle';

dayjs.extend(relativeTime);

// Get icon based on activity description/type - matching Figma design
const getActivityIcon = (description, activityType, action, entityType) => {
  const desc = (description || '').toLowerCase();

  // App Login/Logout
  if (desc.includes('signed in') || desc.includes('login')) {
    return <LogIn className='text-gray-700 dark:text-gray-300 my-2' size={28} />;
  }
  if (desc.includes('signed out') || desc.includes('logout')) {
    return <LogOut className='text-gray-700 dark:text-gray-300 my-2' size={28} />;
  }

  // Session End/Request
  if (desc.includes('session end') || desc.includes('session request') || desc.includes('end session') || entityType === 'Session') {
    return <ClipboardList className='text-gray-700 dark:text-gray-300 my-2' size={28} />;
  }

  // Schedule Request
  if (desc.includes('schedule') || desc.includes('schedule change') || entityType === 'Schedule') {
    return <Clock className='text-gray-700 dark:text-gray-300 my-2' size={28} />;
  }

  // Attendance
  if (desc.includes('attendance') || desc.includes('marked present') || desc.includes('marked absent')) {
    return <BarChart3 className='text-gray-700 dark:text-gray-300 my-2' size={28} />;
  }

  // User management
  if (action === 'created' || action === 'activated') {
    if (activityType === 'user') return <UserPlus className='text-gray-700 dark:text-gray-300 my-2' size={28} />;
    if (activityType === 'system') return <Settings className='text-gray-700 dark:text-gray-300 my-2' size={28} />;
    return <UserPlus className='text-gray-700 dark:text-gray-300 my-2' size={28} />;
  }
  if (action === 'deleted' || action === 'deactivated' || action === 'signed out') {
    if (activityType === 'user') return <UserMinus className='text-gray-700 dark:text-gray-300 my-2' size={28} />;
    return <UserMinus className='text-gray-700 dark:text-gray-300 my-2' size={28} />;
  }
  if (action === 'updated') {
    return <Settings className='text-gray-700 dark:text-gray-300 my-2' size={28} />;
  }

  return <FileText className='text-gray-700 dark:text-gray-300 my-2' size={28} />;
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
      icon: getActivityIcon(activity.description, activity.activity_type, activity.action, activity.entity_type),
      action: activity.description || `${activity.action}: ${activity.entity_type || 'Activity'}`,
      time: dayjs(activity.created_at).fromNow(),
    }));
  }, [allActivities]);

  return (
    <div className='bg-white dark:bg-gray-800 h-full rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700'>
      {/* Header */}
      <div className='flex justify-between items-center mb-3'>
        <PageTitle variant='primary'>Recent Activities</PageTitle>
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
        <div className='flex justify-center items-center py-6'>
          <Empty description="No recent activities" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
