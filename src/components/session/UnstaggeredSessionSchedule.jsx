'use client';
import React, { useState } from 'react';
import { RiDeleteBinLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import '@/components/session/early-session-requests.css';
import { Select, Modal, Input, Form, Button } from 'antd';

const UnstaggeredSessionSchedule = () => {
  const [grade, setGrade] = useState('9th Grade');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [activeDay, setActiveDay] = useState('Monday');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editForm] = Form.useForm();

  const [sessions, setSessions] = useState({
    Monday: [
      { start: '08:00 am', end: '08:50 am', active: false },
      { start: '09:00 am', end: '09:50 am', active: false },
      { start: '10:00 am', end: '10:50 am', active: false },
      { start: '11:00 am', end: '11:50 am', active: false },
      { start: '12:00 pm', end: '12:50 pm', active: false },
      { start: '01:00 pm', end: '01:50 pm', active: false },
    ],
    Tuesday: [
      { start: '08:00 am', end: '08:50 am', active: false },
      { start: '09:00 am', end: '09:50 am', active: false },
      { start: '10:00 am', end: '10:50 am', active: false },
      { start: '11:00 am', end: '11:50 am', active: false },
      { start: '12:00 pm', end: '12:50 pm', active: false },
      { start: '01:00 pm', end: '01:50 pm', active: false },
    ],
    Wednesday: [
      { start: '08:00 am', end: '08:50 am', active: false },
      { start: '09:00 am', end: '09:50 am', active: false },
      { start: '10:00 am', end: '10:50 am', active: false },
      { start: '11:00 am', end: '11:50 am', active: false },
      { start: '12:00 pm', end: '12:50 pm', active: false },
      { start: '01:00 pm', end: '01:50 pm', active: false },
    ],
    Thursday: [
      { start: '08:00 am', end: '08:50 am', active: false },
      { start: '09:00 am', end: '09:50 am', active: false },
      { start: '10:00 am', end: '10:50 am', active: false },
      { start: '11:00 am', end: '11:50 am', active: false },
      { start: '12:00 pm', end: '12:50 pm', active: false },
      { start: '01:00 pm', end: '01:50 pm', active: false },
    ],
    Friday: [
      { start: '08:00 am', end: '08:50 am', active: false },
      { start: '09:00 am', end: '09:50 am', active: false },
      { start: '10:00 am', end: '10:50 am', active: false },
      { start: '11:00 am', end: '11:50 am', active: false },
      { start: '12:00 pm', end: '12:50 pm', active: false },
      { start: '01:00 pm', end: '01:50 pm', active: false },
    ],
  });

  const handleTimeChange = (day, index, field, value) => {
    const updated = { ...sessions };
    updated[day][index][field] = value;
    setSessions(updated);
  };

  const toggleSessionActive = (day, index) => {
    const updated = { ...sessions };
    updated[day][index].active = !updated[day][index].active;
    setSessions(updated);
  };

  const openEditModal = () => {
    editForm.setFieldsValue({
      grade,
      day: activeDay,
      startTime: '08:00 am',
      endTime: '08:50 am',
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className='w-full mx-auto bg-white shadow-md rounded-2xl p-5 sm:p-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-3'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-800'>
          Manage Session Schedules
        </h2>
        <Select
          value={grade}
          onChange={setGrade}
          size='small'
          style={{ width: 140 }}
          options={[
            { value: '8th Grade', label: '8th Grade' },
            { value: '9th Grade', label: '9th Grade' },
            { value: '10th Grade', label: '10th Grade' },
            { value: '11th Grade', label: '11th Grade' },
            { value: '12th Grade', label: '12th Grade' },
          ]}
        />
      </div>

      {/* Action Icons */}
      <div className='flex items-center justify-end gap-4 mb-10'>
        <RiDeleteBinLine
          className='w-5 h-5 cursor-pointer text-[#801818]'
          onClick={() => setIsDeleteModalOpen(true)}
        />
        <TbEdit
          className='w-5 h-5 text-[#00B894] cursor-pointer'
          onClick={openEditModal}
        />
      </div>

      {/* Day Selector */}
      <div className='flex flex-wrap justify-between gap-2 sm:gap-3 mb-[92px] relative'>
        {days.map(day => (
          <div key={day} className='flex flex-col items-center relative'>
            {activeDay === day && (
              <span className='w-1.5 h-1.5 bg-[#00B894] rounded-full absolute -top-2'></span>
            )}
            <button
              onClick={() => setActiveDay(day)}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeDay === day
                  ? 'bg-black text-white border-b-4 border-[#00B894]'
                  : 'bg-white text-black hover:bg-gray-200 border-2 border-gray-200'
              }`}
            >
              {day}
            </button>
          </div>
        ))}
      </div>

      {/* Sessions */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4'>
        {sessions[activeDay]?.map((session, index) => (
          <div key={index} className='flex flex-col items-center'>
            <input
              type='checkbox'
              checked={session.active}
              onChange={() => toggleSessionActive(activeDay, index)}
              className='custom-radio w-4 h-4 mb-2 cursor-pointer'
            />

            <div className='text-gray-700 font-medium mb-2 text-sm sm:text-base'>
              Session {index + 1}
            </div>
            <div className='w-full bg-white p-2 flex flex-col items-center gap-2 text-center'>
              <input
                type='text'
                value={session.start}
                onChange={e =>
                  handleTimeChange(activeDay, index, 'start', e.target.value)
                }
                className='text-xs text-gray-800 font-semibold text-center focus:outline-none border-2 border-gray-200 focus:border-[#00B894] rounded-md py-1 w-full'
              />
              <div className='h-40 w-[2px] border-l-2 border-dotted border-[#00B894]'></div>
              <input
                type='text'
                value={session.end}
                onChange={e =>
                  handleTimeChange(activeDay, index, 'end', e.target.value)
                }
                className='text-xs text-gray-800 font-semibold text-center focus:outline-none border-2 border-gray-200 focus:border-[#00B894] rounded-md py-1 w-full'
              />
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        title='Edit Session Schedule'
        open={isEditModalOpen}
        onOk={() => setIsEditModalOpen(false)}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form
          layout='vertical'
          form={editForm}
          onFinish={() => setIsEditModalOpen(false)}
        >
          <Form.Item label='Grade' name='grade'>
            <Select
              options={[
                { value: '8th Grade', label: '8th Grade' },
                { value: '9th Grade', label: '9th Grade' },
                { value: '10th Grade', label: '10th Grade' },
                { value: '11th Grade', label: '11th Grade' },
                { value: '12th Grade', label: '12th Grade' },
              ]}
            />
          </Form.Item>

          <Form.Item label='Day' name='day'>
            <Select options={days.map(d => ({ value: d, label: d }))} />
          </Form.Item>

          <Form.Item label='Start Time' name='startTime'>
            <Input placeholder='e.g., 08:00 am' />
          </Form.Item>

          <Form.Item label='End Time' name='endTime'>
            <Input placeholder='e.g., 08:50 am' />
          </Form.Item>
          <div className='flex justify-end mt-4'>
            <Button
              type='primary'
              style={{
                backgroundColor: '#00B894',
                borderColor: '#00B894',
              }}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title='Delete Confirmation'
        open={isDeleteModalOpen}
        onOk={() => setIsDeleteModalOpen(false)}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText='Confirm Delete'
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this session schedule?</p>
      </Modal>
    </div>
  );
};

export default UnstaggeredSessionSchedule;
