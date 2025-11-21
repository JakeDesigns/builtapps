'use client';

import { useState, useEffect } from 'react';
import { Property } from '@/lib/types';
import { PropertyCard } from './PropertyCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { X, Plus } from 'lucide-react';

interface ComparePanelProps {
  properties: Property[];
  onRemove: (propertyId: string) => void;
  onClose: () => void;
  isOpen: boolean;
  onAddAnother?: () => void;
}

export function ComparePanel({ properties, onRemove, onClose, isOpen, onAddAnother }: ComparePanelProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (properties.length === 0) return null;

  const content = (
    <>
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Compare Properties ({properties.length})</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onRemove={() => onRemove(property.id)}
              showRemoveButton
            />
          ))}
        </div>
      </ScrollArea>
    </>
  );

  // Mobile: Use Sheet component (only render on mobile to prevent overlay on desktop)
  return (
    <>
      {/* Mobile Sheet - only render when actually on mobile */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Compare Properties ({properties.length})</SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onRemove={() => onRemove(property.id)}
                    showRemoveButton
                  />
                ))}
              </div>
            </ScrollArea>
            {onAddAnother && (
              <div className="p-4 border-t">
                <Button
                  onClick={onAddAnother}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Property
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop: Fixed panel - no "Add Another Property" button */}
      {!isMobile && isOpen && (
        <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-[1200] flex flex-col" style={{ isolation: 'isolate' }}>
          {content}
        </div>
      )}
    </>
  );
}

