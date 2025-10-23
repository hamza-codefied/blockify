import React from 'react';
import { Card, Row, Col, Typography, Avatar } from 'antd';
import studentIcon from '@/images/student.png';
import student_bg from '@/images/student_bg.png';
import session_bg from '@/images/session_bg.png';
import grade_bg from '@/images/grades_bg.png';
import attendance_bg from '@/images/attendance_bg.png';

const { Text, Title } = Typography;

export default function StatsCard() {
  const stats = [
    { title: 'Students', value: 150, bg: student_bg },
    { title: 'Sessions', value: 24, bg: session_bg },
    { title: 'Grades', value: 12, bg: grade_bg },
    { title: 'Attendance', value: 100, bg: attendance_bg },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((item, i) => (
        <Col xs={24} sm={12} key={i}>
          <Card
            variant='borderless'
            style={{
              border: 'none',
              boxShadow: 'none',
              background: 'transparent',
            }}
            cover={
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${item.bg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#fafafa',
                  borderRadius: '8px',
                }}
              />
            }
          >
            <Row align='middle' gutter={16}>
              <Col>
                <Avatar
                  src={studentIcon}
                  size={64}
                  style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
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
                  style={{ fontSize: '14px', color: '#a0aec0' }}
                >
                  {item.title}
                </Text>
              </Col>
            </Row>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
