/* Contexts, hooks, stores, libraries and utils */
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className='flex items-center justify-center h-screen'>
      <Result
        className=''
        status='404'
        title='Page Not Found'
        subTitle='Sorry, the page you visited does not exist.'
        extra={
          <Button
            type='primary'
            className='bg-[#00b894]'
            onClick={() => navigate('/dashboard')}
          >
            Back Home
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
