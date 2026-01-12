'use client';
import React from 'react';

/**
 * Simple Typography Component using Tailwind CSS
 * 
 * @param {string} variant - Typography variant: 'primary' | 'secondary' | 'tertiary'
 * @param {React.ReactNode} children - Text content
 * @param {string} className - Additional CSS classes
 */
export const Typography = ({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}) => {
  // Variant classes based on Figma specifications
  const variantClasses = {
    primary: 'text-[#2F2F2F] text-[24px] font-bold leading-[150%] dark:text-gray-200',
    secondary: 'text-[#2F2F2F] text-[20px] font-semibold leading-[150%] dark:text-gray-200',
    tertiary: 'text-[#2F2F2F] text-[18px] font-semibold leading-[150%] dark:text-gray-200',
  };

  const baseClasses = variantClasses[variant];
  const combinedClassName = `${baseClasses} ${className}`.trim();

  // Use appropriate heading level based on variant
  const HeadingTag = variant === 'primary' ? 'h1' : variant === 'secondary' ? 'h2' : 'h3';

  return (
    <HeadingTag
      className={combinedClassName}
      style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      {...props}
    >
      {children}
    </HeadingTag>
  );
};
