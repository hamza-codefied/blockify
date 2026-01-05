import React from 'react';
import { Card, Row, Col, Typography, Spin } from 'antd';
import { useGetDashboardStatistics } from '@/hooks/useDashboard';

import student_bg from '@/images/student_bg.png';
import session_bg from '@/images/session_bg.png';
import grade_bg from '@/images/grades_bg.png';
import attendance_bg from '@/images/attendance_bg.png';
import studentsIcon from '@/images/stats-icons/students.svg';
import sessionsIcon from '@/images/stats-icons/sessions.svg';
import gradesIcon from '@/images/stats-icons/grades.svg';
import attendanceIcon from '@/images/stats-icons/attendance.svg';
import bgIllustrate from '@/images/card-bg-illustrate.png';

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
    { title: 'Students', value: statistics.totalStudents, bg: student_bg, icon: studentsIcon },
    { title: 'Sessions', value: statistics.totalSchedules, bg: session_bg, icon: sessionsIcon }, // Displaying schedules count as "Sessions"
    { title: 'Grades', value: statistics.totalGrades, bg: grade_bg, icon: gradesIcon },
    { title: 'Attendance', value: statistics.totalAttendanceToday, bg: attendance_bg, icon: attendanceIcon },
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
              position: 'relative',
              overflow: 'hidden',
            }}
            className='bg-white dark:bg-gray-800 h-full rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700'
          >
            <Row align='middle' gutter={16}>
              <Col>
                <div
                  className='bg-[#00B894] rounded-[20px] p-3 flex items-center justify-center'
                  style={{ width: 64, height: 64 }}
                >
                  <img
                    src={item.icon}
                    alt={item.title}
                    style={{ width: 32, height: 32 }}
                    className='dark:brightness-0 dark:invert'
                  />
                </div>
              </Col>
              <Col>
                <Title
                  level={3}
                  style={{ margin: 0, fontSize: '44px', fontWeight: 'bold' }}
                >
                  {item.value}
                </Title>
                <Text
                  type='secondary'
                  style={{ fontSize: '18px' }}
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
                right: '-8px',
                bottom: '-16px',
                width: '100px',
                height: 'auto',
                opacity: 1,
              }}
            />

<img
              src={bgIllustrate}
              alt="Background Illustration"
              style={{
                position: 'absolute',
                left: '-10px',
                top: '0',
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
