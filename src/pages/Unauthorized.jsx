/* Contexts, hooks, stores, libraries and utils */
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Result
      status='403'
      title='Unauthorized'
      subTitle='Sorry, you are not authorized to access this page.'
      extra={
        <Button type='primary' onClick={() => navigate('/')}>
          Back to Home
        </Button>
      }
    />
  );
};

export default Unauthorized;
