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
import { ManageSessionSchedules } from '@/components/session/ManageSessionSchedules';
import { SessionChart } from '@/components/session/SessionChart';
import { AddSessionModal } from '@/components/session/AddSessionModal';
import { SessionsList } from '@/components/session/SessionsList';
import { SessionModal } from '@/components/session/SessionModal';
import UnstaggeredSessionSchedule from '@/components/session/UnstaggeredSessionSchedule';

export const Session = () => {
  const structuredData = [
    generateWebsiteStructuredData(),
    generateOrganizationStructuredData(),
  ];

  const { Title } = Typography;
  const [openScheduleModal, setOpenScheduleModal] = useState(false); // For schedules (AddSessionModal)
  const [openSessionModal, setOpenSessionModal] = useState(false); // For actual sessions (SessionModal)
  const [isStaggered, setIsStaggered] = useState(true);

  const loadSetting = () => {
    const settings = localStorage.getItem('appSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setIsStaggered(parsed.weekendSettings?.staggeredSession ?? true);
    }
  };

  useEffect(() => {
    loadSetting();
    // Listen for updates from settings modal
    window.addEventListener('appSettingsUpdated', loadSetting);
    return () => window.removeEventListener('appSettingsUpdated', loadSetting);
  }, []);

  return (
    <>
      <SEOHead title='Blockify' description='Session page' url='/' />
      <StructuredData structuredData={structuredData} />

      <div>
        <div className='flex justify-between items-center mb-4'>
          <Title level={3} className='dark:text-gray-200'>Sessions</Title>
          <div className='flex gap-2'>
            <button
              onClick={() => setOpenSessionModal(true)}
              className='bg-[#00B894] text-white font-semibold text-sm px-4 py-2 rounded-[4px] hover:bg-[#019a7d]'
            >
              Add Session +
            </button>
          </div>
        </div>

        <SessionChart />

        {/* Sessions List - Actual Session Instances */}
        <SessionsList />

        <div className='grid grid-cols-1 xl:grid-cols-2 items-start gap-4 mt-4'>
          <EarlySessionRequests />
          {isStaggered ? (
            <ManageSessionSchedules />
          ) : (
            <UnstaggeredSessionSchedule />
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
      
      {/* Schedule Modal - For creating Schedule templates (kept for future use) */}
      <AddSessionModal open={openScheduleModal} onClose={() => setOpenScheduleModal(false)} />
    </>
  );
};
