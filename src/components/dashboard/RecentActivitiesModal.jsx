'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, List, Avatar, Spin, Empty } from 'antd';
import { LogIn, LogOut, ClipboardList, UserPlus, UserMinus, Settings, FileText } from 'lucide-react';
import { useGetActivities } from '@/hooks/useDashboard';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Get icon based on activity type and action
const getActivityIcon = (activityType, action) => {
  if (action === 'created' || action === 'activated') {
    if (activityType === 'user') return <LogIn size={18} className='text-gray-700' />;
    if (activityType === 'system') return <Settings size={18} className='text-gray-700' />;
    return <UserPlus size={18} className='text-gray-700' />;
  }
  if (action === 'deleted' || action === 'deactivated' || action === 'signed out') {
    if (activityType === 'user') return <LogOut size={18} className='text-gray-700' />;
    return <UserMinus size={18} className='text-gray-700' />;
  }
  if (action === 'updated') {
    return <Settings size={18} className='text-gray-700' />;
  }
  return <FileText size={18} className='text-gray-700' />;
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

  // Format activities for display
  const formattedActivities = useMemo(() => {
    return allLoadedActivities.map(activity => ({
      id: activity.id,
      icon: getActivityIcon(activity.activity_type, activity.action),
      title: activity.description || `${activity.action}: ${activity.entity_type || 'Activity'}`,
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
      title='All Recent Activities'
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
    >
      <div 
        style={{ maxHeight: '60vh', overflowY: 'auto' }}
        onScroll={handleScroll}
      >
        {isLoading && formattedActivities.length === 0 ? (
          <div className='flex justify-center items-center py-8'>
            <Spin size='large' />
          </div>
        ) : formattedActivities.length === 0 ? (
          <Empty description='No activities found' />
        ) : (
          <List
            dataSource={formattedActivities}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={item.icon} className='bg-gray-100' />}
                  title={
                    <span className='font-medium text-gray-800 dark:text-gray-200'>{item.title}</span>
                  }
                  description={
                    <span className='text-[#00B894] text-sm'>{item.time}</span>
                  }
                />
              </List.Item>
            )}
          />
        )}
        {isLoading && formattedActivities.length > 0 && (
          <div className='flex justify-center py-4'>
            <Spin size='small' />
          </div>
        )}
        {!hasMore && formattedActivities.length > 0 && (
          <div className='text-center py-4 text-gray-500 text-sm'>
            No more activities
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RecentActivitiesModal;
