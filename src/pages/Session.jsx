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
import UnstaggeredSessionSchedule from '@/components/session/UnstaggeredSessionSchedule';

export const Session = () => {
  const structuredData = [
    generateWebsiteStructuredData(),
    generateOrganizationStructuredData(),
  ];

  const { Title } = Typography;
  const [openModal, setOpenModal] = useState(false);
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
          <Title level={3}>Sessions</Title>
          <button
            onClick={() => setOpenModal(true)}
            className='bg-[#00B894] text-white font-semibold text-sm px-4 py-2 rounded-[4px]'
          >
            Add Session +
          </button>
        </div>

        <SessionChart />

        <div className='grid grid-cols-1 2xl:grid-cols-2 items-start gap-4 mt-4'>
          <EarlySessionRequests />
          {isStaggered ? (
            <ManageSessionSchedules />
          ) : (
            <UnstaggeredSessionSchedule />
          )}
        </div>
      </div>

      <AddSessionModal open={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
};
