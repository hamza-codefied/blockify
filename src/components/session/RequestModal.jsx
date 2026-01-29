import React, { useState } from 'react';
import { Modal, Typography, Button, Descriptions, Tag, Divider, Space, Card } from 'antd';
import { useApproveRequest, useDenyRequest } from '@/hooks/useRequests';
import { useApproveScheduleChangeRequest, useDenyScheduleChangeRequest } from '@/hooks/useScheduleChangeRequests';
import { formatTime } from '@/utils/time';
import { useAuthStore } from '@/store/authStore';
import { PERMISSIONS } from '@/utils/permissions';
import { TbArrowRight, TbCalendar, TbClock } from 'react-icons/tb';

const { Text, Title, Paragraph } = Typography;

// Helper for 3-char day names
const getDayName = (dayOfWeek) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[dayOfWeek] || `Day ${dayOfWeek}`;
};

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
  const status = request.status || 'pending';

  const getStatusColor = (s) => {
    switch (s) {
      case 'pending': return 'orange';
      case 'approved': return 'green';
      case 'denied': return 'red';
      default: return 'default';
    }
  };

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

  // Content for Schedule Change
  const renderScheduleChangeDetails = () => {
    const from = request.fromSchedule;
    const to = request.toSchedule;

    if (!from || !to) return <Text type="secondary">Schedule details unavailable</Text>;

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
          {/* From */}
          <div className="flex-1">
            <Text type="secondary" className="text-xs uppercase font-semibold block mb-1">Current Schedule</Text>
            {from.name && (
              <div className="text-xs text-gray-600 mb-1 font-medium bg-gray-200 inline-block px-2 py-0.5 rounded">
                {from.name}
              </div>
            )}
            <div className="flex items-center gap-2">
              <TbCalendar className="text-gray-400" />
              <Text strong>{getDayName(from.dayOfWeek)}</Text>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-0.5">
              <TbClock className="text-gray-400" />
              <Text>{from.startTime?.substring(0, 5)} - {from.endTime?.substring(0, 5)}</Text>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center px-2">
            <TbArrowRight className="text-gray-400 text-xl" />
          </div>

          {/* To */}
          <div className="flex-1">
            <Text type="secondary" className="text-xs uppercase font-semibold block mb-1">New Schedule</Text>
            {to.name && (
              <div className="text-xs text-[#00B894] mb-1 font-medium bg-[#E6FFFA] inline-block px-2 py-0.5 rounded">
                {to.name}
              </div>
            )}
            <div className="flex items-center gap-2">
              <TbCalendar className="text-gray-400" />
              <Text strong>{getDayName(to.dayOfWeek)}</Text>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-0.5">
              <TbClock className="text-gray-400" />
              <Text>{to.startTime?.substring(0, 5)} - {to.endTime?.substring(0, 5)}</Text>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      title={
        <Space direction="vertical" size={0}>
          <Title level={4} style={{ margin: 0 }}>
            {requestType === 'schedule-change' ? 'Schedule Change Request' : 'Early Session End'}
          </Title>
          <Text type="secondary" className="text-sm font-normal">
            Submitted by <Text strong>{studentName}</Text>
          </Text>
        </Space>
      }
      width={500}
      closable={!isProcessing}
    >
      <div className="mt-6 flex flex-col gap-6">
        {/* Status Badge */}
        <div className="flex justify-between items-center">
          <Text className="text-gray-500">Status</Text>
          <Tag color={getStatusColor(status)} className="px-3 py-1 text-sm rounded-full m-0 capitalize">
            {status}
          </Tag>
        </div>

        <Divider style={{ margin: '0' }} />

        {/* Dynamic Details */}
        {requestType === 'schedule-change' ? renderScheduleChangeDetails() : (
          <div className="p-4 bg-gray-50 rounded-lg">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Session">
                {request.session?.name || 'Unknown Session'}
              </Descriptions.Item>
              <Descriptions.Item label="Scheduled End">
                {request.session?.schedule?.endTime ? formatTime(request.session.schedule.endTime) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Requested End">
                {request.requestedEndTime ? formatTime(request.requestedEndTime) : 'Now'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {/* Reason */}
        <div>
          <Text type="secondary" className="text-xs uppercase font-semibold block mb-2">Reason</Text>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
            {reasonText}
          </div>
        </div>

        {/* Action Buttons */}
        {(canApprove || canDeny) && status === 'pending' && (
          <div className='flex gap-4 mt-2'>
            {canDeny && (
              <Button
                block
                size="large"
                onClick={handleDeny}
                disabled={isProcessing}
                loading={requestType === 'schedule-change' ? denyScheduleChangeMutation.isPending : denyRequestMutation.isPending}
                className="hover:!bg-red-50 hover:!text-red-600 hover:!border-red-200"
                danger
              >
                Deny Request
              </Button>
            )}
            {canApprove && (
              <Button
                block
                type='primary'
                size="large"
                onClick={handleApprove}
                disabled={isProcessing}
                loading={requestType === 'schedule-change' ? approveScheduleChangeMutation.isPending : approveRequestMutation.isPending}
                style={{
                  backgroundColor: '#00B894',
                }}
                className='hover:!bg-[#019a7d]'
              >
                Approve Request
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
