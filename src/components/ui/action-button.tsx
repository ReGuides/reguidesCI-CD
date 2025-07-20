import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'view' | 'edit' | 'delete' | 'custom';
  size?: 'xs' | 'sm' | 'md';
  icon?: ReactNode;
  customColor?: string;
}

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, variant = 'custom', size = 'md', icon, customColor, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variantClasses = {
      view: 'bg-transparent hover:bg-neutral-700/50 text-blue-400 hover:text-blue-300 focus:ring-blue-500',
      edit: 'bg-transparent hover:bg-purple-700/30 text-purple-400 hover:text-purple-300 focus:ring-purple-500',
      delete: 'bg-transparent hover:bg-red-700/30 text-red-400 hover:text-red-300 focus:ring-red-500',
      custom: customColor || 'bg-transparent hover:bg-neutral-700/50 text-neutral-400 hover:text-white focus:ring-neutral-500'
    };

    const sizeClasses = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-7 h-7 text-xs',
      md: 'w-9 h-9 text-sm'
    };

    const iconSizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-3.5 h-3.5',
      md: 'w-5 h-5'
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
        {icon && (
          <span className={cn('flex-shrink-0', iconSizeClasses[size])}>
            {icon}
          </span>
        )}
        {children}
      </button>
    );
  }
);
ActionButton.displayName = 'ActionButton';

export { ActionButton }; 