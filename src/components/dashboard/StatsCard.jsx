import React from 'react';
import { Card, Row, Col, Typography, Avatar, Spin } from 'antd';
import studentIcon from '@/images/student.png';
import student_bg from '@/images/student_bg.png';
import session_bg from '@/images/session_bg.png';
import grade_bg from '@/images/grades_bg.png';
import attendance_bg from '@/images/attendance_bg.png';
import { useGetDashboardStatistics } from '@/hooks/useDashboard';

const { Text, Title } = Typography;

export default function StatsCard() {
  const { data: statsData, isLoading } = useGetDashboardStatistics();
  
  const statistics = statsData?.data || {
    totalStudents: 0,
    totalGrades: 0,
    totalSchedules: 0,
    totalAttendanceToday: 0,
  };

  const stats = [
    { title: 'Students', value: statistics.totalStudents, bg: student_bg },
    { title: 'Sessions', value: statistics.totalSchedules, bg: session_bg }, // Displaying schedules count as "Sessions"
    { title: 'Grades', value: statistics.totalGrades, bg: grade_bg },
    { title: 'Attendance', value: statistics.totalAttendanceToday, bg: attendance_bg },
  ];

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-8'>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {stats.map((item, i) => (
        <Col xs={24} sm={12} key={i}>
          <Card
            variant='outlined'
            style={{
              border: 'none',
              boxShadow: 'none',
              background: '#fafafa',
              position: 'relative',
              overflow: 'hidden',
              border: '2px solid rgba(0, 0, 0, 0.03)',
            }}
            className='bg-white dark:bg-gray-800 h-full rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700'
          >
            <Row align='middle' gutter={16}>
              <Col>
                <Avatar
                  src={studentIcon}
                  size={64}
                  className='bg-white/80 dark:bg-gray-700/80'
                />
              </Col>
              <Col>
                <Title
                  level={3}
                  style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}
                >
                  {item.value}
                </Title>
                <Text
                  type='secondary'
                  style={{ fontSize: '14px' }}
                  className='text-gray-500 dark:text-gray-400'
                >
                  {item.title}
                </Text>
              </Col>
            </Row>

            {/* 👇 image inside card at bottom-right */}
            <img
              src={item.bg}
              alt={item.title}
              style={{
                position: 'absolute',
                right: '-10px',
                bottom: '-20px',
                width: '100px',
                height: 'auto',
                opacity: 1,
              }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
