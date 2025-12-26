'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { Checkbox, Collapse, Empty, Spin, Typography, Tag } from 'antd';

const { Text } = Typography;
const { Panel } = Collapse;

// Day name mapping (0=Sunday, 1=Monday, etc.)
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Format time from "HH:mm:ss" to "HH:mm"
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.substring(0, 5); // "08:00:00" -> "08:00"
};

// Get day name from dayOfWeek number
const getDayName = (dayOfWeek) => {
  return DAY_NAMES[dayOfWeek] || `Day ${dayOfWeek}`;
};

export const ScheduleSelector = ({ 
  schedules = [], 
  selectedScheduleIds = [], 
  onChange, 
  loading = false,
  disabled = false 
}) => {
  // Group schedules by course name
  const schedulesByCourse = useMemo(() => {
    const grouped = {};
    schedules.forEach(schedule => {
      const courseName = schedule.name || 'Unnamed Course';
      if (!grouped[courseName]) {
        grouped[courseName] = [];
      }
      grouped[courseName].push(schedule);
    });
    
    // Sort schedules within each course by day and time
    Object.keys(grouped).forEach(courseName => {
      grouped[courseName].sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) {
          return a.dayOfWeek - b.dayOfWeek;
        }
        return a.startTime.localeCompare(b.startTime);
      });
    });
    
    return grouped;
  }, [schedules]);

  const courseNames = Object.keys(schedulesByCourse).sort();
  
  // Keep track of expanded panel (only one at a time)
  const [expandedPanel, setExpandedPanel] = useState(() => courseNames.length > 0 ? courseNames[0] : null);
  
  // Update expanded panel when course names change (keep first one expanded)
  useEffect(() => {
    if (courseNames.length > 0 && !expandedPanel) {
      setExpandedPanel(courseNames[0]);
    }
  }, [courseNames.join(',')]);

  const handleScheduleToggle = (scheduleId, checked) => {
    if (disabled) return;
    
    const newSelectedIds = checked
      ? [...selectedScheduleIds, scheduleId]
      : selectedScheduleIds.filter(id => id !== scheduleId);
    
    onChange?.(newSelectedIds);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Spin size="large" />
        <Text type="secondary" className="mt-4 block text-center">Loading schedules...</Text>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <Empty 
        description="No schedules available for this grade"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="py-2">
      <Collapse
        activeKey={expandedPanel}
        onChange={(key) => setExpandedPanel(key)}
        accordion
        ghost
        size="small"
        className="schedule-accordion"
      >
        {courseNames.map(courseName => {
          const courseSchedules = schedulesByCourse[courseName];
          const selectedCount = courseSchedules.filter(s => selectedScheduleIds.includes(s.id)).length;
          
          return (
            <Panel
              key={courseName}
              header={
                <div className="flex items-center justify-between w-full pr-2">
                  <Text strong className="text-sm">{courseName}</Text>
                  <div className="flex items-center gap-2">
                    {selectedCount > 0 && (
                      <Tag color="blue" className="m-0 text-xs">
                        {selectedCount}/{courseSchedules.length} selected
                      </Tag>
                    )}
                    <Text type="secondary" className="text-xs">
                      {courseSchedules.length} schedule{courseSchedules.length !== 1 ? 's' : ''}
                    </Text>
                  </div>
                </div>
              }
            >
              <div className="flex flex-col gap-1">
                {courseSchedules.map(schedule => {
                  const isSelected = selectedScheduleIds.includes(schedule.id);
                  const dayName = getDayName(schedule.dayOfWeek);
                  const timeRange = `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`;
                  
                  return (
                    <div
                      key={schedule.id}
                      className={`
                        px-4 py-1 rounded transition-all text-xs flex items-center
                        ${disabled ? 'opacity-60' : ''}
                      `}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleScheduleToggle(schedule.id, e.target.checked)}
                        disabled={disabled}
                        className="text-sm"
                      />
                      <div className="ml-2 flex items-center justify-between flex-1">
                        <Text strong className="text-sm">
                          {dayName}
                        </Text  >
                        <Text strong className="text-sm">
                          {timeRange}
                        </Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </Collapse>
      
      {selectedScheduleIds.length > 0 && (
        <div className="mt-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded text-center">
          <Text type="secondary" className="text-xs">
            {selectedScheduleIds.length} schedule{selectedScheduleIds.length !== 1 ? 's' : ''} selected
          </Text>
        </div>
      )}
    </div>
  );
};

