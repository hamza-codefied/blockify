'use client';
import React from 'react';
import { Modal, Form, Input, Button } from 'antd';

export const GradeModal = ({ open, onClose, mode, gradeData }) => {
  const [form] = Form.useForm();

  // When opening modal, pre-fill form if in edit mode
  React.useEffect(() => {
    if (mode === 'edit' && gradeData) {
      form.setFieldsValue({
        grade: gradeData.grade,
        students: gradeData.students,
      });
    } else {
      form.resetFields();
    }
  }, [mode, gradeData, form]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log(`${mode === 'edit' ? 'Editing' : 'Adding'} grade:`, values);
      onClose(); // Close modal for now (no API yet)
    });
  };

  return (
    <Modal
      title={mode === 'edit' ? 'Edit Grade' : 'Add Grade'}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Form form={form} layout='vertical'>
        {/* ===== Grade Name ===== */}
        <Form.Item
          label='Grade'
          name='grade'
          rules={[{ required: true, message: 'Please enter grade name' }]}
        >
          <Input placeholder='Enter grade name' />
        </Form.Item>

        {/* ===== Number of Students ===== */}
        <Form.Item
          label='Number of Students'
          name='students'
          rules={[
            { required: true, message: 'Please enter number of students' },
            {
              validator: (_, value) => {
                if (value === undefined || value === '')
                  return Promise.resolve();
                if (Number(value) <= 0)
                  return Promise.reject(
                    new Error('Number of students must be greater than 0')
                  );
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            type='number'
            placeholder='Enter number of students'
            min={1} // ✅ prevents negative numbers using HTML input control
            onWheel={e => e.target.blur()} // optional: disables scroll changing value
          />
        </Form.Item>

        {/* ===== Submit Button ===== */}
        <Form.Item className='text-center mt-4'>
          <Button
            type='primary'
            onClick={handleSubmit}
            className='bg-[#00B894] hover:bg-[#019a7d] border-none px-10 py-2 rounded-[4px]'
          >
            {mode === 'edit' ? 'Update' : 'Add'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
