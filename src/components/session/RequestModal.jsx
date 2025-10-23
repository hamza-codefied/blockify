import React from 'react';
import { Modal, Typography, Button } from 'antd';

const { Text, Paragraph } = Typography;

export const RequestModal = ({ open, onClose, request }) => {
  if (!request) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      title={null}
      width={400}
    >
      <div className='text-start'>
        <Text className='block text-sm font-semibold'>
          Request - {request.name} @ {request.time}
        </Text>

        <Paragraph className='mt-8 text-black0'>
          {request.message ||
            'I am being dismissed early for a doctor’s appointment.'}
        </Paragraph>

        <div className='flex justify-center gap-10 mt-10'>
          <Button
            type='primary'
            onClick={onClose}
            style={{
              backgroundColor: '#00B894',
              color: '#fff',
            }}
            className='border-none px-10 py-2 rounded-[4px] hover:!bg-[#019a7d]'
          >
            Accept
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
            Reject
          </Button>
        </div>
      </div>
    </Modal>
  );
};
