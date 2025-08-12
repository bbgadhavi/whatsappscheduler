import React, { ElementType } from 'react';

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'destructiveOutline';
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'variant'>;

const Button = <T extends ElementType = 'button'>({
  as,
  children,
  variant = 'default',
  className,
  ...props
}: ButtonProps<T>) => {
  const Component = as || 'button';

  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    destructiveOutline: 'border border-destructive/50 bg-transparent hover:bg-destructive/10 text-destructive',
    outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
    success: 'bg-green-600 text-white hover:bg-green-600/90',
  };

  const sizeClasses = "h-11 px-4 py-2";

  return (
    <Component
      className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${className || ''}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
