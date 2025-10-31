import React from 'react';
import { Modal, Form, Input, Select, TimePicker, Button } from 'antd';

const { Option } = Select;

export const EditSessionModal = ({ open, onClose, session }) => {
  const [form] = Form.useForm();

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered>
      <h1 className='text-center font-semibold text-lg text-black dark:text-white mb-4'>
        Edit Session
      </h1>
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          sessionName: session?.day,
          grade: '9th Grade',
        }}
      >
        {/* Session Name */}
        <Form.Item
          label='Session Name'
          name='sessionName'
          rules={[{ required: true, message: 'Please enter session name' }]}
        >
          <Input placeholder='Enter session name' />
        </Form.Item>

        {/* Grade Dropdown */}
        <Form.Item
          label='Grade'
          name='grade'
          rules={[{ required: true, message: 'Please select grade' }]}
        >
          <Select placeholder='Select Grade'>
            <Option value='9th Grade'>9th Grade</Option>
            <Option value='10th Grade'>10th Grade</Option>
            <Option value='11th Grade'>11th Grade</Option>
          </Select>
        </Form.Item>

        {/* Time Range */}
        <div className='flex gap-2'>
          <Form.Item
            label='Start Time'
            name='startTime'
            className='flex-1'
            rules={[{ required: true }]}
          >
            <TimePicker use12Hours format='hh:mm a' className='w-full' />
          </Form.Item>
          <Form.Item
            label='End Time'
            name='endTime'
            className='flex-1'
            rules={[{ required: true }]}
          >
            <TimePicker use12Hours format='hh:mm a' className='w-full' />
          </Form.Item>
        </div>

        {/* Save Button */}
        <Form.Item className='mt-4 text-center'>
          <Button
            type='text'
            onClick={onClose}
            style={{
              backgroundColor: '#00B894',
              color: '#fff',
            }}
            className='font-semibold px-20 py-2 rounded-md transition hover:!bg-[#019a7d]'
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
