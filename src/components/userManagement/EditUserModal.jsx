import { Modal, Input, Form, Button } from 'antd';

export const EditUserModal = ({ open, onClose, user }) => {
  if (!user) return null;

  return (
    <Modal
      title={`Edit ${user.name}`}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form layout='vertical'>
        <Form.Item label='Name'>
          <Input defaultValue={user.name} />
        </Form.Item>
        <Form.Item label='Email'>
          <Input defaultValue={user.email} />
        </Form.Item>
        <Form.Item label='Contact'>
          <Input defaultValue={user.contact} />
        </Form.Item>

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
      </Form>
    </Modal>
  );
};
