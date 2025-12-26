import React, { useState } from 'react';
import { Modal, Typography, Button, Spin } from 'antd';
import { useApproveRequest, useDenyRequest } from '@/hooks/useRequests';
import { useApproveScheduleChangeRequest, useDenyScheduleChangeRequest } from '@/hooks/useScheduleChangeRequests';
import { formatTime } from '@/utils/time';
import { useAuthStore } from '@/store/authStore';
import { PERMISSIONS } from '@/utils/permissions';

const { Text, Paragraph } = Typography;

export const RequestModal = ({ open, onClose, request, requestType = 'early-end' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { hasPermission } = useAuthStore();
  const approveRequestMutation = useApproveRequest();
  const denyRequestMutation = useDenyRequest();
  const approveScheduleChangeMutation = useApproveScheduleChangeRequest();
  const denyScheduleChangeMutation = useDenyScheduleChangeRequest();
  
  const canApprove = hasPermission(PERMISSIONS.REQUESTS_APPROVE);
  const canDeny = hasPermission(PERMISSIONS.REQUESTS_DENY);

  if (!request) return null;

  const studentName = request.student?.fullName || 'Unknown';
  const reasonText = request.reasonText || 'No reason provided.';
  
  // Format display based on request type
  let titleText = '';
  let detailsText = '';
  
  if (requestType === 'schedule-change') {
    const getDayName = (dayOfWeek) => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return dayNames[dayOfWeek] || `Day ${dayOfWeek}`;
    };
    const fromSchedule = request.fromSchedule;
    const toSchedule = request.toSchedule;
    titleText = `Schedule Change Request - ${studentName}`;
    detailsText = `From: ${fromSchedule?.name || 'Unknown'} - ${getDayName(fromSchedule?.dayOfWeek)} ${fromSchedule?.startTime} - ${fromSchedule?.endTime}\nTo: ${toSchedule?.name || 'Unknown'} - ${getDayName(toSchedule?.dayOfWeek)} ${toSchedule?.startTime} - ${toSchedule?.endTime}`;
  } else {
    const scheduleEndTime = request.session?.schedule?.endTime;
    const formattedTime = scheduleEndTime ? formatTime(scheduleEndTime) : 'N/A';
    titleText = `Request - ${studentName} @ ${formattedTime}`;
    detailsText = '';
  }

  const handleApprove = async () => {
    if (!request.id) return;
    
    setIsProcessing(true);
    try {
      if (requestType === 'schedule-change') {
        await approveScheduleChangeMutation.mutateAsync({
          requestId: request.id,
          data: {},
        });
      } else {
        await approveRequestMutation.mutateAsync({
          requestId: request.id,
          data: {},
        });
      }
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
      if (requestType === 'schedule-change') {
        await denyScheduleChangeMutation.mutateAsync({
          requestId: request.id,
          data: {},
        });
      } else {
        await denyRequestMutation.mutateAsync({
          requestId: request.id,
          data: {},
        });
      }
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
          {titleText}
        </Text>

        {detailsText && (
          <Paragraph className='mt-4 text-sm text-gray-600 whitespace-pre-line'>
            {detailsText}
          </Paragraph>
        )}

        <Paragraph className='mt-4 text-black'>
          <Text strong>Reason: </Text>
          {reasonText}
        </Paragraph>

        {(canApprove || canDeny) && (
          <div className='flex justify-center gap-10 mt-10'>
            {canApprove && (
              <Button
                type='primary'
                onClick={handleApprove}
                disabled={isProcessing}
                loading={requestType === 'schedule-change' ? approveScheduleChangeMutation.isPending : approveRequestMutation.isPending}
                style={{
                  backgroundColor: '#00B894',
                  color: '#fff',
                }}
                className='border-none px-10 py-2 rounded-[4px] hover:!bg-[#019a7d]'
              >
                Accept
              </Button>
            )}
            {canDeny && (
              <Button
                type='primary'
                onClick={handleDeny}
                disabled={isProcessing}
                loading={requestType === 'schedule-change' ? denyScheduleChangeMutation.isPending : denyRequestMutation.isPending}
                style={{
                  backgroundColor: '#801818',
                  color: '#fff',
                }}
                className='hover:!bg-[#490404] border-none px-10 py-2 rounded-[4px]'
              >
                Reject
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
