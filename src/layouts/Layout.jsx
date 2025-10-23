import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@components/layout/Header';
import { Footer } from '@components/layout/Footer';
import { TabComponent } from '@/components/layout/TabComponent';

export const Layout = ({ children }) => {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />

      <TabComponent />

      {/* Page content */}
      <main className='flex-1'>
        <div className='w-full bg-[#fafafa] px-4 sm:px-6 lg:px-16 py-6'>
          {/* If children passed (older usage), render that; otherwise render nested routes via Outlet */}
          {children ? children : <Outlet />}
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
};
