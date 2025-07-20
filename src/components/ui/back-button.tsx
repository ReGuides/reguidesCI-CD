'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function BackButton({ variant = 'outline', size = 'default', className }: BackButtonProps) {
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={() => window.history.back()}
      className={className}
    >
      <ArrowLeft className="w-4 h-4 text-neutral-400 mr-2" />
      Назад
    </Button>
  );
} 