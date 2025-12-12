'use client';
import { useEffect, useState } from 'react';
import { Typography, Tabs, Select } from 'antd';
import { SEOHead } from '@components/seo/SEOHead';
import { StructuredData } from '@components/seo/StructuredData';
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from '@utils/seo';
import { EarlySessionRequests } from '@/components/session/EarlySessionRequests';
import { UnstaggeredScheduleView } from '@/components/session/UnstaggeredScheduleView';
import { SessionChart } from '@/components/session/SessionChart';
import { AddSessionModal } from '@/components/session/AddSessionModal';
import { SessionModal } from '@/components/session/SessionModal';
import { StaggeredScheduleView } from '@/components/session/StaggeredScheduleView';
import { CustomGroupSessionChart } from '@/components/session/CustomGroupSessionChart';
import { CustomGroupUnstaggeredScheduleView } from '@/components/session/CustomGroupUnstaggeredScheduleView';
import { CustomGroupStaggeredScheduleView } from '@/components/session/CustomGroupStaggeredScheduleView';
import { CustomGroupSessionModal } from '@/components/session/CustomGroupSessionModal';
import { useAuthStore } from '@/store/authStore';
import { useGetSchoolSettings } from '@/hooks/useSchool';
import { useGetCustomGroups } from '@/hooks/useCustomGroups';
import { message } from 'antd';

export const Session = () => {
  const structuredData = [
    generateWebsiteStructuredData(),
    generateOrganizationStructuredData(),
  ];

  const { Title } = Typography;
  const [activeTab, setActiveTab] = useState('grades');
  const [openScheduleModal, setOpenScheduleModal] = useState(false); // For schedules (AddSessionModal)
  const [openSessionModal, setOpenSessionModal] = useState(false); // For actual sessions (SessionModal)
  const [openCustomGroupSessionModal, setOpenCustomGroupSessionModal] = useState(false); // For custom group sessions
  const [selectedCustomGroupId, setSelectedCustomGroupId] = useState(null); // Selected custom group for session creation
  
  const { user } = useAuthStore();
  const schoolId = user?.schoolId || user?.school_id || user?.school?.id;
  
  // Fetch school settings to determine staggered/unstaggered
  const { data: settingsData } = useGetSchoolSettings(schoolId, !!schoolId);
  const isStaggered = settingsData?.data?.enableStaggeredSessions || false;

  // Fetch custom groups for session creation (get all for dropdown)
  const { data: customGroupsData } = useGetCustomGroups({
    page: 1,
    limit: 100, // Get all groups for dropdown
    sort: 'created_at',
    sortOrder: 'DESC',
  });
  const customGroups = customGroupsData?.data || [];

  // Grades Tab Content
  const GradesTabContent = () => (
    <>
      <div className='flex justify-between items-center mb-4'>
        <div></div>
        <div className='flex gap-2'>
          <button
            onClick={() => setOpenScheduleModal(true)}
            className='bg-[#00B894] text-white font-semibold text-sm px-4 py-2 rounded-[4px] hover:bg-[#019a7d]'
          >
            Add Schedule +
          </button>
          <button
            onClick={() => setOpenSessionModal(true)}
            className='bg-[#00B894] text-white font-semibold text-sm px-4 py-2 rounded-[4px] hover:bg-[#019a7d]'
          >
            Add Session +
          </button>
        </div>
      </div>

      <SessionChart />

      <div className='grid grid-cols-1 xl:grid-cols-2 items-start gap-4 mt-4'>
        <EarlySessionRequests />
        {isStaggered ? (
          <StaggeredScheduleView />
        ) : (
          <UnstaggeredScheduleView />
        )}
      </div>
    </>
  );

  // Custom Groups Tab Content
  const CustomGroupsTabContent = () => (
    <>
      <div className='flex justify-between items-center mb-4'>
        <div></div>
        <div className='flex gap-2'>
          <Select
            placeholder="Select custom group"
            style={{ width: 250 }}
            value={selectedCustomGroupId}
            onChange={(value) => setSelectedCustomGroupId(value)}
            options={customGroups.map(group => ({
              value: group.id,
              label: group.name,
            }))}
          />
          <button
            onClick={() => {
              if (!selectedCustomGroupId) {
                message.warning('Please select a custom group first');
                return;
              }
              setOpenCustomGroupSessionModal(true);
            }}
            disabled={!selectedCustomGroupId}
            className={`font-semibold text-sm px-4 py-2 rounded-[4px] ${
              selectedCustomGroupId
                ? 'bg-[#00B894] text-white hover:bg-[#019a7d]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add Session +
          </button>
        </div>
      </div>

      <CustomGroupSessionChart />
      <div className='mt-4'>
        {isStaggered ? (
          <CustomGroupStaggeredScheduleView />
        ) : (
          <CustomGroupUnstaggeredScheduleView />
        )}
      </div>
    </>
  );

  const tabItems = [
    {
      key: 'grades',
      label: 'Grades',
      children: <GradesTabContent />,
    },
    {
      key: 'custom-groups',
      label: 'Custom Groups',
      children: <CustomGroupsTabContent />,
    },
  ];

  return (
    <>
      <SEOHead title='Blockify' description='Session page' url='/' />
      <StructuredData structuredData={structuredData} />

      <div>
        <div className='flex justify-between items-center mb-4'>
          <Title level={3} className='dark:text-gray-200'>Sessions</Title>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className='session-tabs'
        />
      </div>

      {/* Session Modal - For creating actual Session instances */}
      <SessionModal
        open={openSessionModal}
        onClose={() => setOpenSessionModal(false)}
        mode="add"
        onSuccess={() => {
          setOpenSessionModal(false);
        }}
      />
      
      {/* Schedule Modal - For creating Schedule templates */}
      <AddSessionModal 
        open={openScheduleModal} 
        onClose={() => setOpenScheduleModal(false)}
        onSuccess={() => {
          setOpenScheduleModal(false);
        }}
      />

      {/* Custom Group Session Modal - For creating custom group sessions */}
      <CustomGroupSessionModal
        open={openCustomGroupSessionModal}
        onClose={() => {
          setOpenCustomGroupSessionModal(false);
        }}
        customGroupId={selectedCustomGroupId}
        onSuccess={() => {
          setOpenCustomGroupSessionModal(false);
        }}
      />
    </>
  );
};
