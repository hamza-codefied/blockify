import React from 'react';
import logo from '@/images/logo.png';

export const Logo = () => {
  return (
    <div className='flex items-center space-x-2'>
      <img src={logo} alt='Logo' className='h-10' />
    </div>
  );
};
