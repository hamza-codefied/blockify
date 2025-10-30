'use client';
import React from 'react';
import { Modal, List, Avatar } from 'antd';
import { LogIn, LogOut, ClipboardList } from 'lucide-react';

const RecentActivitiesModal = ({ open, onClose }) => {
  const allActivities = [
    {
      icon: <LogIn size={18} className='text-gray-700' />,
      title: 'App Login: Alex Smith Signed In',
      time: '2 hours ago',
    },
    {
      icon: <LogOut size={18} className='text-gray-700' />,
      title: 'App Logout: Andrew Miles Signed Out',
      time: '1 hour ago',
    },
    {
      icon: <ClipboardList size={18} className='text-gray-700' />,
      title: 'Login: Alex Smith Signed In',
      time: '3 hours ago',
    },
    {
      icon: <LogIn size={18} className='text-gray-700' />,
      title: 'App Login: Sarah Connor Signed In',
      time: '5 hours ago',
    },
    {
      icon: <LogOut size={18} className='text-gray-700' />,
      title: 'App Logout: John Doe Signed Out',
      time: '6 hours ago',
    },
  ];

  return (
    <Modal
      title='All Recent Activities'
      open={open}
      onCancel={onClose}
      footer={null}
      centered
    >
      <List
        dataSource={allActivities}
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
    </Modal>
  );
};

export default RecentActivitiesModal;
