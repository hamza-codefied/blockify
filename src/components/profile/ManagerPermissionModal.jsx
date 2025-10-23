'use client';
import React from 'react';
import { Modal, Checkbox, Button, Row, Col } from 'antd';
import './permission-management.css';

export const ManagerPermissionModal = ({ open, onClose }) => {
  const permissionSections = [
    {
      title: 'Management',
      permissions: [
        'View Dashboard Section',
        'View Attendance Section',
        'View Sessions Section',
        'View User Management Section',
        'View Profile Permissions Section',
      ],
    },
    {
      title: 'Attendance',
      permissions: [
        'Manually Change Student Attendance Status',
        'Manually Change Student Time of Arrival',
      ],
    },
    {
      title: 'Sessions',
      permissions: [
        'Manually Start/End Sessions',
        'Accept/Deny Student Early Session End Requests',
        'Accept/Deny Student Schedule Change Requests',
        'Add Sessions',
        'Edit Sessions',
        'Delete Sessions',
      ],
    },
    {
      title: 'Data',
      permissions: [
        'Manually Add Student and Admin Personal Data',
        'Import CSV Student and Admin Personal Data',
        'Edit/Delete Student and Admin Personal Data',
      ],
    },
    {
      title: 'Profile',
      permissions: [
        'Edit Profile',
        'Edit Student Permissions',
        'Edit Admin Permissions',
      ],
    },
    {
      title: 'Grade',
      permissions: [],
    },
  ];

  return (
    <Modal
      title='Manager Permissions'
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={700}
    >
      <div className='flex flex-col gap-4 max-h-[70vh] overflow-y-auto'>
        {permissionSections.map((section, idx) => (
          <div
            key={idx}
            className='border border-gray-200 rounded-xl p-4 bg-white'
          >
            <h3 className='font-semibold text-gray-700 mb-3'>
              {section.title}
            </h3>
            <Row gutter={[16, 8]}>
              {section.permissions.map((perm, i) => (
                <Col xs={24} sm={12} key={i}>
                  <Checkbox defaultChecked className='custom-checkbox text-xs'>
                    {perm}
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </div>

      <div className='flex justify-center mt-6'>
        <Button
          type='primary'
          className='bg-[#00B894] hover:bg-[#019a7d] text-white font-semibold px-10 py-2 rounded-md transition'
          onClick={onClose}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
};
