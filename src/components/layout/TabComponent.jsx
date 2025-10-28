import { Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './tabs.css';
import { LuLayoutDashboard } from 'react-icons/lu';
import { IoMdStats } from 'react-icons/io';
import { CgCalendar } from 'react-icons/cg';
import { UserOutlined } from '@ant-design/icons';
import { FaRegUserCircle } from 'react-icons/fa';

export const TabComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState('/');

  const tabs = [
    {
      key: '/dashboard',
      label: 'Dashboard',
      icon: <LuLayoutDashboard size={18} />,
    },
    {
      key: '/attendance',
      label: 'Attendance',
      icon: <IoMdStats size={18} />,
    },
    { key: '/session', label: 'Sessions', icon: <CgCalendar size={18} /> },
    {
      key: '/users',
      label: 'User Management',
      icon: <UserOutlined size={18} />,
    },
    {
      key: '/profile',
      label: 'Profile & Permissions',
      icon: <FaRegUserCircle size={18} />,
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
                {tab.icon}
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
