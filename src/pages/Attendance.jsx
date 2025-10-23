import { useState } from 'react';
import { SEOHead } from '@components/seo/SEOHead';
import { StructuredData } from '@components/seo/StructuredData';
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from '@utils/seo';

import StatsCard from '@/components/attendance/StatsCard';
import VisualOverview from '@/components/attendance/VisualOverview';
import { Typography } from 'antd';

export const Attendance = () => {
  const structuredData = [
    generateWebsiteStructuredData(),
    generateOrganizationStructuredData(),
  ];

  const { Title } = Typography;

  return (
    <>
      <SEOHead
        title='Attendance Overview'
        description='Visual attendance dashboard'
        url='/attendance'
      />
      <StructuredData structuredData={structuredData} />

      <div className=''>
        <Title level={3} style={{ marginBottom: 16 }}>
          Attendance
        </Title>

        <StatsCard />

        <VisualOverview />
      </div>
    </>
  );
};
