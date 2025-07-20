import { cn } from "@/lib/utils";
import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

interface AddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const AddButton = forwardRef<HTMLButtonElement, AddButtonProps>(
  ({ className, variant = 'primary', size = 'lg', icon, iconPosition = 'left', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-lg';
    
    const variantClasses = {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500 shadow-purple-600/25',
      secondary: 'bg-neutral-700 hover:bg-neutral-600 text-white focus:ring-neutral-500 shadow-neutral-700/25',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-green-600/25',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 shadow-yellow-600/25'
    };

    const sizeClasses = {
      sm: 'h-10 px-4 text-sm gap-2',
      md: 'h-12 px-6 text-base gap-2',
      lg: 'h-14 px-6 md:px-8 text-base md:text-lg gap-2 md:gap-3',
      xl: 'h-16 px-8 md:px-10 text-lg md:text-xl gap-3'
    };

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7'
    };

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {icon && iconPosition === 'left' && React.cloneElement(icon as React.ReactElement, {
          className: cn('flex-shrink-0', iconSizeClasses[size])
        })}
        <span className="whitespace-nowrap">{children}</span>
        {icon && iconPosition === 'right' && React.cloneElement(icon as React.ReactElement, {
          className: cn('flex-shrink-0', iconSizeClasses[size])
        })}
      </button>
    );
  }
);
AddButton.displayName = 'AddButton';

export { AddButton }; 