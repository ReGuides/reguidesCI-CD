import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, iconPosition = 'left', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variantClasses = {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500',
      secondary: 'bg-neutral-700 hover:bg-neutral-600 text-white focus:ring-neutral-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      ghost: 'bg-transparent hover:bg-neutral-700/50 text-neutral-300 hover:text-white focus:ring-neutral-500'
    };

    const sizeClasses = {
      xs: 'h-6 px-2 text-xs',
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base'
    };

    const iconSizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
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
        {icon && iconPosition === 'left' && (
          <span className={cn('flex-shrink-0', iconSizeClasses[size], children && 'mr-2')}>
            {icon}
          </span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className={cn('flex-shrink-0', iconSizeClasses[size], children && 'ml-2')}>
            {icon}
          </span>
        )}
      </button>
    );
  }
);
AdminButton.displayName = 'AdminButton';

export { AdminButton }; 