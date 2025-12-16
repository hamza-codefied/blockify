import React from 'react';
import { Row, Col } from 'antd';
import { SEOHead } from '@components/seo/SEOHead';
import { StructuredData } from '@components/seo/StructuredData';
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from '@utils/seo';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivities from '@/components/dashboard/RecentActivities';
import StudentTable from '@/components/dashboard/StudentTable';
import { PageTitle } from '@/components/common/PageTitle';
import { LockedSection } from '@/components/common/LockedSection';
import { PERMISSIONS } from '@/utils/permissions';

export const Dashboard = () => {
  const structuredData = [
    generateWebsiteStructuredData(),
    generateOrganizationStructuredData(),
  ];

  return (
    <>
      <SEOHead
        title='Dashboard'
        description='Dashboard overview showing students, sessions, grades, and attendance.'
        keywords='dashboard, students, attendance, analytics'
        url='/dashboard'
      />
      <StructuredData structuredData={structuredData} />

      <PageTitle variant="primary" style={{ marginBottom: 16 }}>Dashboard</PageTitle>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <LockedSection 
            permission={PERMISSIONS.DASHBOARD_READ}
            lockMessage="You do not have permission to view dashboard statistics"
          >
            <StatsCard />
          </LockedSection>
        </Col>
        <Col xs={24} lg={10}>
          <LockedSection 
            permission={PERMISSIONS.ACTIVITIES_READ}
            lockMessage="You do not have permission to view recent activities"
          >
            <RecentActivities />
          </LockedSection>
        </Col>
      </Row>

      <LockedSection 
        permission={PERMISSIONS.ATTENDANCE_READ}
        lockMessage="You do not have permission to view student attendance"
      >
        <StudentTable />
      </LockedSection>
    </>
  );
};
