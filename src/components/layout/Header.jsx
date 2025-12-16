import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Logo } from '@components/common/Logo';
import { MoonOutlined, SunOutlined, SettingOutlined } from '@ant-design/icons';
import { IoIosQrScanner } from 'react-icons/io';
import { FiBell } from 'react-icons/fi';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { Popover, Badge, List, Typography, Spin, Empty } from 'antd';
import client from '@/images/user_client.png';
import SettingsModal from '@/components/settings/SettingsModal';
import { useDarkMode } from '@contexts/DarkModeContext';
import { useAuthStore } from '@/store/authStore';
import { useGetSchoolInformation } from '@/hooks/useSchool';
import { useGetNotifications, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationPage, setNotificationPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState([]);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh when reopening
  const notificationListRef = useRef(null);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user } = useAuthStore();
  
  // Get schoolId from user object
  const schoolId = user?.schoolId || user?.school_id || user?.school?.id;
  
  // Fetch school information (only for logo)
  const { data: schoolInfoData, isLoading: isLoadingSchoolInfo } = useGetSchoolInformation(
    schoolId,
    !!schoolId
  );
  
  const schoolInfo = schoolInfoData?.data || {};
  const schoolLogo = schoolInfo.image || client;
  
  // Get user information
  const userName = user?.fullName || 'User';
  const userRole = user?.roleDisplayName || user?.role || 'Role';

  // Fetch unread count (always fetch page 1 to get unread count, even when popover is closed)
  const { data: unreadCountData, refetch: refetchUnreadCount } = useGetNotifications({
    page: 1,
    limit: 1, // Just need unread count, minimal data
    sort: 'created_at',
    sortOrder: 'DESC'
  });

  // Fetch notifications with pagination (only when popover is open)
  // Add refreshKey to query params to force fresh fetch when reopening
  const { data: notificationsData, isLoading: isLoadingNotifications, refetch: refetchNotifications } = useGetNotifications({
    page: notificationPage,
    limit: 10,
    sort: 'created_at',
    sortOrder: 'DESC',
    _refresh: refreshKey // Add refresh key to force new query
  }, {
    enabled: isNotificationOpen // Only fetch when popover is open
  });

  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  // Track if we've already marked as read for this open session
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);

  // Get unread count from the unread count query (always available)
  const unreadCount = unreadCountData?.data?.unreadCount || 0;

  // Update notifications list when data changes
  useEffect(() => {
    if (isNotificationOpen && notificationsData?.data) {
      const { notifications, pagination } = notificationsData.data;
      
      // Ensure we have valid data
      if (Array.isArray(notifications)) {
        // Always replace when page is 1, append when page > 1
        if (notificationPage === 1) {
          setAllNotifications(notifications);
        } else {
          setAllNotifications(prev => {
            // Avoid duplicates
            const existingIds = new Set(prev.map(n => n.id));
            const newNotifications = notifications.filter(n => !existingIds.has(n.id));
            return [...prev, ...newNotifications];
          });
        }
        
        // Check if there are more pages
        if (pagination) {
          setHasMoreNotifications(notificationPage < pagination.totalPages);
        }
      }
    }
  }, [notificationsData, notificationPage, isNotificationOpen]);

  // Reset when notification popover is closed, prepare when opening
  useEffect(() => {
    if (!isNotificationOpen) {
      // Reset state when closing
      setNotificationPage(1);
      setAllNotifications([]);
      setHasMoreNotifications(true);
      setHasMarkedAsRead(false);
    } else {
      // When opening, reset to page 1, clear notifications, and increment refresh key
      setNotificationPage(1);
      setAllNotifications([]);
      setHasMoreNotifications(true);
      setRefreshKey(prev => prev + 1); // Force new query
    }
  }, [isNotificationOpen]);

  // Mark all as read when notification popover is opened (only once per open)
  useEffect(() => {
    if (isNotificationOpen && !hasMarkedAsRead && unreadCount > 0) {
      markAllAsReadMutation.mutate(undefined, {
        onSuccess: () => {
          setHasMarkedAsRead(true);
          // Refetch to get updated unread count and notifications
          refetchUnreadCount();
          refetchNotifications();
        }
      });
    }
  }, [isNotificationOpen, hasMarkedAsRead, unreadCount]);

  // Handle scroll for infinite pagination
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold

    if (isNearBottom && hasMoreNotifications && !isLoadingNotifications) {
      setNotificationPage(prev => prev + 1);
    }
  }, [hasMoreNotifications, isLoadingNotifications]);

  const notificationContent = (
    <div className='w-80 rounded-lg shadow-lg bg-white dark:bg-gray-800'>
      <div className='px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10'>
        <h3 className='font-semibold text-gray-700 dark:text-gray-200'>
          Notifications
        </h3>
        {unreadCount > 0 && (
          <Text 
            className='text-[#00B894] text-xs cursor-pointer hover:underline'
            onClick={() => markAllAsReadMutation.mutate()}
          >
            Mark all as read
          </Text>
        )}
      </div>

      <div 
        ref={notificationListRef}
        className='overflow-y-auto'
        style={{ maxHeight: '384px' }} // ~3 items visible at a time (128px per item)
        onScroll={handleScroll}
      >
        {isLoadingNotifications && allNotifications.length === 0 ? (
          <div className='flex justify-center items-center py-8'>
            <Spin size='small' />
          </div>
        ) : allNotifications.length === 0 ? (
          <div className='py-8'>
            <Empty description='No notifications' image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <List
            dataSource={allNotifications}
            renderItem={item => (
              <List.Item 
                className={`hover:bg-[#f2fbfa] dark:hover:bg-gray-700 transition-colors cursor-pointer px-4 py-3 ${
                  !item.read ? 'bg-blue-50 dark:bg-gray-700/50' : ''
                }`}
              >
                <List.Item.Meta
                  className='px-4 !max-w-80'
                  title={
                    <Text className='font-medium text-gray-800 dark:text-gray-200'>
                      {item.title}
                    </Text>
                  }
                  description={
                    <div>
                      <Text className='text-gray-500 dark:text-gray-400 text-sm'>
                        {item.message}
                      </Text>
                      <div className='text-xs text-[#00B894] mt-1'>
                        {item.ageDisplay || dayjs(item.createdAt).fromNow()}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
        {isLoadingNotifications && allNotifications.length > 0 && (
          <div className='flex justify-center items-center py-2'>
            <Spin size='small' />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <header className='bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700'>
      <div className='w-full min-h-18 mx-auto px-4 sm:px-6 lg:px-16 border-b-2 border-[#e5f8f4] dark:border-gray-700'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex-shrink-0 flex items-center'>
            <Link
              to='/dashboard'
              className='logo flex items-center text-2xl font-bold text-black border-2 border-[#00b984]/60 rounded-2xl px-4 py-1 dark:text-white '
            >
              Blockify
            </Link>
          </div>

          {/* Desktop Right Side */}
          <div className='hidden md:flex h-18 items-center justify-center gap-6'>
            <div className='flex items-center justify-center gap-4'>
              <SettingOutlined
                style={{ fontSize: '20px' }}
                className='text-gray-400 dark:text-gray-300 cursor-pointer hover:text-gray-600 dark:hover:text-gray-100'
                onClick={() => setIsSettingsOpen(true)}
              />
              {darkMode ? (
                <SunOutlined
                  style={{ fontSize: '20px' }}
                  className='text-gray-400 dark:text-yellow-400 cursor-pointer hover:text-yellow-500'
                  onClick={toggleDarkMode}
                />
              ) : (
                <MoonOutlined
                  style={{ fontSize: '20px' }}
                  className='text-gray-400 cursor-pointer hover:text-gray-600'
                  onClick={toggleDarkMode}
                />
              )}

              {/* Notification Popover */}
              <Popover
                placement='bottomRight'
                trigger='click'
                content={notificationContent}
                overlayInnerStyle={{ padding: 0 }}
                open={isNotificationOpen}
                onOpenChange={(open) => {
                  setIsNotificationOpen(open);
                }}
              >
                <Badge count={unreadCount > 0 ? unreadCount : 0} size='small' color='#00B894' offset={[-2, 2]}>
                  <FiBell
                    style={{ fontSize: '20px' }}
                    className='text-gray-400 dark:text-gray-300 cursor-pointer hover:text-gray-600 dark:hover:text-gray-100'
                  />
                </Badge>
              </Popover>
            </div>

            {/* User Info */}
            <div className='bg-[#f2fbfa] dark:bg-gray-800 h-[100%] flex items-center justify-center gap-1 p-3 rounded-lg'>
              {isLoadingSchoolInfo ? (
                <Spin size='small' />
              ) : (
                <>
                  <div>
                    <img
                      src={schoolLogo}
                      alt='School Logo'
                      className='w-12 h-12 rounded-full object-cover'
                      onError={(e) => {
                        e.target.src = client;
                      }}
                    />
                  </div>
                  <div className='text-sm dark:text-gray-200'>
                    {userName} <br />
                    <span className='text-[#00B894] text-xs'>{userRole}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className='md:hidden flex items-center justify-center p-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <HiX className='w-6 h-6' />
            ) : (
              <HiMenuAlt3 className='w-6 h-6' />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className='md:hidden flex flex-col items-center gap-4 py-3 border-t border-gray-100 dark:border-gray-700'>
            <div className='flex items-center justify-center gap-4'>
              <SettingOutlined
                style={{ fontSize: '20px' }}
                className='text-gray-500 dark:text-gray-300 cursor-pointer hover:text-gray-600 dark:hover:text-gray-100'
                onClick={() => setIsSettingsOpen(true)}
              />
              {darkMode ? (
                <SunOutlined
                  style={{ fontSize: '20px' }}
                  className='text-gray-500 dark:text-yellow-400 cursor-pointer hover:text-yellow-500'
                  onClick={toggleDarkMode}
                />
              ) : (
                <MoonOutlined
                  style={{ fontSize: '20px' }}
                  className='text-gray-500 cursor-pointer hover:text-gray-600'
                  onClick={toggleDarkMode}
                />
              )}

              {/* Mobile Notification Popover */}
              <Popover
                placement='bottom'
                trigger='click'
                content={notificationContent}
                overlayInnerStyle={{ padding: 0 }}
                open={isNotificationOpen}
                onOpenChange={(open) => {
                  setIsNotificationOpen(open);
                }}
              >
                <Badge count={unreadCount > 0 ? unreadCount : 0} size='small' color='#00B894' offset={[-2, 2]}>
                  <FiBell
                    style={{ fontSize: '20px' }}
                    className='text-gray-500 cursor-pointer'
                  />
                </Badge>
              </Popover>
            </div>

            <div className='flex items-center justify-center gap-2 bg-[#f2fbfa] dark:bg-gray-800 p-2 rounded-lg w-[90%]'>
              {isLoadingSchoolInfo ? (
                <Spin size='small' />
              ) : (
                <>
                  <img
                    src={schoolLogo}
                    alt='School Logo'
                    className='w-10 h-10 rounded-full object-cover'
                    onError={(e) => {
                      e.target.src = client;
                    }}
                  />
                  <div className='text-sm text-center dark:text-gray-200'>
                    <p>{userName}</p>
                    <span className='text-[#00B894] text-xs'>{userRole}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
};
