/* Contexts, hooks, stores, libraries and utils */
import { useState } from 'react';
// import { useThrow } from '@hooks/useThrow'
// import { useAuthStore } from '@stores/useAuthStore'
import { Link, useNavigate } from 'react-router-dom';
// import { useMessage } from '@context/MessageProvider'
import { Form, Input, Button, Typography, Image, Divider } from 'antd';
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  DeploymentUnitOutlined,
} from '@ant-design/icons';
import logo from '@/images/logo.png';

const { Text } = Typography;

const SignUp = () => {
  // const { register } = useAuthStore()
  // const { showMessage } = useMessage()
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async values => {
    // const formData = {
    //     role: ENV.USER_ROLE_4,
    //     name: values.name,
    //     email: values.email,
    //     phone: values.phone,
    //     password: values.password,
    //     confirmPassword: values.confirmPassword
    // }
    setLoading(true);
    try {
      // const res = await register(formData);
      // if (res?.routeToLogin) {
      //     return navigate('/login')
      // }
      // navigate('/overview')
      console.log('Form submitted:', values);
      alert('Signup form submitted successfully (static mode)');
    } catch (err) {
      // showMessage('error', err.response?.data?.error || err.message || err || 'Signup failed', 5);
      console.error('Signup failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // useThrow({ navigate })

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
        <Form name='signup' onFinish={onFinish} layout='vertical'>
          <Form.Item
            name='name'
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder='Name' />
          </Form.Item>
          <Form.Item
            name='email'
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder='Email' />
          </Form.Item>
          <Form.Item
            name='phone'
            rules={[
              { required: true, message: 'Please input your phone number!' },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder='Phone Number' />
          </Form.Item>
          <Form.Item
            name='password'
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder='Password' />
          </Form.Item>
          <Form.Item
            name='confirmPassword'
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder='Confirm Password'
            />
          </Form.Item>
          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              block
              loading={loading}
              className='!bg-[#00b894] !border-[#00b894] hover:!bg-[#00a884] hover:!border-[#00a884] focus:!bg-[#00a884] focus:!border-[#00a884]'
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>
        <div className='text-center text-sm mt-4'>
          Already have an account?{' '}
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

export default SignUp;
