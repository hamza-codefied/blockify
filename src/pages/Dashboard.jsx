import React from 'react';
import { Row, Col, Typography } from 'antd';
import { SEOHead } from '@components/seo/SEOHead';
import { StructuredData } from '@components/seo/StructuredData';
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from '@utils/seo';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivities from '@/components/dashboard/RecentActivities';
import StudentTable from '@/components/dashboard/StudentTable';

const { Title } = Typography;

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

      <Title level={3} style={{ marginBottom: 16 }} className='dark:text-gray-200'>
        Dashboard
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <StatsCard />
        </Col>
        <Col xs={24} lg={10}>
          <RecentActivities />
        </Col>
      </Row>

      <StudentTable />
    </>
  );
};
