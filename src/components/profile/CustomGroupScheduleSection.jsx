'use client';
import React, { useState } from 'react';
import { Form, TimePicker, Row, Col, Typography } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

export const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAY_NUMBERS = {
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 0,
};

export const CustomGroupScheduleSection = ({ form, selectedDays, onToggleDay }) => {
  const [pendingTimes, setPendingTimes] = useState({});
  
  return (
    <>
      {/* ===== Schedules Section ===== */}
      <Text strong className='text-base mb-3 block'>Schedules (Optional)</Text>
      <Text type='secondary' className='text-sm mb-4 block'>
        Add schedules for this group. You can add multiple schedules for different days.
      </Text>

      {/* ===== Select Days ===== */}
      <Form.Item
        label='Select Days'
        help={selectedDays.length === 0 ? 'Select days to add schedules (optional)' : ''}
      >
        <div className='flex flex-wrap gap-2 mt-2 mb-4'>
          {DAYS_LIST.map(day => {
            const selected = selectedDays.includes(day);
            return (
              <div
                key={day}
                onClick={() => onToggleDay(day)}
                className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selected
                    ? 'bg-[#151515] text-white border-b-4 border-[#00B894]'
                    : 'bg-white hover:bg-gray-200 text-black border-2 border-gray-200 shadow-lg'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </Form.Item>

      {/* ===== Time Selection for Each Selected Day ===== */}
      {selectedDays.length > 0 && (
        <div className='space-y-4 mb-4'>
          {selectedDays.map(day => (
            <div key={day} className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
              <Text strong className='text-base mb-3 block'>{day}</Text>
              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item
                    label='Start Time'
                    name={`startTime_${day}`}
                    rules={[{ required: true, message: 'Please select start time' }]}
                  >
                    <TimePicker
                      style={{ width: '100%' }}
                      use12Hours
                      format='hh:mm A'
                      defaultOpenValue={dayjs('08:00', 'HH:mm')}
                      placeholder='Select start time'
                      onSelect={(time) => {
                        const key = `startTime_${day}`;
                        setPendingTimes(prev => ({ ...prev, [key]: time }));
                        form.setFieldValue(key, time);
                      }}
                      onOpenChange={(open) => {
                        const key = `startTime_${day}`;
                        if (!open && pendingTimes[key]) {
                          form.setFieldValue(key, pendingTimes[key]);
                          setPendingTimes(prev => {
                            const newState = { ...prev };
                            delete newState[key];
                            return newState;
                          });
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    label='End Time'
                    name={`endTime_${day}`}
                    rules={[{ required: true, message: 'Please select end time' }]}
                  >
                    <TimePicker
                      style={{ width: '100%' }}
                      use12Hours
                      format='hh:mm A'
                      defaultOpenValue={dayjs('17:00', 'HH:mm')}
                      placeholder='Select end time'
                      onSelect={(time) => {
                        const key = `endTime_${day}`;
                        setPendingTimes(prev => ({ ...prev, [key]: time }));
                        form.setFieldValue(key, time);
                      }}
                      onOpenChange={(open) => {
                        const key = `endTime_${day}`;
                        if (!open && pendingTimes[key]) {
                          form.setFieldValue(key, pendingTimes[key]);
                          setPendingTimes(prev => {
                            const newState = { ...prev };
                            delete newState[key];
                            return newState;
                          });
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

