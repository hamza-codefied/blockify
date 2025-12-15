'use client';
import React from 'react';
import { Typography } from 'antd';

const { Title: AntTitle } = Typography;

/**
 * Reusable Page Title Component
 * Supports different variants for consistent styling across the application
 * 
 * @param {string} variant - Title variant: 'primary' | 'secondary' | 'tertiary'
 * @param {React.ReactNode} children - Title text content
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles (only for fontFamily which can't be done with Tailwind)
 */
export const PageTitle = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  style = {},
  ...props 
}) => {
  // Variant classes based on Figma specifications
  const variantClasses = {
    primary: 'text-[#2F2F2F] text-[30px] font-bold leading-[150%] dark:text-gray-200',
    secondary: 'text-[#2F2F2F] text-[24px] font-semibold leading-[150%] dark:text-gray-200',
    tertiary: 'text-[#2F2F2F] text-[20px] font-semibold leading-[150%] dark:text-gray-200',
  };

  const baseClasses = variantClasses[variant];
  const combinedClassName = `${baseClasses} ${className}`.trim();
  // Only keep fontFamily in style since it can't be done with Tailwind
  const combinedStyle = { fontFamily: 'Helvetica, Arial, sans-serif', ...style };

  return (
    <AntTitle
      level={variant === 'primary' ? 3 : variant === 'secondary' ? 4 : 5}
      className={combinedClassName}
      style={combinedStyle}
      {...props}
    >
      {children}
    </AntTitle>
  );
};

