import { forwardRef } from 'react'

const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
}

const buttonSizes = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
}

export const Button = forwardRef(({ 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}, ref) => {
  const baseClasses = 'btn'
  const variantClasses = buttonVariants[variant] || buttonVariants.primary
  const sizeClasses = buttonSizes[size] || buttonSizes.md
  
  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'
