'use client';
import { useEffect, useState } from 'react';
import { Typography } from 'antd';
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
import { useAuthStore } from '@/store/authStore';
import { useGetSchoolSettings } from '@/hooks/useSchool';

export const Session = () => {
  const structuredData = [
    generateWebsiteStructuredData(),
    generateOrganizationStructuredData(),
  ];

  const { Title } = Typography;
  const [openScheduleModal, setOpenScheduleModal] = useState(false); // For schedules (AddSessionModal)
  const [openSessionModal, setOpenSessionModal] = useState(false); // For actual sessions (SessionModal)
  
  const { user } = useAuthStore();
  const schoolId = user?.schoolId || user?.school_id || user?.school?.id;
  
  // Fetch school settings to determine staggered/unstaggered
  const { data: settingsData } = useGetSchoolSettings(schoolId, !!schoolId);
  const isStaggered = settingsData?.data?.enableStaggeredSessions || false;

  return (
    <>
      <SEOHead title='Blockify' description='Session page' url='/' />
      <StructuredData structuredData={structuredData} />

      <div>
        <div className='flex justify-between items-center mb-4'>
          <Title level={3} className='dark:text-gray-200'>Sessions</Title>
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
    </>
  );
};
