import React, { ElementType } from 'react';

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'variant'>;

const Button = <T extends ElementType = 'button'>({
  as,
  children,
  variant = 'primary',
  className,
  ...props
}: ButtonProps<T>) => {
  const Component = as || 'button';

  const baseClasses = "flex items-center justify-center px-4 py-2.5 text-sm font-medium tracking-wider uppercase transition-all duration-200 transform rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-surface-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-95";
  
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark focus:ring-primary text-on-primary shadow-md hover:shadow-lg',
    secondary: 'bg-transparent hover:bg-primary/10 border border-border dark:border-border-dark focus:ring-primary text-primary dark:text-on-surface dark:hover:bg-white/10 dark:border-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white shadow-md',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white shadow-md',
  };

  return (
    <Component
      className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
