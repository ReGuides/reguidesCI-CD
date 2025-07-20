'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Страница не найдена</h2>
          <p className="text-muted-foreground mb-8">
            К сожалению, запрашиваемая страница не существует или была перемещена.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Button>
          </Link>
          <BackButton />
        </div>
      </div>
    </div>
  );
} 