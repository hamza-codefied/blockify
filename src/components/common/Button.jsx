'use client';
import React from 'react';

/**
 * Reusable Button Component
 * Supports different variants for consistent styling across the application
 * 
 * @param {string} variant - Button variant: 'primary' | 'secondary' | 'tertiary'
 * @param {React.ReactNode} children - Button text content
 * @param {React.ReactNode} icon - Optional icon to display (will be placed on right with space-between)
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles (only for fontFamily which can't be done with Tailwind)
 * @param {function} onClick - Click handler
 * @param {boolean} disabled - Disabled state
 * @param {string} type - Button type (button, submit, etc.)
 */
export const Button = ({ 
  variant = 'primary',
  children, 
  icon,
  className = '', 
  style = {},
  onClick,
  disabled = false,
  type = 'button',
  ...props 
}) => {
  // Variant classes based on Figma specifications
  const variantClasses = {
    primary: 'flex items-center bg-white border border-[#E0E0E0] rounded-[8.036px] min-w-[188px] h-[60px] px-[16.072px] py-[8.036px] text-[#121217] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700',
    secondary: 'flex items-center bg-gray-100 border border-gray-300 rounded-[8.036px] min-w-[188px] h-[60px] px-[16.072px] py-[8.036px] text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600',
    tertiary: 'flex items-center bg-transparent border border-gray-300 rounded-[8.036px] min-w-[188px] h-[60px] px-[16.072px] py-[8.036px] text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
  };

  const baseClasses = variantClasses[variant] || variantClasses.primary;
  const combinedClassName = `${baseClasses} ${icon ? 'justify-between' : 'justify-center'} ${className}`.trim();
  // Only keep fontFamily and fontSize in style since they match Figma specs exactly
  const combinedStyle = { 
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '24.107px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '18.081px',
    ...style 
  };

  return (
    <button
      type={type}
      className={combinedClassName}
      style={combinedStyle}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon ? (
        <>
          <span className="flex-1 text-center">{children}</span>
          <span className="flex-shrink-0">{icon}</span>
        </>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
};

