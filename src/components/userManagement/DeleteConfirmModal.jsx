'use client';
import React from 'react';
import { Modal, Button, Typography } from 'antd';
import { useDeleteStudent } from '@/hooks/useStudents';
import { useDeleteManager } from '@/hooks/useManagers';

const { Text } = Typography;

export const DeleteConfirmModal = ({ 
  open, 
  onClose, 
  user, 
  activeTab, 
  onSuccess,
  // Generic props for grades or other entities
  onConfirm,
  title,
  message,
  loading
}) => {
  const deleteStudentMutation = useDeleteStudent();
  const deleteManagerMutation = useDeleteManager();

  // If using generic props (for grades, etc.), use those
  if (onConfirm) {
    const isLoading = loading || false;
    
    return (
      <Modal 
        open={open} 
        onCancel={onClose} 
        footer={null} 
        centered
        title={title || 'Confirm Delete'}
      >
        <div className='text-center space-y-3'>
          <Text strong className='text-lg'>
            {message || 'Are you sure you want to delete this item?'}
          </Text>
          <div className='flex justify-center gap-3 mt-4'>
            <Button onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type='primary'
              danger
              loading={isLoading}
              onClick={onConfirm}
              style={{ backgroundColor: '#801818', borderColor: '#801818' }}
              className='hover:!bg-[#801818] hover:!border-[#801818]'
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Legacy support for students/managers
  if (!user) return null;

  const handleDelete = async () => {
    try {
      if (activeTab === 'students') {
        await deleteStudentMutation.mutateAsync(user.id);
      } else {
        await deleteManagerMutation.mutateAsync(user.id);
      }
      
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const isLoading = activeTab === 'students' 
    ? deleteStudentMutation.isPending 
    : deleteManagerMutation.isPending;

  return (
    <Modal 
      open={open} 
      onCancel={onClose} 
      footer={null} 
      centered
      title={`Delete ${activeTab === 'students' ? 'Student' : 'Manager'}`}
    >
      <div className='text-center space-y-3'>
        <Text strong className='text-lg'>
          Are you sure you want to delete{' '}
          <span className='text-[#801818]'>{user.fullName || user.name}</span>?
        </Text>
        <Text type='secondary' className='block'>
          This action cannot be undone.
        </Text>
        <div className='flex justify-center gap-3 mt-4'>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type='primary'
            danger
            loading={isLoading}
            onClick={handleDelete}
            style={{ backgroundColor: '#801818', borderColor: '#801818' }}
            className='hover:!bg-[#801818] hover:!border-[#801818]'
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
