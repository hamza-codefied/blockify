import React from 'react';
import { Modal, Button } from 'antd';

export const DeleteSessionModal = ({ open, onClose, session }) => {
  return (
    <Modal open={open} onCancel={onClose} footer={null} centered>
      <h1 className='text-center font-semibold text-lg text-black mb-4'>
        Delete
      </h1>
      <p className='text-black font-semibold text-center mb-6'>
        Are you sure you want to delete the session{' '}
        <span className='font-semibold'>{session?.day || 'this session'}</span>?
      </p>

      <div className='flex justify-center gap-5 sm:gap-20'>
        <Button
          type='primary'
          onClick={onClose}
          style={{
            backgroundColor: '#00B894',
            color: '#fff',
          }}
          className='border-none px-10 py-2 rounded-[4px] hover:!bg-[#019a7d]'
        >
          Delete
        </Button>
        <Button
          type='primary'
          onClick={onClose}
          style={{
            backgroundColor: '#801818',
            color: '#fff',
          }}
          className='hover:!bg-[#490404] border-none px-10 py-2 rounded-[4px]'
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};
