'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Spin, Empty } from 'antd';
import { LogIn, LogOut, ClipboardList, Clock, BarChart3, UserPlus, UserMinus, Settings, FileText } from 'lucide-react';
import { useGetActivities } from '@/hooks/useDashboard';
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

const RecentActivitiesModal = ({ open, onClose }) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [allLoadedActivities, setAllLoadedActivities] = useState([]);

  const { data: activitiesData, isLoading } = useGetActivities({ 
    page, 
    limit 
  });

  const currentActivities = activitiesData?.data || [];
  const pagination = activitiesData?.pagination || {};

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setPage(1);
      setAllLoadedActivities([]);
    } else {
      // Clear when modal closes
      setAllLoadedActivities([]);
      setPage(1);
    }
  }, [open]);

  // Sync activities with current page data
  useEffect(() => {
    if (!open) return;
    
    if (currentActivities.length > 0) {
      if (page === 1) {
        // For page 1, replace all activities
        setAllLoadedActivities([...currentActivities]);
      } else {
        // For subsequent pages, append new activities (avoid duplicates)
        setAllLoadedActivities(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const newActivities = currentActivities.filter(a => !existingIds.has(a.id));
          return [...prev, ...newActivities];
        });
      }
    }
  }, [currentActivities, page, open]);

  const hasMore = pagination.totalPages > page;

  // Format activities for display (same format as RecentActivities component)
  const formattedActivities = useMemo(() => {
    return allLoadedActivities.map(activity => ({
      id: activity.id,
      icon: getActivityIcon(activity.description, activity.activity_type, activity.action, activity.entity_type),
      action: activity.description || `${activity.action}: ${activity.entity_type || 'Activity'}`,
      time: dayjs(activity.created_at).fromNow(),
    }));
  }, [allLoadedActivities]);

  // Load more activities when scrolling to bottom
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottom && hasMore && !isLoading && currentActivities.length > 0) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <Modal
      title={<PageTitle variant='primary'>All Recent Activities</PageTitle>}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={530}
    >
      <div 
        className='relative'
        style={{ maxHeight: '60vh', overflowY: 'auto' }}
        onScroll={handleScroll}
      >
        {isLoading && formattedActivities.length === 0 ? (
          <div className='flex justify-center items-center py-8'>
            <Spin size='large' />
          </div>
        ) : formattedActivities.length === 0 ? (
          <div className='text-center py-4 text-gray-500 text-sm'>
            No activities found
          </div>
        ) : (
          <div className='relative min-h-full'>
            {/* Vertical line - extends full height of content */}
            <div className='absolute left-[13px] top-0 bottom-0 w-[2px] bg-[#00B894]' />

            {/* Activities List - matching RecentActivities card design */}
            <div className='flex flex-col gap-8'>
              {formattedActivities.map((item) => (
                <div key={item.id} className='relative flex items-start'>
                  {/* Icon circle - same as RecentActivities card */}
                  <div className='bg-white dark:bg-gray-800 mr-2 z-10 flex items-center justify-center'>
                    {item.icon}
                  </div>

                  {/* Content - same styling as RecentActivities card */}
                  <div>
                    <p className='text-sm text-gray-800 dark:text-gray-200'>{item.action}</p>
                    <p className='text-xs text-[#00B894] mt-1'>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Loading indicator when loading more */}
            {isLoading && formattedActivities.length > 0 && (
              <div className='flex justify-center py-4 relative'>
                <Spin size='small' />
              </div>
            )}
            
            {/* End of list indicator */}
            {!hasMore && formattedActivities.length > 0 && (
              <div className='bg-white dark:bg-gray-800 text-center py-4 text-gray-500 text-sm relative'>
                No more activities
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RecentActivitiesModal;
