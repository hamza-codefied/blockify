import { useState } from 'react';
import { SEOHead } from '@components/seo/SEOHead';
import { StructuredData } from '@components/seo/StructuredData';
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from '@utils/seo';

import StatsCard from '@/components/attendance/StatsCard';
import VisualOverview from '@/components/attendance/VisualOverview';
import { PageTitle } from '@/components/common/PageTitle';

export const Attendance = () => {
  const structuredData = [
    generateWebsiteStructuredData(),
    generateOrganizationStructuredData(),
  ];

  return (
    <>
      <SEOHead
        title='Attendance Overview'
        description='Visual attendance dashboard'
        url='/attendance'
      />
      <StructuredData structuredData={structuredData} />

      <div className=''>
        <PageTitle variant="primary" style={{ marginBottom: 16 }}>Attendance</PageTitle>

        <StatsCard />

        <VisualOverview />
      </div>
    </>
  );
};
