'use client';
import React from 'react';
import { Modal, Input, Select, Row, Col, Typography, Button } from 'antd';

const { Option } = Select;
const { Title } = Typography;

export default function EditStudentModal({ open, onClose, student }) {
  if (!student) return null;

  return (
    <Modal
      title={<Title level={5}>Edit Student Information</Title>}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      style={{ top: 0 }}
      bodyStyle={{
        maxHeight: '70vh',
        overflowY: 'auto',
        paddingRight: '12px',
        marginTop: 0,
      }}
    >
      <Row gutter={[12, 12]}>
        <Col span={24}>
          <label className='block mb-1 font-medium'>Full Name</label>
          <Input defaultValue={student.name} />
        </Col>

        <Col span={24}>
          <label className='block mb-1 font-medium'>Email</label>
          <Input defaultValue={student.email} />
        </Col>

        <Col span={24}>
          <label className='block mb-1 font-medium'>Contact</label>
          <Input defaultValue={student.contact} />
        </Col>

        <Col span={24}>
          <label className='block mb-1 font-medium'>Grade</label>
          <Select defaultValue={student.grade} style={{ width: '100%' }}>
            <Option value='8th Grade'>8th Grade</Option>
            <Option value='9th Grade'>9th Grade</Option>
            <Option value='10th Grade'>10th Grade</Option>
            <Option value='11th Grade'>11th Grade</Option>
            <Option value='12th Grade'>12th Grade</Option>
          </Select>
        </Col>

        <Col span={24}>
          <label className='block mb-1 font-medium'>Attendance</label>
          <Select defaultValue={student.attendance} style={{ width: '100%' }}>
            <Option value='Signed In'>Signed In</Option>
            <Option value='Not Signed In'>Not Signed In</Option>
          </Select>
        </Col>

        <Col span={24}>
          <label className='block mb-1 font-medium'>Time</label>
          <Input defaultValue={student.time} />
        </Col>

        <Col span={24}>
          <label className='block mb-1 font-medium'>Session</label>
          <Select defaultValue={student.session} style={{ width: '100%' }}>
            <Option value='In Session'>In Session</Option>
            <Option value='Not In Session'>Not In Session</Option>
          </Select>
        </Col>
      </Row>
      <div className='flex justify-end mt-4'>
        <Button
          type='primary'
          style={{
            backgroundColor: '#00B894',
            borderColor: '#00B894',
          }}
          onClick={onClose}
        >
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}
