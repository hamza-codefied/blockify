'use client';
import React, { useState } from 'react';
import { Card, List, Row, Col, Typography, Spin, Empty, Pagination } from 'antd';
import { TbEdit, TbPlus } from 'react-icons/tb';
import './grades.css';
import { GradeModal } from './GradeModal';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useGetGrades } from '@/hooks/useGrades';
import { useDeleteGrade } from '@/hooks/useGrades';
import { DeleteConfirmModal } from '@/components/userManagement/DeleteConfirmModal';
import { PageTitle } from '@/components/common/PageTitle';
import { Button } from '@/components/common/Button';

const { Text } = Typography;

export const Grades = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
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
        // Refetch grades list after successful deletion
        refetch();
        // If we deleted the last item on the current page and it's not page 1, go back a page
        if (grades.length === 1 && page > 1) {
          setPage(page - 1);
        }
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
        className='grades-card border-2 border-gray-200 w-full shadow-lg flex flex-col'
        style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '100%' }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        {/* ===== Header ===== */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <PageTitle variant="primary" style={{ marginBottom: 0 }}>
            Grades
          </PageTitle>
          <Button
            variant="primary"
            icon={<TbPlus className='w-5 h-5' />}
            onClick={handleAddClick}
          >
            Add Grade
          </Button>
        </div>

        <div className='grades-wrapper flex-1 flex flex-col' style={{ marginTop: '10px' }}>
          <Row justify='space-between' className='grades-header'>
            <Col flex='2'>Grade</Col>
            <Col flex='1'>Students</Col>
            <Col flex='1'>Sessions</Col>
            <Col flex='1' style={{ textAlign: 'right' }}>
              Action
            </Col>
          </Row>

          <div className='mt-2' style={{ display: 'flex', flexDirection: 'column' }}>
            {isLoading ? (
              <div className='flex justify-center items-center py-8'>
                <Spin size='large' />
              </div>
            ) : grades.length === 0 ? (
              <Empty description='No grades found' className='py-8' />
            ) : (
              <>
                <div>
                  <List
                    itemLayout='horizontal'
                    dataSource={grades}
                    split={false}
                    renderItem={grade => (
                <List.Item className='grades-list-item flex items-center'>
                  <Row align='middle' style={{ width: '100%' }}>
                    <Col flex='2'>
                      <Text>{grade.section ? `${grade.gradeName} ${grade.section}` : grade.gradeName}</Text>
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
                </div>
                {/* Pagination Footer */}
                {pagination.totalPages > 1 && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                    <Row justify='space-between' align='middle'>
                      <Col>
                        <Text type='secondary' style={{ fontSize: 12 }}>
                          {pagination.total
                            ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, pagination.total)} of ${pagination.total}`
                            : 'No grades'}
                        </Text>
                      </Col>
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
                    </Row>
                  </div>
                )}
                {pagination.totalPages <= 1 && pagination.total > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                    <Text type='secondary' style={{ fontSize: 12 }}>
                      Showing {pagination.total} of {pagination.total} grades
                    </Text>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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
            ? `Are you sure you want to delete "${gradeToDelete.section ? `${gradeToDelete.gradeName} ${gradeToDelete.section}` : gradeToDelete.gradeName}"? This action cannot be undone.`
            : 'Are you sure you want to delete this grade?'
        }
        loading={deleteGradeMutation.isPending}
      />
    </>
  );
};
