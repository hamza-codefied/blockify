'use client';
import React, { useState } from 'react';
import { Card, List, Row, Col, Typography, Button, Spin, Pagination } from 'antd';
import { TbEdit } from 'react-icons/tb';
import './grades.css';
import { SubjectModal } from './SubjectModal';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useGetSubjects } from '@/hooks/useSubjects';
import { useDeleteSubject } from '@/hooks/useSubjects';
import { DeleteConfirmModal } from '@/components/userManagement/DeleteConfirmModal';

const { Title, Text } = Typography;

export const Subjects = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
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
        variant='outlined'
        style={{
          borderRadius: 12,
          marginTop: 24,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
        className='border-2 border-gray-200 w-full shadow-lg'
      >
        {/* ===== Header ===== */}
        <Row justify='space-between' align='middle' gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Title level={5} style={{ marginBottom: 0 }}>
              Subjects
            </Title>
          </Col>
          <Col xs={24} md={16} style={{ textAlign: 'right' }}>
            <Button
              type='text'
              className='add-grade-btn text-[#00B894] font-semibold'
              onClick={handleAddClick}
            >
              Add Subject +
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
            <Col flex='2'>Subject</Col>
            <Col flex='1'>Schedules</Col>
            <Col flex='1' className='text-right'>
              Action
            </Col>
          </Row>

          {/* ===== Subjects List ===== */}
          {isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <Spin size='large' />
            </div>
          ) : subjects.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              No subjects found. Click "Add Subject +" to create one.
            </div>
          ) : (
            <List
              itemLayout='horizontal'
              dataSource={subjects}
              renderItem={subject => (
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
          )}
        </div>

        {/* ===== Footer ===== */}
        <Row justify='space-between' align='middle' style={{ marginTop: 8 }}>
          <Col>
            <Text type='secondary' style={{ fontSize: 12 }}>
              {pagination.total
                ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, pagination.total)} of ${pagination.total}`
                : 'No subjects'}
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

