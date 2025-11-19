'use client';
import React, { useState } from 'react';
import { Card, List, Row, Col, Typography, Button, Spin, Pagination } from 'antd';
import { TbEdit } from 'react-icons/tb';
import './grades.css';
import { GradeModal } from './GradeModal';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useGetGrades } from '@/hooks/useGrades';
import { useDeleteGrade } from '@/hooks/useGrades';
import { DeleteConfirmModal } from '@/components/userManagement/DeleteConfirmModal';

const { Title, Text } = Typography;

export const Grades = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);

  //>>> Fetch grades with pagination
  const { data: gradesData, isLoading, refetch } = useGetGrades({
    page,
    limit,
    sort: 'grade_name',
    sortOrder: 'ASC',
  });

  const deleteGradeMutation = useDeleteGrade();

  //>>> API returns { success: true, data: [...grades], pagination: {...} }
  const grades = gradesData?.data || [];
  const pagination = gradesData?.pagination || {};

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

  const handleDeleteClick = grade => {
    setGradeToDelete(grade);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (gradeToDelete) {
      try {
        await deleteGradeMutation.mutateAsync(gradeToDelete.id);
        setDeleteModalOpen(false);
        setGradeToDelete(null);
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
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
          {isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <Spin size='large' />
            </div>
          ) : grades.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              No grades found. Click "Add Grade +" to create one.
            </div>
          ) : (
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
                      <Text>{grade.gradeName}</Text>
                    </Col>
                    <Col flex='1'>
                      <Text>{grade.studentCount || 0}</Text>
                    </Col>
                    <Col flex='1'>
                      <Text>-</Text>
                    </Col>
                    <Col flex='1' className='w-[100%] flex justify-end gap-2'>
                      <TbEdit
                        size={20}
                        color='#00B894'
                        className='cursor-pointer'
                        onClick={() => handleEditClick(grade)}
                      />
                      <RiDeleteBinLine
                        className='w-5 h-5 cursor-pointer text-[#801818]'
                        onClick={() => handleDeleteClick(grade)}
                      />
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          )}
        </div>

        {/* ===== Footer ===== */}
        <Row justify='space-between' align='middle' style={{ marginTop: 8 }}>
          <Col>
            <Text type='secondary' style={{ fontSize: 12 }}>
              {pagination.total
                ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, pagination.total)} of ${pagination.total}`
                : 'No grades'}
            </Text>
          </Col>
          {pagination.totalPages > 1 && (
            <Col>
              <Pagination
                current={page}
                total={pagination.total}
                pageSize={limit}
                onChange={handlePageChange}
                showSizeChanger={false}
                size='small'
              />
            </Col>
          )}
        </Row>
      </Card>

      {/* ===== Add/Edit Modal ===== */}
      <GradeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedGrade(null);
        }}
        mode={modalMode}
        gradeData={selectedGrade}
        onSuccess={() => {
          setModalOpen(false);
          setSelectedGrade(null);
          refetch();
        }}
      />

      {/* ===== Delete Confirmation Modal ===== */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setGradeToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title='Delete Grade'
        message={
          gradeToDelete
            ? `Are you sure you want to delete "${gradeToDelete.gradeName}"? This action cannot be undone.`
            : 'Are you sure you want to delete this grade?'
        }
        loading={deleteGradeMutation.isPending}
      />
    </>
  );
};
