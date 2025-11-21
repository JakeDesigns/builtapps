'use client';

import { Category, CATEGORY_COLORS } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MarkerPinProps {
  category: Category;
  size?: number;
}

export function MarkerPin({ category, size = 18 }: MarkerPinProps) {
  const color = CATEGORY_COLORS[category];
  const isSplit = category === 'pending_under_construction';

  if (isSplit) {
    return (
      <div
        className="rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(90deg, #EF4444 50%, #3B82F6 50%)',
        }}
      />
    );
  }

  return (
    <div
      className="rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    />
  );
}

