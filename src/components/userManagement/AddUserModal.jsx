'use client';
import React from 'react';
import { Modal, Form, Input, Select } from 'antd';

const { Option } = Select;

export const AddUserModal = ({ open, onClose, activeTab }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={`Add ${activeTab === 'students' ? 'Student' : 'Manager'}`}
      open={open}
      onCancel={onClose}
      onOk={() => {
        form.validateFields().then(values => {
          console.log('Form values:', values);
          onClose();
        });
      }}
      okText='Save'
      cancelText='Cancel'
      centered
      style={{ top: 0 }}
      bodyStyle={{
        maxHeight: '70vh', // ✅ limit modal body height
        overflowY: 'auto', // ✅ enable inner scroll
        paddingRight: '12px',
      }}
      okButtonProps={{
        style: {
          backgroundColor: '#00B894', // ✅ custom green background
          borderColor: '#00B894',
        },
        className: 'hover:!bg-[#00b894] hover:!border-[#00b894]', // ✅ hover consistency
      }}
      cancelButtonProps={{
        style: {
          // ✅ custom green background
          borderColor: '#00B894',
        },
        className: 'hover:!text-[#00b894] hover:!border-[#00b894]', // ✅ hover consistency
      }}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          role: activeTab === 'managers' ? 'Manager' : 'Student',
        }}
      >
        <Form.Item label='Full Name' name='name'>
          <Input placeholder='Enter full name' />
        </Form.Item>

        <Form.Item label='Email' name='email'>
          <Input placeholder='Enter email' />
        </Form.Item>

        <Form.Item label='Phone Number' name='contact'>
          <Input placeholder='Enter phone number' />
        </Form.Item>

        {activeTab === 'students' ? (
          <>
            <Form.Item label='Grade' name='grade'>
              <Select placeholder='Select grade'>
                <Option value='9th'>9th Grade</Option>
                <Option value='10th'>10th Grade</Option>
                <Option value='11th'>11th Grade</Option>
              </Select>
            </Form.Item>

            <Form.Item label='Guardian Name' name='guardian'>
              <Input placeholder='Enter guardian name' />
            </Form.Item>

            <Form.Item label='Guardian Contact' name='guardianContact'>
              <Input placeholder='Enter guardian contact' />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item label='Department' name='department'>
              <Input placeholder='Enter department' />
            </Form.Item>

            <Form.Item label='Role' name='role'>
              <Select placeholder='Select role'>
                <Option value='Manager'>Manager</Option>
                <Option value='Supervisor'>Supervisor</Option>
                <Option value='Coordinator'>Coordinator</Option>
              </Select>
            </Form.Item>
          </>
        )}

        <Form.Item label='Address' name='address'>
          <Input.TextArea placeholder='Enter address' rows={2} />
        </Form.Item>

        <Form.Item label='Zip Code' name='zip'>
          <Input placeholder='Enter zip code' />
        </Form.Item>
      </Form>
    </Modal>
  );
};
