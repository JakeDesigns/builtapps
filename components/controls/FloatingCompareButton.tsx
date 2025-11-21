'use client';

import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

interface FloatingCompareButtonProps {
  count: number;
  onClick: () => void;
}

export function FloatingCompareButton({ count, onClick }: FloatingCompareButtonProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] md:hidden">
      <Button
        onClick={onClick}
        size="lg"
        className="shadow-lg h-14 px-6 rounded-full"
      >
        <Home className="mr-2 h-5 w-5" />
        Compare ({count})
      </Button>
    </div>
  );
}

