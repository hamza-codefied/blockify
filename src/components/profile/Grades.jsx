'use client';
import React, { useState } from 'react';
import { Card, List, Row, Col, Typography, Button } from 'antd';
import { TbEdit } from 'react-icons/tb';
import './grades.css';
import { GradeModal } from './GradeModal';
import { RiDeleteBinLine } from 'react-icons/ri';

const { Title, Text } = Typography;

export const Grades = () => {
  const [grades, setGrades] = useState([
    { id: 1, grade: '9th Grade', students: 150, sessions: '6 / Per Day' },
    { id: 2, grade: '10th Grade', students: 140, sessions: '5 / Per Day' },
    { id: 3, grade: '11th Grade', students: 140, sessions: '5 / Per Day' },
    { id: 4, grade: '12th Grade', students: 150, sessions: '6 / Per Day' },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedGrade, setSelectedGrade] = useState(null);

  const handleAddClick = () => {
    setModalMode('add');
    setSelectedGrade(null);
    setModalOpen(true);
  };

  const handleEditClick = grade => {
    setModalMode('edit');
    setSelectedGrade(grade);
    setModalOpen(true);
  };

  return (
    <>
      <Card
        variant='outlined'
        style={{
          borderRadius: 12,
          marginTop: 24,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
        className='border-2 border-gray-200 w-full shadow-lg lg:w-2/3'
      >
        {/* ===== Header ===== */}
        <Row justify='space-between' align='middle' gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Title level={5} style={{ marginBottom: 0 }}>
              Grades
            </Title>
          </Col>
          <Col xs={24} md={16} style={{ textAlign: 'right' }}>
            <Button
              type='text'
              className='add-grade-btn text-[#00B894] font-semibold'
              onClick={handleAddClick}
            >
              Add Grade +
            </Button>
          </Col>
        </Row>

        {/* ===== Scrollable Table Wrapper ===== */}
        <div className='grades-wrapper'>
          {/* ===== List Header Row ===== */}
          <Row
            justify='space-between'
            className='grades-header'
            style={{
              marginTop: 24,
              marginBottom: 8,
              fontWeight: 500,
              background: '#fff',
              boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
              border: '2px solid rgba(0,0,0,0.05)',
              borderRadius: 12,
              padding: '20px 16px',
            }}
          >
            <Col flex='2'>Grade</Col>
            <Col flex='1'>Grade Students</Col>
            <Col flex='1'>Sessions</Col>
            <Col flex='1' className='text-right'>
              Action
            </Col>
          </Row>

          {/* ===== Grades List ===== */}
          <List
            itemLayout='horizontal'
            dataSource={grades}
            renderItem={grade => (
              <List.Item
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  marginBottom: 8,
                  padding: '12px 16px',
                  boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
                  border: '2px solid rgba(0,0,0,0.05)',
                }}
              >
                <Row align='middle' style={{ width: '100%' }}>
                  <Col flex='2'>
                    <Text>{grade.grade}</Text>
                  </Col>
                  <Col flex='1'>
                    <Text>{grade.students}</Text>
                  </Col>
                  <Col flex='1'>
                    <Text>{grade.sessions}</Text>
                  </Col>
                  <Col flex='1' className='w-[100%] flex justify-end gap-2'>
                    <TbEdit
                      size={20}
                      color='#00B894'
                      className='cursor-pointer'
                      onClick={() => handleEditClick(grade)}
                    />
                    <RiDeleteBinLine className='w-5 h-5 cursor-pointer text-[#801818]' />
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </div>

        {/* ===== Footer ===== */}
        <Row justify='space-between' align='middle' style={{ marginTop: 8 }}>
          <Col>
            <Text type='secondary' style={{ fontSize: 12 }}>
              Showing results 4 of 12
            </Text>
          </Col>
        </Row>
      </Card>

      {/* ===== Add/Edit Modal ===== */}
      <GradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        gradeData={selectedGrade}
      />
    </>
  );
};
