'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';

interface MapContextMenuProps {
  x: number;
  y: number;
  lat: number;
  lng: number;
  onPlacePin: (address?: string) => void;
  onClose: () => void;
}

export function MapContextMenu({ x, y, lat, lng, onPlacePin, onClose }: MapContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);

  // Fetch address on mount
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        setIsLoadingAddress(true);
        const response = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
        const data = await response.json();
        
        if (data.address) {
          setAddress(data.address);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchAddress();
  }, [lat, lng]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Prevent default context menu
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position if menu would go off screen
  const getPosition = () => {
    if (!menuRef.current) return { left: x, top: y };
    
    const menuWidth = 200;
    const menuHeight = 60;
    const padding = 10;
    
    let left = x;
    let top = y;
    
    // Check right edge
    if (x + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - padding;
    }
    
    // Check bottom edge
    if (y + menuHeight > window.innerHeight) {
      top = window.innerHeight - menuHeight - padding;
    }
    
    // Check left edge
    if (left < padding) {
      left = padding;
    }
    
    // Check top edge
    if (top < padding) {
      top = padding;
    }
    
    return { left, top };
  };

  const position = getPosition();

  return (
    <div
      ref={menuRef}
      className="fixed bg-background border rounded-lg shadow-lg z-[1300] p-2 min-w-[220px] max-w-[320px] animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {isLoadingAddress ? (
        <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading address...</span>
        </div>
      ) : address ? (
        <div className="mb-2 pb-2 border-b">
          <p className="text-xs text-muted-foreground mb-1">Address:</p>
          <p className="text-sm font-medium">{address}</p>
        </div>
      ) : null}
      
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          onPlacePin(address || undefined);
          onClose();
        }}
      >
        <MapPin className="mr-2 h-4 w-4" />
        Place Pin Here
      </Button>
    </div>
  );
}

