'use client';
import React, { useState } from 'react';
import { Card, List, Row, Col, Typography, Spin, Empty, Pagination } from 'antd';
import { TbEdit, TbPlus } from 'react-icons/tb';
import './grades.css';
import { SubjectModal } from './SubjectModal';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useGetSubjects } from '@/hooks/useSubjects';
import { useDeleteSubject } from '@/hooks/useSubjects';
import { DeleteConfirmModal } from '@/components/userManagement/DeleteConfirmModal';
import { PageTitle } from '@/components/common/PageTitle';
import { Button } from '@/components/common/Button';

const { Text } = Typography;

export const Subjects = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  //>>> Fetch subjects with pagination
  const { data: subjectsData, isLoading, refetch } = useGetSubjects({
    page,
    limit,
    sort: 'name',
    sortOrder: 'ASC',
  });

  const deleteSubjectMutation = useDeleteSubject();

  //>>> API returns { success: true, data: [...subjects], pagination: {...} }
  const subjects = subjectsData?.data || [];
  const pagination = subjectsData?.pagination || {};

  const handleAddClick = () => {
    setModalMode('add');
    setSelectedSubject(null);
    setModalOpen(true);
  };

  const handleEditClick = subject => {
    setModalMode('edit');
    setSelectedSubject(subject);
    setModalOpen(true);
  };

  const handleDeleteClick = subject => {
    setSubjectToDelete(subject);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (subjectToDelete) {
      try {
        await deleteSubjectMutation.mutateAsync(subjectToDelete.id);
        setDeleteModalOpen(false);
        setSubjectToDelete(null);
        // Refetch subjects list after successful deletion
        refetch();
        // If we deleted the last item on the current page and it's not page 1, go back a page
        if (subjects.length === 1 && page > 1) {
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
        className='subjects-card border-2 border-gray-200 w-full shadow-lg flex flex-col'
        style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '100%' }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        {/* ===== Header ===== */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <PageTitle variant="primary" style={{ marginBottom: 0 }}>
            Subjects
          </PageTitle>
          <Button
            variant="primary"
            icon={<TbPlus className='w-5 h-5' />}
            onClick={handleAddClick}
          >
            Add Subject
          </Button>
        </div>

        <div className='grades-wrapper flex-1 flex flex-col' style={{ marginTop: '10px' }}>
          <Row justify='space-between' className='grades-header'>
            <Col flex='2'>Subject</Col>
            <Col flex='1'>Schedules</Col>
            <Col flex='1' style={{ textAlign: 'right' }}>
              Action
            </Col>
          </Row>

          <div className='mt-2' style={{ display: 'flex', flexDirection: 'column' }}>
            {isLoading ? (
              <div className='flex justify-center items-center py-8'>
                <Spin size='large' />
              </div>
            ) : subjects.length === 0 ? (
              <Empty description='No subjects found' className='py-8' />
            ) : (
              <>
                <div>
                  <List
                    itemLayout='horizontal'
                    dataSource={subjects}
                    split={false}
                    renderItem={subject => (
                <List.Item className='subjects-list-item flex items-center'>
                  <Row align='middle' style={{ width: '100%' }}>
                    <Col flex='2'>
                      <Text>{subject.name}</Text>
                    </Col>
                    <Col flex='1'>
                      <Text>{subject.scheduleCount || 0}</Text>
                    </Col>
                    <Col flex='1' className='w-[100%] flex justify-end gap-2'>
                      <TbEdit
                        size={20}
                        color='#00B894'
                        className='cursor-pointer'
                        onClick={() => handleEditClick(subject)}
                      />
                      <RiDeleteBinLine
                        className='w-5 h-5 cursor-pointer text-[#801818]'
                        onClick={() => handleDeleteClick(subject)}
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
                            : 'No subjects'}
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
                      Showing {pagination.total} of {pagination.total} subjects
                    </Text>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* ===== Add/Edit Modal ===== */}
      <SubjectModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSubject(null);
        }}
        mode={modalMode}
        subjectData={selectedSubject}
        onSuccess={() => {
          setModalOpen(false);
          setSelectedSubject(null);
          refetch();
        }}
      />

      {/* ===== Delete Confirmation Modal ===== */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSubjectToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title='Delete Subject'
        message={
          subjectToDelete
            ? `Are you sure you want to delete "${subjectToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this subject?'
        }
        loading={deleteSubjectMutation.isPending}
        errorMessage={
          subjectToDelete?.scheduleCount > 0
            ? `Cannot delete subject. ${subjectToDelete.scheduleCount} schedule(s) are associated with this subject.`
            : null
        }
      />
    </>
  );
};

