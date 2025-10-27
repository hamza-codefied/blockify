'use client';
import React from 'react';
import { Modal, Typography } from 'antd';

const { Text } = Typography;

export default function DeleteStudentModal({ open, onClose, student }) {
  if (!student) return null;

  return (
    <Modal
      title='Delete Student'
      open={open}
      onCancel={onClose}
      onOk={onClose}
      okText='Yes, Delete'
      okButtonProps={{ danger: true }}
      centered
    >
      <Text>
        Are you sure you want to delete <strong>{student.name}</strong> from the
        list?
      </Text>
    </Modal>
  );
}
