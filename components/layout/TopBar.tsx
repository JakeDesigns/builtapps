'use client';

import { useState } from 'react';
import { Category, Property } from '@/lib/types';
import { SearchBar } from '@/components/controls/SearchBar';
import { CategoryFilterMenu } from '@/components/controls/CategoryFilterMenu';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Plus, MapPin, Menu } from 'lucide-react';
import Image from 'next/image';

interface TopBarProps {
  onSearchSelect: (result: { center: [number, number]; type?: 'address' | 'property'; property?: Property }) => void;
  visibleCategories: Set<Category>;
  onToggleCategory: (category: Category) => void;
  compareMode: boolean;
  onToggleCompare: () => void;
  pinMode: boolean;
  onTogglePinMode: () => void;
  onAddProperty: () => void;
  properties?: Property[];
}

export function TopBar({
  onSearchSelect,
  visibleCategories,
  onToggleCategory,
  compareMode,
  onToggleCompare,
  pinMode,
  onTogglePinMode,
  onAddProperty,
  properties = [],
}: TopBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm z-[1000]">
      <div className="flex items-center gap-4 px-4 py-3 h-16">
        {/* Logo */}
        <div className="flex-shrink-0">
          <div className="h-14 w-14 flex items-center justify-center cursor-pointer">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={56} 
              height={56} 
              className="object-contain"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 min-w-0">
          <SearchBar onSelect={onSearchSelect} properties={properties} />
        </div>

        {/* Desktop: Action Buttons */}
        <div className="hidden md:flex flex-shrink-0 items-center gap-2">
          <CategoryFilterMenu
            visibleCategories={visibleCategories}
            onToggleCategory={onToggleCategory}
            properties={properties}
          />
          <Button
            variant={compareMode ? "default" : "outline"}
            onClick={onToggleCompare}
            size="sm"
          >
            Compare {compareMode ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant={pinMode ? "default" : "outline"}
            onClick={onTogglePinMode}
            size="sm"
          >
            <MapPin className="mr-2 h-4 w-4" />
            {pinMode ? 'Cancel Pin' : 'Pin Property'}
          </Button>
          <Button onClick={onAddProperty} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>

        {/* Mobile: Hamburger Menu */}
        <div className="flex-shrink-0 md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Filters</label>
                  <CategoryFilterMenu
                    visibleCategories={visibleCategories}
                    onToggleCategory={onToggleCategory}
                    properties={properties}
                  />
                </div>

                {/* Compare Toggle */}
                <div>
                  <Button
                    variant={compareMode ? "default" : "outline"}
                    onClick={() => handleAction(onToggleCompare)}
                    className="w-full justify-start"
                    size="lg"
                  >
                    Compare {compareMode ? 'ON' : 'OFF'}
                  </Button>
                </div>

                {/* Pin Property */}
                <div>
                  <Button
                    variant={pinMode ? "default" : "outline"}
                    onClick={() => handleAction(onTogglePinMode)}
                    className="w-full justify-start"
                    size="lg"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {pinMode ? 'Cancel Pin' : 'Pin Property'}
                  </Button>
                </div>

                {/* Add Property */}
                <div>
                  <Button
                    onClick={() => handleAction(onAddProperty)}
                    className="w-full justify-start"
                    size="lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Property
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

