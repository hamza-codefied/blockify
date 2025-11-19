import React from 'react';
import { Modal, Button } from 'antd';

export const DeleteSessionModal = ({ open, onClose, session, onConfirm, loading = false }) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = session?.dayOfWeek !== undefined ? dayNames[session.dayOfWeek] : null;

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered>
      <h1 className='text-center font-semibold text-lg text-black dark:text-white mb-4'>
        Delete Schedule
      </h1>
      <p className='text-black dark:text-white font-semibold text-center mb-6'>
        Are you sure you want to delete the schedule for{' '}
        <span className='font-semibold'>{dayName || 'this day'}</span>?
      </p>

      <div className='flex justify-center gap-5 sm:gap-20'>
        <Button
          type='primary'
          onClick={onConfirm || onClose}
          loading={loading}
          style={{
            backgroundColor: '#801818',
            color: '#fff',
          }}
          className='hover:!bg-[#490404] border-none px-10 py-2 rounded-[4px]'
        >
          Delete
        </Button>
        <Button
          type='primary'
          onClick={onClose}
          disabled={loading}
          style={{
            backgroundColor: '#00B894',
            color: '#fff',
          }}
          className='border-none px-10 py-2 rounded-[4px] hover:!bg-[#019a7d]'
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};
