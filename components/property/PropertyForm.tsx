'use client';

import { useState, useEffect } from 'react';
import { PropertyFormData, Category, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchBar } from '@/components/controls/SearchBar';

interface PropertyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PropertyFormData) => Promise<void>;
  pinMode?: boolean;
  openedViaPin?: boolean; // True if form was opened after pinning (vs regular add)
  onPinModeChange?: (enabled: boolean) => void;
  tempMarkerPosition?: { lat: number; lng: number } | null;
  onCoordinatesUpdate?: (lat: number, lng: number) => void;
  prefillAddress?: string; // Address to pre-fill when form opens
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

export function PropertyForm({ 
  open, 
  onOpenChange, 
  onSubmit,
  pinMode = false,
  openedViaPin = false,
  onPinModeChange,
  tempMarkerPosition,
  onCoordinatesUpdate,
  prefillAddress,
}: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    subdivision_phase: '',
    lot: '',
    block: '',
    address: '',
    house_name: '',
    size_sqft: undefined,
    garage_size: undefined,
    bedrooms: undefined,
    baths: undefined,
    depth: '',
    width: '',
    building_setbacks: '',
    power_box_location: '',
    lat: 0,
    lng: 0,
    category: 'for_sale_completed',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setFormData({
        title: '',
        subdivision_phase: '',
        lot: '',
        block: '',
        address: '',
        house_name: '',
        size_sqft: undefined,
        garage_size: undefined,
        bedrooms: undefined,
        baths: undefined,
        depth: '',
        width: '',
        building_setbacks: '',
        power_box_location: '',
        lat: 0,
        lng: 0,
        category: 'for_sale_completed',
      });
      // Turn off pin mode when form closes
      if (onPinModeChange) {
        onPinModeChange(false);
      }
    } else if (prefillAddress && tempMarkerPosition) {
      // Pre-fill address when form opens with right-click address
      setFormData(prev => ({
        ...prev,
        address: prefillAddress,
        lat: tempMarkerPosition.lat,
        lng: tempMarkerPosition.lng,
      }));
    }
  }, [open, onPinModeChange, prefillAddress, tempMarkerPosition]);

  // Update form coordinates when temp marker position changes
  useEffect(() => {
    if (tempMarkerPosition) {
      setFormData(prev => ({
        ...prev,
        lat: tempMarkerPosition.lat,
        lng: tempMarkerPosition.lng,
      }));
    }
  }, [tempMarkerPosition]);

  const handleAddressSelect = (result: { center: [number, number]; place_name: string }) => {
    setFormData({
      ...formData,
      address: result.place_name,
      lng: result.center[0],
      lat: result.center[1],
    });
    // Turn off pin mode when address is selected
    if (onPinModeChange) {
      onPinModeChange(false);
    }
  };

  const handleManualCoordinateChange = (field: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value) || 0;
    const newFormData = {
      ...formData,
      [field]: numValue,
    };
    setFormData(newFormData);
    if (onCoordinatesUpdate) {
      onCoordinatesUpdate(newFormData.lat, newFormData.lng);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Please fill in the house title');
      return;
    }
    
    // When opened via pin, coordinates are already set (required)
    // When opened normally, either address or coordinates must be set
    if (openedViaPin) {
      if (formData.lat === 0 || formData.lng === 0) {
        alert('Location coordinates are required');
        return;
      }
    } else if (pinMode) {
      if (formData.lat === 0 || formData.lng === 0) {
        alert('Please click on the map to set the location');
        return;
      }
    } else {
      if (!formData.address && (formData.lat === 0 || formData.lng === 0)) {
        alert('Please search for an address or enable pin mode to set location on map');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting property:', error);
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to add property. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Property</DialogTitle>
          <DialogDescription>Enter the property details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">House Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {!openedViaPin ? (
            <div className="space-y-2">
              <Label htmlFor="address">House Location/Address *</Label>
              <SearchBar 
                onSelect={handleAddressSelect}
                initialValue={prefillAddress}
              />
              {formData.address && (
                <p className="text-sm text-muted-foreground">Selected: {formData.address}</p>
              )}
              {pinMode && (
                <p className="text-sm text-blue-600 font-medium">
                  Click on the map to set the location
                </p>
              )}
              {(formData.lat !== 0 || formData.lng !== 0) && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="lat" className="text-xs">Latitude</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="0.000001"
                      value={formData.lat.toFixed(6)}
                      onChange={(e) => handleManualCoordinateChange('lat', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lng" className="text-xs">Longitude</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="0.000001"
                      value={formData.lng.toFixed(6)}
                      onChange={(e) => handleManualCoordinateChange('lng', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Location (Pinned on Map)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="lat" className="text-xs">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.000001"
                    value={formData.lat.toFixed(6)}
                    onChange={(e) => handleManualCoordinateChange('lat', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lng" className="text-xs">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.000001"
                    value={formData.lng.toFixed(6)}
                    onChange={(e) => handleManualCoordinateChange('lng', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3.5 w-3.5 rounded-full flex-shrink-0 border border-gray-300"
                      style={
                        formData.category === 'pending_under_construction'
                          ? {
                              background: 'linear-gradient(90deg, #EF4444 50%, #3B82F6 50%)',
                              minWidth: '14px',
                              minHeight: '14px',
                            }
                          : {
                              backgroundColor: CATEGORY_COLORS[formData.category],
                              minWidth: '14px',
                              minHeight: '14px',
                            }
                      }
                    />
                    {CATEGORY_LABELS[formData.category]}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ALL_CATEGORIES.map((cat) => {
                  const isSplit = cat === 'pending_under_construction';
                  return (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
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
                                  backgroundColor: CATEGORY_COLORS[cat],
                                  minWidth: '14px',
                                  minHeight: '14px',
                                }
                          }
                        />
                        {CATEGORY_LABELS[cat]}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdivision_phase">Subdivision Phase</Label>
            <Input
              id="subdivision_phase"
              value={formData.subdivision_phase || ''}
              onChange={(e) => setFormData({ ...formData, subdivision_phase: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lot">Lot</Label>
              <Input
                id="lot"
                value={formData.lot || ''}
                onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="block">Block</Label>
              <Input
                id="block"
                value={formData.block || ''}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="house_name">House Name</Label>
            <Input
              id="house_name"
              value={formData.house_name || ''}
              onChange={(e) => setFormData({ ...formData, house_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size_sqft">Size (square feet)</Label>
              <Input
                id="size_sqft"
                type="number"
                value={formData.size_sqft || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    size_sqft: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="garage_size">Garage Size</Label>
              <Input
                id="garage_size"
                type="number"
                value={formData.garage_size || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    garage_size: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bedrooms: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="baths">Baths</Label>
              <Input
                id="baths"
                type="number"
                step="0.1"
                value={formData.baths || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baths: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="depth">Depth</Label>
              <Input
                id="depth"
                value={formData.depth || ''}
                onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                value={formData.width || ''}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="building_setbacks">Building Setbacks</Label>
            <Textarea
              id="building_setbacks"
              value={formData.building_setbacks || ''}
              onChange={(e) => setFormData({ ...formData, building_setbacks: e.target.value })}
              rows={4}
              placeholder="Enter building setbacks information..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="power_box_location">Power Box Location</Label>
            <Input
              id="power_box_location"
              value={formData.power_box_location || ''}
              onChange={(e) => setFormData({ ...formData, power_box_location: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Property'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

