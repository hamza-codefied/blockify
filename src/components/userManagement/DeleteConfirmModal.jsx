import { Modal, Button, Typography } from 'antd';
const { Text } = Typography;

export const DeleteConfirmModal = ({ open, onClose, user }) => {
  if (!user) return null;

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered>
      <div className='text-center space-y-3'>
        <Text strong className='text-lg'>
          Are you sure you want to delete{' '}
          <span className='text-[#801818]'>{user.name}</span>?
        </Text>
        <div className='flex justify-center gap-3 mt-4'>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type='primary'
            danger
            style={{ backgroundColor: '#801818', borderColor: '#801818' }}
            onClick={onClose}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
