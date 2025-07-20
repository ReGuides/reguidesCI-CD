import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import LoadingSpinner from '@/components/ui/loading-spinner';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, iconPosition = 'left', loading = false, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variantClasses = {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500 shadow-lg shadow-purple-600/25',
      secondary: 'bg-neutral-700 hover:bg-neutral-600 text-white focus:ring-neutral-500',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-lg shadow-green-600/25',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 shadow-lg shadow-yellow-600/25',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg shadow-red-600/25',
      ghost: 'bg-transparent hover:bg-neutral-700/50 text-neutral-300 hover:text-white focus:ring-neutral-500'
    };

    const sizeClasses = {
      xs: 'h-6 px-2 text-xs gap-1',
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2'
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
          loading && 'opacity-75 cursor-not-allowed',
          className
        )}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <LoadingSpinner size={size === 'xs' ? 'sm' : size === 'sm' ? 'md' : 'lg'} className="text-current" />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className={cn('flex-shrink-0', iconSizeClasses[size])}>
            {icon}
          </span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className={cn('flex-shrink-0', iconSizeClasses[size])}>
            {icon}
          </span>
        )}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

export { IconButton }; 