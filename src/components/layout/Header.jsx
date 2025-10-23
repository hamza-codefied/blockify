import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Logo } from '@components/common/Logo';
import { MoonOutlined, SettingOutlined } from '@ant-design/icons';
import { IoIosQrScanner } from 'react-icons/io';
import { FiBell } from 'react-icons/fi';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { Popover, Badge, List, Typography } from 'antd';
import client from '@/images/user_client.png';
import SettingsModal from '@/components/settings/SettingsModal';

const { Text } = Typography;

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const notifications = [
    {
      title: 'New Session Scheduled',
      description: 'Your next session is on 24 Oct, 10:00 AM',
      time: '2 mins ago',
    },
    {
      title: 'Attendance Report Ready',
      description: 'You can now view this week’s attendance report.',
      time: '10 mins ago',
    },
    {
      title: 'Profile Updated',
      description: 'Your institute profile has been successfully updated.',
      time: '1 hr ago',
    },
  ];

  const notificationContent = (
    <div className='w-80 max-h-96 overflow-auto rounded-lg shadow-lg bg-white'>
      <div className='px-4 py-3 border-b border-gray-100 flex justify-between items-center'>
        <h3 className='font-semibold text-gray-700'>Notifications</h3>
        <Text className='text-[#00B894] text-xs cursor-pointer hover:underline'>
          Mark all as read
        </Text>
      </div>

      <List
        dataSource={notifications}
        renderItem={item => (
          <List.Item className='hover:bg-[#f2fbfa] transition-colors cursor-pointer px-4 py-3'>
            <List.Item.Meta
              className='px-4 !max-w-80'
              title={
                <Text className='font-medium text-gray-800'>{item.title}</Text>
              }
              description={
                <div>
                  <Text className='text-gray-500 text-sm'>
                    {item.description}
                  </Text>
                  <div className='text-xs text-[#00B894] mt-1'>{item.time}</div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <header className='bg-white shadow-sm border-b'>
      <div className='w-full min-h-18 mx-auto px-4 sm:px-6 lg:px-16 border-b-2 border-[#e5f8f4]'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex-shrink-0 flex items-center'>
            <Link to='/dashboard' className='flex items-center'>
              <Logo />
            </Link>
          </div>

          {/* Desktop Right Side */}
          <div className='hidden md:flex h-18 items-center justify-center gap-6'>
            <div className='flex items-center justify-center gap-4'>
              <SettingOutlined
                style={{ fontSize: '20px' }}
                className='text-gray-400 cursor-pointer'
                onClick={() => setIsSettingsOpen(true)}
              />
              <IoIosQrScanner
                style={{ fontSize: '20px' }}
                className='text-gray-400'
              />
              <MoonOutlined
                style={{ fontSize: '20px' }}
                className='text-gray-400'
              />

              {/* Notification Popover */}
              <Popover
                placement='bottomRight'
                trigger='click'
                content={notificationContent}
                overlayInnerStyle={{ padding: 0 }}
              >
                <Badge count={3} size='small' color='#00B894'>
                  <FiBell
                    style={{ fontSize: '20px' }}
                    className='text-gray-400 cursor-pointer'
                  />
                </Badge>
              </Popover>
            </div>

            {/* customer */}
            <div className='bg-[#f2fbfa] h-[100%] flex items-center justify-center gap-1 p-3 rounded-lg'>
              <div>
                <img
                  src={client}
                  alt='customer'
                  className='w-12 h-12 rounded-full'
                />
              </div>
              <div className='text-sm'>
                The Campus Institute <br />
                <span className='text-[#00B894] text-xs'>School</span>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className='md:hidden flex items-center justify-center p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition'
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
          <div className='md:hidden flex flex-col items-center gap-4 py-3 border-t border-gray-100'>
            <div className='flex items-center justify-center gap-4'>
              <SettingOutlined
                style={{ fontSize: '20px' }}
                className='text-gray-500 cursor-pointer'
                onClick={() => setIsSettingsOpen(true)}
              />
              <IoIosQrScanner
                style={{ fontSize: '20px' }}
                className='text-gray-500'
              />
              <MoonOutlined
                style={{ fontSize: '20px' }}
                className='text-gray-500'
              />

              {/* Mobile Notification Popover */}
              <Popover
                placement='bottom'
                trigger='click'
                content={notificationContent}
                overlayInnerStyle={{ padding: 0 }}
              >
                <Badge count={3} size='small' color='#00B894'>
                  <FiBell
                    style={{ fontSize: '20px' }}
                    className='text-gray-500 cursor-pointer'
                  />
                </Badge>
              </Popover>
            </div>

            <div className='flex items-center justify-center gap-2 bg-[#f2fbfa] p-2 rounded-lg w-[90%]'>
              <img
                src={client}
                alt='customer'
                className='w-10 h-10 rounded-full'
              />
              <div className='text-sm text-center'>
                <p>The Campus Institute</p>
                <span className='text-[#00B894] text-xs'>School</span>
              </div>
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
