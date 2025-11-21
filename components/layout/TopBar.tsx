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
import { Plus, MapPin, Menu, LogOut, User } from 'lucide-react';
import Image from 'next/image';
// AUTH: Import useAuth hook to access user info and logout functionality
import { useAuth } from '@/lib/auth/AuthContext';

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
  // AUTH: Get user info and signOut function from auth context
  const { user, signOut } = useAuth();

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  // AUTH: Handle logout action
  const handleLogout = async () => {
    await signOut();
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
          
          {/* AUTH: User info and logout button */}
          {user && (
            <>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-sm">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700 max-w-[150px] truncate">{user.email}</span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                size="sm"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
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
                {/* AUTH: User info display in mobile menu */}
                {user && (
                  <div className="pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700 truncate">{user.email}</span>
                    </div>
                  </div>
                )}

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

                {/* AUTH: Logout button in mobile menu */}
                {user && (
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full justify-start"
                      size="lg"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

