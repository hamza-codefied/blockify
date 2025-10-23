/* Contexts, hooks, stores, libraries and utils */
import { useState } from 'react';
// import API from '@services/api.service';
// import { useThrow } from '@hooks/useThrow';
import { UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, Image, message } from 'antd';
import logo from '@/images/logo.png';

const { Text } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async values => {
    setLoading(true);
    try {
      // const res = await API.post('/auth/password-change-request', values);
      // message.success(res.data?.message || 'OTP sent successfully', 6);
      // navigate('/otp', {
      //   state: {
      //     reset_password_request: true,
      //     reset_password_request_type: 'otp',
      //     email: values.email,
      //   },
      //   search: `?reset_password_request=true&reset_password_request_type=otp&email=${values.email}`,
      // });

      // Temporary success message for UI testing
      message.success('OTP sent successfully (mock)', 4);
    } catch (err) {
      // console.log(err);
      // message.error(
      //   err?.response?.data?.error || err.message || err || 'Email not found',
      //   6
      // );

      message.error('Email not found (mock)', 4);
    } finally {
      setLoading(false);
    }
  };

  // useThrow({ navigate });

  return (
    <section className='flex items-center justify-center h-screen'>
      <div className='p-8 my-6 bg-white rounded-xl shadow-md w-full max-w-md relative'>
        <div className='w-full flex items-center justify-center mb-8'>
          <img
            src={logo}
            preview={false}
            alt='Logo'
            className='object-contain'
          />
        </div>
        <Form name='forgot' onFinish={handleSubmit} layout='vertical'>
          <Form.Item
            name='email'
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder='Email' />
          </Form.Item>
          <Form.Item>
            <Button
              className='!bg-[#00b894] !border-[#00b894] hover:!bg-[#00a884] hover:!border-[#00a884] focus:!bg-[#00a884] focus:!border-[#00a884]'
              type='primary'
              htmlType='submit'
              block
              loading={loading}
            >
              Send OTP
            </Button>
          </Form.Item>
        </Form>
        <div className='text-center text-sm mt-4'>
          Back to{' '}
          <Link
            className='text-[#00b894] hover:text-[#00b894] focus:text-[#00b894]'
            to='/'
          >
            Login
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
