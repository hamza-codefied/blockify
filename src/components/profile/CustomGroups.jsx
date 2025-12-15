'use client';
import React, { useState } from 'react';
import {
  Card,
  List,
  Row,
  Col,
  Typography,
  Modal,
  Tag,
  Avatar,
  Divider,
  Spin,
  Empty,
  Pagination,
  Button,
} from 'antd';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import './grades.css';
import { CustomGroupModal } from './CustomGroupModal';
import { TbEdit, TbPlus } from 'react-icons/tb';
import { RiDeleteBinLine } from 'react-icons/ri';
import {
  useGetCustomGroups,
  useDeleteCustomGroup,
  useGetCustomGroup,
} from '@/hooks/useCustomGroups';
import { PageTitle } from '@/components/common/PageTitle';

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
  const {
    data: customGroupsData,
    isLoading,
    refetch,
  } = useGetCustomGroups({
    page,
    limit,
    sort: 'created_at',
    sortOrder: 'DESC',
  });
  // Backend returns { success: true, data: [...groups], pagination: {...} }
  const groups = customGroupsData?.data || [];
  const pagination = customGroupsData?.pagination || {};

  // Fetch selected group details for view/edit
  const { data: groupDetailsData, isLoading: groupDetailsLoading } =
    useGetCustomGroup(
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

  const handlePageChange = newPage => {
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
        className='custom-groups-card border-2 border-gray-200 w-full shadow-lg flex flex-col'
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
        }}
        bodyStyle={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {/* ===== Header ===== */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <PageTitle variant='primary' style={{ marginBottom: 0 }}>
            Custom Groups
          </PageTitle>
          <Button
            variant='primary'
            icon={<TbPlus className='w-5 h-5' />}
            onClick={handleAddClick}
          >
            Add Custom Group
          </Button>
        </div>

        <div
          className='grades-wrapper flex-1 flex flex-col text-base'
          style={{ marginTop: '10px' }}
        >
          <Row justify='space-between' className='grades-header text-base'>
            <Col className='text-base' flex='2'>
              Group Name
            </Col>
            <Col className='text-base' flex='1'>
              Members
            </Col>
            <Col className='text-base' flex='1' style={{ textAlign: 'right' }}>
              Action
            </Col>
          </Row>

          <div
            className='mt-2'
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {isLoading ? (
              <div className='flex justify-center items-center py-8'>
                <Spin size='large' />
              </div>
            ) : groups.length === 0 ? (
              <Empty description='No custom groups found' className='py-8' />
            ) : (
              <>
                <div>
                  <List
                    itemLayout='horizontal'
                    dataSource={groups}
                    split={false}
                    renderItem={group => (
                      <List.Item className='custom-groups-list-item flex items-center text-base'>
                        <Row
                          className='text-base'
                          align='middle'
                          style={{ width: '100%' }}
                        >
                          <Col flex='2'>
                            <Text className='text-base' strong>
                              {group.name}
                            </Text>
                            {group.description && (
                              <div>
                                <Text
                                  className='text-base'
                                  type='secondary'
                                  style={{ fontSize: 12 }}
                                >
                                  {group.description}
                                </Text>
                              </div>
                            )}
                          </Col>
                          <Col flex='1'>
                            <Text className='text-base'>
                              {group.memberCount || 0}
                            </Text>
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
                {/* Pagination Footer */}
                {pagination.totalPages > 1 && (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: '1px solid #f0f0f0',
                    }}
                  >
                    <Row justify='space-between' align='middle'>
                      <Col>
                        <Text type='secondary' style={{ fontSize: 12 }}>
                          {pagination.total
                            ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, pagination.total)} of ${pagination.total}`
                            : 'No custom groups'}
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
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: '1px solid #f0f0f0',
                    }}
                  >
                    <Text type='secondary' style={{ fontSize: 12 }}>
                      Showing {pagination.total} of {pagination.total} custom
                      groups
                    </Text>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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
                      <Tag
                        key={grade.id}
                        color='blue'
                        style={{ marginRight: 4 }}
                      >
                        {grade.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
              <div className='flex justify-between'>
                <Text type='secondary'>Status:</Text>
                <Tag
                  color={groupDetails.status === 'active' ? 'green' : 'default'}
                >
                  {groupDetails.status || 'active'}
                </Tag>
              </div>
              {groupDetails.schedules && groupDetails.schedules.length > 0 && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <Title level={5}>Schedules</Title>
                  <div className='space-y-2'>
                    {groupDetails.schedules.map(schedule => {
                      const days = [
                        'Sunday',
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                      ];
                      return (
                        <div
                          key={schedule.id}
                          className='flex justify-between items-center'
                        >
                          <Text>{days[schedule.dayOfWeek]}</Text>
                          <Text strong>
                            {schedule.startTime} - {schedule.endTime}
                          </Text>
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
          Are you sure you want to delete <strong>{selectedGroup?.name}</strong>
          ? This action cannot be undone.
        </Text>
      </Modal>
    </>
  );
};
