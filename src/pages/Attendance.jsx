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
import { LockedSection } from '@/components/common/LockedSection';
import { PERMISSIONS } from '@/utils/permissions';

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

        <LockedSection 
          permission={PERMISSIONS.ATTENDANCE_READ}
          lockMessage="You do not have permission to view attendance"
        >
          <StatsCard />

          <VisualOverview />
        </LockedSection>
      </div>
    </>
  );
};
