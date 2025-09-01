import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'secondary' | 'link';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'default', 
  size = 'default', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    default: 'bg-purple-600 text-white hover:bg-purple-700',
    outline: 'border border-neutral-600 bg-transparent hover:bg-neutral-700 text-white',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'hover:bg-neutral-700 text-white',
    secondary: 'bg-neutral-700 text-white hover:bg-neutral-600',
    link: 'bg-transparent text-purple-400 hover:text-purple-300 underline-offset-4 hover:underline'
  } as const;
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    default: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10'
  } as const;
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
