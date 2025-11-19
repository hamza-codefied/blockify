import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input, Button, Typography, Alert, message } from 'antd';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import logo from '@/images/logo.png';

const { Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const suspended = queryParams.get('suspended');
  const [showAlert, setShowAlert] = useState(false);
  const { isAuthenticated } = useAuthStore();
  
  // React Query mutation for login
  const loginMutation = useLogin();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (suspended) {
      setShowAlert(true);
    }
  }, [suspended]);

  // Handle form submission
  const onFinish = async (values) => {
    try {
      await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      
      // Success message
      message.success('Login successful!');
    } catch (error) {
      // Error handling
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'Login failed. Please check your credentials.';
      
      message.error(errorMessage);
    }
  };

  return (
    <>
      <section className='flex items-center justify-center h-screen'>
        <div className='p-8 my-6 bg-white rounded-xl shadow-md w-full max-w-md mx-auto'>
          <div className='w-full flex items-center justify-center mb-8'>
            <img
              src={logo}
              preview={false}
              alt='Logo'
              className='object-contain'
            />
          </div>

          {/* Static form (onFinish commented out) */}
          <Form name='login' onFinish={onFinish} layout='vertical'>
            <Form.Item
              name='email'
              rules={[
                {
                  required: true,
                  message: 'Please input your email!',
                  type: 'email',
                },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder='Email' />
            </Form.Item>
            <Form.Item
              name='password'
              rules={[
                {
                  required: true,
                  message: 'Please input your password!',
                  min: 6,
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder='Password'
              />
            </Form.Item>

            <div className='text-right text-sm mb-2'>
              <Link
                to='/forgot-password'
                className='text-[#00b894] hover:text-[#00b894] focus:text-[#00b894]'
              >
                Forgot Password?
              </Link>
            </div>

            <Form.Item>
              <Button
                type='primary'
                htmlType='submit'
                block
                loading={loginMutation.isPending}
                className='!bg-[#00b894] !border-[#00b894] hover:!bg-[#00a884] hover:!border-[#00a884] focus:!bg-[#00a884] focus:!border-[#00a884]'
              >
                Login
              </Button>
            </Form.Item>
          </Form>

          <div className='text-center text-sm mt-4'>
            Don't have an account?{' '}
            <Link
              className='text-[#00b894] hover:text-[#00b894] focus:text-[#00b894]'
              to='/signup'
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Suspended account alert (still works statically) */}
      {showAlert && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '400px',
            zIndex: 1000,
          }}
        >
          <Alert
            message='Account Suspended'
            description='Your Account got Suspended from the Management Team.'
            type='error'
            showIcon
            closable
            onClose={() => setShowAlert(false)}
          />
        </div>
      )}
    </>
  );
}
