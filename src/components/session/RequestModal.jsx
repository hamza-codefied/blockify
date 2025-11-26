import React, { useState } from 'react';
import { Modal, Typography, Button, Spin } from 'antd';
import { useApproveRequest, useDenyRequest } from '@/hooks/useRequests';
import { formatTime } from '@/utils/time';

const { Text, Paragraph } = Typography;

export const RequestModal = ({ open, onClose, request }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const approveRequestMutation = useApproveRequest();
  const denyRequestMutation = useDenyRequest();

  if (!request) return null;

  const studentName = request.student?.fullName || 'Unknown';
  const scheduleEndTime = request.session?.schedule?.endTime;
  const formattedTime = scheduleEndTime ? formatTime(scheduleEndTime) : 'N/A';
  const reasonText = request.reasonText || 'No reason provided.';

  const handleApprove = async () => {
    if (!request.id) return;
    
    setIsProcessing(true);
    try {
      await approveRequestMutation.mutateAsync({
        requestId: request.id,
        data: {},
      });
      onClose();
    } catch (error) {
      // Error is handled by the mutation hook
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (!request.id) return;
    
    setIsProcessing(true);
    try {
      await denyRequestMutation.mutateAsync({
        requestId: request.id,
        data: {},
      });
      onClose();
    } catch (error) {
      // Error is handled by the mutation hook
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      title={null}
      width={400}
      closable={!isProcessing}
    >
      <div className='text-start'>
        <Text className='block text-sm font-semibold'>
          Request - {studentName} @ {formattedTime}
        </Text>

        <Paragraph className='mt-8 text-black0'>
          {reasonText}
        </Paragraph>

        <div className='flex justify-center gap-10 mt-10'>
          <Button
            type='primary'
            onClick={handleApprove}
            disabled={isProcessing}
            loading={approveRequestMutation.isPending}
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
            onClick={handleDeny}
            disabled={isProcessing}
            loading={denyRequestMutation.isPending}
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
