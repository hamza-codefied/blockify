'use client';
import React, { useState } from 'react';
import {
  Card,
  List,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  Tag,
  Avatar,
  Divider,
  Spin,
  Empty,
  Pagination,
} from 'antd';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import './grades.css';
import { CustomGroupModal } from './CustomGroupModal';
import { TbEdit } from 'react-icons/tb';
import { RiDeleteBinLine } from 'react-icons/ri';
import {
  useGetCustomGroups,
  useDeleteCustomGroup,
  useGetCustomGroup,
} from '@/hooks/useCustomGroups';

const { Title, Text } = Typography;

export const CustomGroups = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Fetch custom groups with pagination (Admin)
  const { data: customGroupsData, isLoading, refetch } = useGetCustomGroups({
    page,
    limit,
    sort: 'created_at',
    sortOrder: 'DESC',
  });
  // Backend returns { success: true, data: [...groups], pagination: {...} }
  const groups = customGroupsData?.data || [];
  const pagination = customGroupsData?.pagination || {};

  // Fetch selected group details for view/edit
  const { data: groupDetailsData, isLoading: groupDetailsLoading } = useGetCustomGroup(
    selectedGroupId,
    !!selectedGroupId && (viewModalOpen || editModalOpen)
  );
  const groupDetails = groupDetailsData?.data || null;

  // Delete mutation
  const deleteGroupMutation = useDeleteCustomGroup();

  // ===== Handlers =====
  const handleAddClick = () => {
    setModalMode('add');
    setSelectedGroup(null);
    setSelectedGroupId(null);
    setModalOpen(true);
  };

  const handleViewClick = group => {
    setSelectedGroup(group);
    setSelectedGroupId(group.id);
    setViewModalOpen(true);
  };

  const handleEditClick = group => {
    setSelectedGroup(group);
    setSelectedGroupId(group.id);
    setEditModalOpen(true);
  };

  const handleDeleteClick = group => {
    setSelectedGroup(group);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedGroup?.id) {
      try {
        await deleteGroupMutation.mutateAsync(selectedGroup.id);
        setDeleteModalOpen(false);
        setSelectedGroup(null);
        refetch();
        // If we deleted the last item on the current page and it's not page 1, go back a page
        if (groups.length === 1 && page > 1) {
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

  const handleModalSuccess = () => {
    setModalOpen(false);
    setEditModalOpen(false);
    setSelectedGroup(null);
    setSelectedGroupId(null);
    refetch();
  };

  return (
    <>
      <Card
        variant='outlined'
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        className='w-full bg-white rounded-xl shadow-lg border-2 border-gray-200'
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {/* ===== Header ===== */}
        <Row justify='space-between' align='middle' gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Title className='w-[120px]' level={5} style={{ marginBottom: 0 }}>
              Custom Groups
            </Title>
          </Col>
          <Col xs={24} md={16} style={{ textAlign: 'right' }}>
            <Button
              type='text'
              className='add-grade-btn'
              onClick={handleAddClick}
            >
              Add Custom Group +
            </Button>
          </Col>
        </Row>

        {/* ===== Scrollable Table Wrapper ===== */}
        <div className='grades-wrapper' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Row
            justify='space-between'
            className='grades-header'
            style={{
              marginTop: 18,
              marginBottom: 2,
              fontWeight: 500,
              background: '#fff',
              boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
              border: '2px solid rgba(0,0,0,0.05)',
              borderRadius: 12,
              padding: '20px 16px',
            }}
          >
            <Col flex='2'>Group Name</Col>
            <Col flex='1'>Members</Col>
            <Col flex='1' className='text-right'>
              Action
            </Col>
          </Row>

          {isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <Spin size='large' />
            </div>
          ) : groups.length === 0 ? (
            <div className='flex justify-center items-center py-8'>
              <Empty description="No custom groups found. Create your first custom group!" />
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <List
                itemLayout='horizontal'
                dataSource={groups}
                renderItem={group => (
                <List.Item
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    marginBottom: 8,
                    marginTop: 10,
                    padding: '12px 16px',
                    boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
                    border: '2px solid rgba(0,0,0,0.05)',
                  }}
                >
                  <Row align='middle' style={{ width: '100%' }}>
                    <Col flex='2'>
                      <Text strong>{group.name}</Text>
                      {group.description && (
                        <div>
                          <Text type='secondary' style={{ fontSize: 12 }}>
                            {group.description}
                          </Text>
                        </div>
                      )}
                    </Col>
                    <Col flex='1'>
                      <Text>{group.memberCount || 0}</Text>
                    </Col>
                    <Col flex='1' className='flex justify-end gap-3'>
                      <AiOutlineEye
                        size={14}
                        color='#186ee8'
                        className='cursor-pointer'
                        onClick={() => handleViewClick(group)}
                      />
                      <TbEdit
                        size={14}
                        color='#00B894'
                        className='cursor-pointer'
                        onClick={() => handleEditClick(group)}
                      />
                      <RiDeleteBinLine
                        size={14}
                        color='#801818'
                        className='cursor-pointer'
                        onClick={() => handleDeleteClick(group)}
                      />
                    </Col>
                  </Row>
                </List.Item>
              )}
              />
            </div>
          )}
        </div>

        {/* ===== Footer ===== */}
        <Row justify='space-between' align='middle' style={{ marginTop: 8 }}>
          <Col>
            <Text type='secondary' style={{ fontSize: 12 }}>
              {pagination.total
                ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, pagination.total)} of ${pagination.total}`
                : 'No custom groups'}
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

      {/* ===== Add Modal ===== */}
      <CustomGroupModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedGroup(null);
          setSelectedGroupId(null);
        }}
        mode='add'
        onSuccess={handleModalSuccess}
      />

      {/* ===== Edit Modal ===== */}
      <CustomGroupModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedGroup(null);
          setSelectedGroupId(null);
        }}
        mode='edit'
        groupData={groupDetails}
        onSuccess={handleModalSuccess}
      />

      {/* ===== View Modal ===== */}
      <Modal
        title={
          <div className='text-center'>
            <Title level={4} style={{ marginBottom: 0, color: '#00B894' }}>
              {groupDetails?.name || selectedGroup?.name || 'Group Details'}
            </Title>
            <Text type='secondary'>Group Overview</Text>
          </div>
        }
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedGroup(null);
          setSelectedGroupId(null);
        }}
        footer={null}
        centered
        width={600}
        bodyStyle={{
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: '20px 24px',
          borderRadius: 12,
        }}
      >
        {groupDetailsLoading ? (
          <div className='flex justify-center items-center py-8'>
            <Spin size='large' />
          </div>
        ) : groupDetails ? (
          <div>
            {groupDetails.description && (
              <>
                <Title level={5}>Description</Title>
                <Text>{groupDetails.description}</Text>
                <Divider style={{ margin: '12px 0' }} />
              </>
            )}

            <Title level={5}>Group Information</Title>
            <div className='space-y-2 mb-4'>
              <div className='flex justify-between'>
                <Text type='secondary'>Members:</Text>
                <Text strong>{groupDetails.memberCount || 0}</Text>
              </div>
              {groupDetails.grades && groupDetails.grades.length > 0 && (
                <div className='flex justify-between'>
                  <Text type='secondary'>Grades:</Text>
                  <div>
                    {groupDetails.grades.map(grade => (
                      <Tag key={grade.id} color='blue' style={{ marginRight: 4 }}>
                        {grade.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
              <div className='flex justify-between'>
                <Text type='secondary'>Status:</Text>
                <Tag color={groupDetails.status === 'active' ? 'green' : 'default'}>
                  {groupDetails.status || 'active'}
                </Tag>
              </div>
              {groupDetails.schedules && groupDetails.schedules.length > 0 && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <Title level={5}>Schedules</Title>
                  <div className='space-y-2'>
                    {groupDetails.schedules.map(schedule => {
                      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      return (
                        <div key={schedule.id} className='flex justify-between items-center'>
                          <Text>{days[schedule.dayOfWeek]}</Text>
                          <Text strong>{schedule.startTime} - {schedule.endTime}</Text>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ===== Delete Confirmation Modal ===== */}
      <Modal
        title='Confirm Delete'
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedGroup(null);
        }}
        onOk={handleDeleteConfirm}
        okText='Delete'
        okButtonProps={{ danger: true, loading: deleteGroupMutation.isPending }}
        centered
      >
        <Text>
          Are you sure you want to delete{' '}
          <strong>{selectedGroup?.name}</strong>? This action cannot be undone.
        </Text>
      </Modal>
    </>
  );
};
