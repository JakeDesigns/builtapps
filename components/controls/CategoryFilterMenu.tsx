'use client';

import { Category, CATEGORY_LABELS, CATEGORY_COLORS, Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';

interface CategoryFilterMenuProps {
  visibleCategories: Set<Category>;
  onToggleCategory: (category: Category) => void;
  properties?: Property[];
}

const ALL_CATEGORIES: Category[] = [
  'vacant_lot',
  'planned_construction',
  'under_construction',
  'for_sale_completed',
  'pending',
  'pending_under_construction',
  'sold',
  'competitors',
];

export function CategoryFilterMenu({ visibleCategories, onToggleCategory, properties = [] }: CategoryFilterMenuProps) {
  // Calculate property counts per category
  const categoryCounts = ALL_CATEGORIES.reduce((acc, category) => {
    acc[category] = properties.filter(p => p.category === category).length;
    return acc;
  }, {} as Record<Category, number>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Property Categories</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ALL_CATEGORIES.map((category) => {
          const isSplit = category === 'pending_under_construction';
          const count = categoryCounts[category];
          return (
            <DropdownMenuItem
              key={category}
              onSelect={(e) => e.preventDefault()}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={visibleCategories.has(category)}
                onCheckedChange={() => onToggleCategory(category)}
              />
              <div
                className="h-3.5 w-3.5 rounded-full flex-shrink-0 border border-gray-300"
                style={
                  isSplit
                    ? {
                        background: 'linear-gradient(90deg, #EF4444 50%, #3B82F6 50%)',
                        minWidth: '14px',
                        minHeight: '14px',
                      }
                    : {
                        backgroundColor: CATEGORY_COLORS[category],
                        minWidth: '14px',
                        minHeight: '14px',
                      }
                }
              />
              <label className="cursor-pointer flex-1">
                {CATEGORY_LABELS[category]}
              </label>
              <span className="text-xs text-muted-foreground ml-auto">
                ({count})
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

