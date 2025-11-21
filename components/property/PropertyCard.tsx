'use client';

import { Property, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  onClose?: () => void;
}

export function PropertyCard({ property, onRemove, showRemoveButton = false, onClose }: PropertyCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{property.title}</CardTitle>
          <div className="flex gap-2">
            {showRemoveButton && onRemove && (
              <button
                onClick={onRemove}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Remove
              </button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <div
            className="h-3.5 w-3.5 rounded-full flex-shrink-0 border border-gray-300"
            style={
              property.category === 'pending_under_construction'
                ? {
                    background: 'linear-gradient(90deg, #EF4444 50%, #3B82F6 50%)',
                    minWidth: '14px',
                    minHeight: '14px',
                  }
                : {
                    backgroundColor: CATEGORY_COLORS[property.category],
                    minWidth: '14px',
                    minHeight: '14px',
                  }
            }
          />
          {CATEGORY_LABELS[property.category]}
        </p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {property.subdivision_phase && (
          <div>
            <span className="font-medium">Subdivision Phase:</span> {property.subdivision_phase}
          </div>
        )}
        {(property.lot || property.block) && (
          <div>
            <span className="font-medium">Lot/Block:</span> {[property.lot, property.block].filter(Boolean).join(' / ')}
          </div>
        )}
        {property.address && (
          <div>
            <span className="font-medium">Address:</span> {property.address}
          </div>
        )}
        {property.house_name && (
          <div>
            <span className="font-medium">House Name:</span> {property.house_name}
          </div>
        )}
        {property.size_sqft && (
          <div>
            <span className="font-medium">Size:</span> {property.size_sqft.toLocaleString()} sq ft
          </div>
        )}
        {property.garage_size !== null && property.garage_size !== undefined && (
          <div>
            <span className="font-medium">Garage:</span> {property.garage_size} car{property.garage_size !== 1 ? 's' : ''}
          </div>
        )}
        {property.bedrooms !== null && property.bedrooms !== undefined && (
          <div>
            <span className="font-medium">Bedrooms:</span> {property.bedrooms}
          </div>
        )}
        {property.baths !== null && property.baths !== undefined && (
          <div>
            <span className="font-medium">Baths:</span> {property.baths}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

