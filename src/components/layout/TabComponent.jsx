import { Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './tabs.css';
import dashboardIcon from '@/images/header-icons/dashboard.svg';
import attendanceIcon from '@/images/header-icons/attendance.svg';
import sessionsIcon from '@/images/header-icons/sessions.svg';
import userManagementIcon from '@/images/header-icons/user-management.svg';
import profileIcon from '@/images/header-icons/profile.svg';

export const TabComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState('/');

  const tabs = [
    {
      key: '/dashboard',
      label: 'Dashboard',
      icon: dashboardIcon,
    },
    {
      key: '/attendance',
      label: 'Attendance',
      icon: attendanceIcon,
    },
    { 
      key: '/session', 
      label: 'Sessions', 
      icon: sessionsIcon 
    },
    {
      key: '/users',
      label: 'User Management',
      icon: userManagementIcon,
    },
    {
      key: '/profile',
      label: 'Profile & Permissions',
      icon: profileIcon,
    },
  ];

  useEffect(() => {
    const path = location.pathname === '/' ? '/' : location.pathname;
    setActiveKey(path);
  }, [location.pathname]);

  const handleTabChange = key => {
    if (key === activeKey) return;
    setActiveKey(key);
    navigate(key);
  };

  return (
    <div className='bg-white dark:bg-gray-900'>
      <div className='w-full px-0 sm:px-4 lg:px-16'>
        <Tabs
          activeKey={activeKey}
          onChange={handleTabChange}
          items={tabs.map(tab => ({
            key: tab.key,
            label: (
              <span
                className={`flex items-center justify-center gap-2 text-xs lg:text-lg ${
                  activeKey === tab.key
                    ? 'text-[#00B894] font-semibold'
                    : 'text-gray-800 dark:text-gray-200 font-medium'
                }`}
              >
                <img
                  src={tab.icon}
                  alt={tab.label}
                  style={{
                    width: 18,
                    height: 18,
                    ...(activeKey === tab.key && {
                      filter: 'brightness(0) saturate(100%) invert(67%) sepia(64%) saturate(1234%) hue-rotate(120deg) brightness(95%) contrast(88%)',
                    }),
                  }}
                  className={
                    activeKey === tab.key
                      ? ''
                      : 'dark:brightness-0 dark:invert opacity-70'
                  }
                />
                <span className='hidden sm:inline md:inline'>{tab.label}</span>
              </span>
            ),
          }))}
          className='custom-tabs w-full'
        />
      </div>
    </div>
  );
};
