import { cn } from "@/lib/utils";
import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

interface ArticleActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'view' | 'edit' | 'delete' | 'feature' | 'publish';
  size?: 'xs' | 'sm' | 'md';
  icon?: ReactNode;
  customColor?: string;
}

const ArticleActionButton = forwardRef<HTMLButtonElement, ArticleActionButtonProps>(
  ({ className, variant = 'view', size = 'sm', icon, customColor, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variantClasses = {
      view: 'bg-transparent hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 focus:ring-blue-500 border border-blue-500/20 hover:border-blue-500/40',
      edit: 'bg-transparent hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300 focus:ring-yellow-500 border border-yellow-500/20 hover:border-yellow-500/40',
      delete: 'bg-transparent hover:bg-red-500/10 text-red-400 hover:text-red-300 focus:ring-red-500 border border-red-500/20 hover:border-red-500/40',
      feature: 'bg-transparent hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 focus:ring-purple-500 border border-purple-500/20 hover:border-purple-500/40',
      publish: 'bg-transparent hover:bg-green-500/10 text-green-400 hover:text-green-300 focus:ring-green-500 border border-green-500/20 hover:border-green-500/40',
      custom: customColor || 'bg-transparent hover:bg-neutral-700/50 text-neutral-400 hover:text-white focus:ring-neutral-500'
    };

    const sizeClasses = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-7 h-7 text-xs',
      md: 'w-8 h-8 text-sm'
    };

    const iconSizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4'
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
        {icon && React.cloneElement(icon as React.ReactElement, {
          className: cn('flex-shrink-0', iconSizeClasses[size])
        })}
        {children}
      </button>
    );
  }
);
ArticleActionButton.displayName = 'ArticleActionButton';

export { ArticleActionButton }; 