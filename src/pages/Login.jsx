import { useState, useEffect } from 'react';
// import { useThrow } from '@hooks/useThrow'
// import { useAuthStore } from '@stores/useAuthStore'
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useMessage } from '@context/MessageProvider'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input, Button, Typography, Image, Divider, Alert } from 'antd';
import logo from '@/images/logo.png';

const { Text } = Typography;

export default function Login() {
  // const { login } = useAuthStore();
  // const { showMessage } = useMessage();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const suspended = queryParams.get('suspended');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (suspended) {
      setShowAlert(true);
      // setTimeout(() => {
      //     setShowAlert(false);
      //     navigate('/login');
      // }, 12000);
    }
  }, [suspended]);

  // ✅ Temporary static onFinish handler
  const onFinish = values => {
    console.log('Logging in with:', values);
    setLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard'); // 👈 Redirect to Dashboard
    }, 1000);
  };

  // const onFinish = async (values) => {
  //     try {
  //         const res = await login(values.email, values.password);
  //         // console.log("Login response:", res); // <-- debug

  //         showMessage('success', res.data.message || 'Login successful', 4);
  //         navigate('/overview');
  //     } catch (err) {
  //         showMessage('error', err.response?.data?.error || err.message || err || 'Login failed', 8);
  //     }
  // };

  // useThrow({ navigate });

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
                loading={loading}
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
