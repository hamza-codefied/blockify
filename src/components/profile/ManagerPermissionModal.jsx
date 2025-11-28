'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Checkbox, Button, Row, Col, Spin, Alert, Typography } from 'antd';
import { useGetRolePermissions, useUpdateRolePermissions } from '@/hooks/useRoles';
import './permission-management.css';

const { Text } = Typography;

export const ManagerPermissionModal = ({ open, onClose, role, readOnly = false }) => {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());

  const { 
    data: permissionsData, 
    isLoading, 
    error 
  } = useGetRolePermissions(role?.id, open && !!role?.id);

  const updatePermissionsMutation = useUpdateRolePermissions();

  const permissions = permissionsData?.data?.permissions || [];
  const roleInfo = permissionsData?.data?.role;

  // Group permissions by resource
  const permissionsByResource = useMemo(() => {
    const grouped = {};
    permissions.forEach(perm => {
      const resource = perm.resource || 'Other';
      if (!grouped[resource]) {
        grouped[resource] = [];
      }
      grouped[resource].push(perm);
    });
    return grouped;
  }, [permissions]);

  // Initialize selected permissions when data loads
  useEffect(() => {
    if (permissions.length > 0) {
      const assignedIds = new Set(
        permissions
          .filter(p => p.isAssigned)
          .map(p => p.id)
      );
      setSelectedPermissionIds(assignedIds);
    }
  }, [permissions]);

  const handlePermissionCheck = (permissionId, checked) => {
    const newSelected = new Set(selectedPermissionIds);
    if (checked) {
      newSelected.add(permissionId);
    } else {
      newSelected.delete(permissionId);
    }
    setSelectedPermissionIds(newSelected);
  };

  const handleSave = async () => {
    if (!role?.id) return;
    
    try {
      await updatePermissionsMutation.mutateAsync({
        roleId: role.id,
        permissionIds: Array.from(selectedPermissionIds),
      });
      onClose();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const formatResourceName = (resource) => {
    return resource
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const modalTitle = readOnly 
    ? `Preview: ${role?.displayName || role?.roleName || 'Role'} Permissions`
    : `${role?.displayName || role?.roleName || 'Role'} Permissions`;

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={700}
      className='dark-mode-modal'
    >
      {isLoading ? (
        <div className='flex justify-center items-center py-8'>
          <Spin size='large' />
        </div>
      ) : error ? (
        <Alert
          message='Error'
          description={error?.response?.data?.message || 'Failed to load permissions'}
          type='error'
          showIcon
        />
      ) : permissions.length === 0 ? (
        <Alert
          message='No Permissions'
          description='No permissions available for this role.'
          type='info'
          showIcon
        />
      ) : (
        <>
          <div className='flex flex-col gap-4 max-h-[70vh] overflow-y-auto px-2'>
            {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => (
              <div
                key={resource}
                className='border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 permission-management-card'
              >
                <div className='flex items-center justify-start gap-3 mb-3'>
                  <h3 className='font-semibold text-gray-700 dark:text-gray-200'>
                    {formatResourceName(resource)}
                  </h3>
                </div>

                <Row gutter={[16, 8]}>
                  {resourcePermissions.map(perm => (
                    <Col xs={24} sm={12} key={perm.id}>
                      <Checkbox
                        checked={selectedPermissionIds.has(perm.id)}
                        onChange={e => handlePermissionCheck(perm.id, e.target.checked)}
                        disabled={readOnly}
                        className='custom-checkbox text-xs'
                      >
                        <span className='text-gray-700 dark:text-gray-300'>
                          {perm.displayName || perm.permissionName}
                        </span>
                      </Checkbox>
                      {perm.description && (
                        <div className='ml-6 mt-1'>
                          <Text type='secondary' className='text-xs'>
                            {perm.description}
                          </Text>
                        </div>
                      )}
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </div>

          {!readOnly && (
            <div className='flex justify-center mt-6'>
              <Button
                type='primary'
                className='bg-[#00B894] hover:!bg-[#019a7d] text-white font-semibold px-10 py-2 rounded-md transition'
                onClick={handleSave}
                loading={updatePermissionsMutation.isPending}
              >
                Save
              </Button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};
