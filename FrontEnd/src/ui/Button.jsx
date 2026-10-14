import React from 'react';
import './Button.css'; // We'll define styles in this CSS file

const Button = React.forwardRef(
  ({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
    const variantClass = {
      default: 'btn-default',
      destructive: 'btn-destructive',
      outline: 'btn-outline',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      link: 'btn-link',
    }[variant];

    const sizeClass = {
      default: 'btn-size-default',
      sm: 'btn-size-sm',
      lg: 'btn-size-lg',
      icon: 'btn-size-icon',
    }[size];

    return (
      <button
        className={`btn-base ${variantClass} ${sizeClass} ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };