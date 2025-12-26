import React from 'react';
import { Modal } from 'antd';

/**
 * Formats schedule conflict errors for better display
 * @param {string} errorMessage - The raw error message from backend
 * @returns {Object} - { isScheduleConflict: boolean, formattedMessage: string, conflicts: Array }
 */
export const formatScheduleConflictError = (errorMessage) => {
  if (!errorMessage || !errorMessage.includes('Schedule conflicts detected:')) {
    return { isScheduleConflict: false, formattedMessage: errorMessage, conflicts: [] };
  }

  // Extract conflicts from the message
  const conflicts = [];
  const conflictPattern = /([A-Za-z]+):\s*(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}:\d{2}:\d{2})\s*conflicts with\s*(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}:\d{2}:\d{2})(?:\s*\(([^)]+)\))?/g;
  let match;
  
  while ((match = conflictPattern.exec(errorMessage)) !== null) {
    const [, day, start1, end1, start2, end2, reason] = match;
    conflicts.push({
      day,
      time1: `${start1.substring(0, 5)} - ${end1.substring(0, 5)}`,
      time2: `${start2.substring(0, 5)} - ${end2.substring(0, 5)}`,
      reason: reason || null
    });
  }

  // Group conflicts by day
  const conflictsByDay = {};
  conflicts.forEach(conflict => {
    if (!conflictsByDay[conflict.day]) {
      conflictsByDay[conflict.day] = [];
    }
    conflictsByDay[conflict.day].push(conflict);
  });

  // Create a short summary message
  const conflictCount = conflicts.length;
  const days = Object.keys(conflictsByDay);
  let shortMessage = `Schedule conflicts detected: ${conflictCount} conflict${conflictCount > 1 ? 's' : ''} on ${days.length} day${days.length > 1 ? 's' : ''} (${days.join(', ')})`;
  
  if (conflicts[0]?.reason) {
    shortMessage += `. ${conflicts[0].reason}`;
  }

  return {
    isScheduleConflict: true,
    formattedMessage: shortMessage,
    conflicts,
    conflictsByDay
  };
};

/**
 * Shows schedule conflict errors in a modal with detailed list
 * @param {string} errorMessage - The raw error message from backend
 */
export const showScheduleConflictModal = (errorMessage) => {
  const { conflicts, conflictsByDay } = formatScheduleConflictError(errorMessage);
  
  if (!conflicts.length) {
    // Fallback to regular error message
    return false;
  }

  const days = Object.keys(conflictsByDay);
  const content = (
    <div className="mt-4">
      <p className="mb-3 text-sm text-gray-600">
        {conflicts.length} schedule conflict{conflicts.length > 1 ? 's' : ''} detected. 
        {conflicts[0]?.reason && (
          <span className="block mt-1 text-xs text-gray-500">{conflicts[0].reason}</span>
        )}
      </p>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {days.map(day => (
          <div key={day} className="border-b pb-2 last:border-b-0">
            <div className="font-semibold text-sm mb-1">{day}</div>
            {conflictsByDay[day].map((conflict, idx) => (
              <div key={idx} className="text-xs text-gray-600 ml-2">
                • {conflict.time1} conflicts with {conflict.time2}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  Modal.error({
    title: 'Schedule Conflicts',
    content,
    width: 500,
    centered: true,
    okText: 'Got it',
    okButtonProps: {
      style: {
        backgroundColor: '#00B894',
        borderColor: '#00B894',
      },
      className: 'hover:!bg-[#00b894] hover:!border-[#00b894]',
    },
  });

  return true;
};
