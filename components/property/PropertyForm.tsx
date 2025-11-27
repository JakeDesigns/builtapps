'use client';

import { useState, useEffect, useRef } from 'react';
import { PropertyFormData, Category, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';
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
    // New listing fields
    square_footage: undefined,
    acres: undefined,
    lot_number: '',
    lot_width: undefined,
    lot_depth: undefined,
    lot_price: undefined,
    house_price: undefined,
    garage_size_text: '',
    lot_info: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastManuallyChanged, setLastManuallyChanged] = useState<'acres' | 'square_footage' | null>(null);
  const isCalculatingRef = useRef(false);

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
        // New listing fields
        square_footage: undefined,
        acres: undefined,
        lot_number: '',
        lot_width: undefined,
        lot_depth: undefined,
        lot_price: undefined,
        house_price: undefined,
        garage_size_text: '',
        lot_info: [],
      });
      setLastManuallyChanged(null);
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

  // Two-way conversion between Square Footage (Feet) and Acres
  useEffect(() => {
    if (lastManuallyChanged && !isCalculatingRef.current) {
      isCalculatingRef.current = true;
      
      if (lastManuallyChanged === 'square_footage') {
        const sqftValue = formData.square_footage?.toString() || '';
        if (sqftValue === '' || sqftValue === '0') {
          // Clear acres when square footage is cleared
          setFormData(prev => ({ ...prev, acres: undefined }));
        } else {
          const sqft = parseFloat(sqftValue);
          if (!isNaN(sqft) && sqft > 0) {
            const calculatedAcres = parseFloat((sqft / 43560).toFixed(3));
            setFormData(prev => ({ ...prev, acres: calculatedAcres }));
          }
        }
      } else if (lastManuallyChanged === 'acres') {
        const acresValue = formData.acres?.toString() || '';
        if (acresValue === '' || acresValue === '0') {
          // Clear square footage when acres is cleared
          setFormData(prev => ({ ...prev, square_footage: undefined }));
        } else {
          const acres = parseFloat(acresValue);
          if (!isNaN(acres) && acres > 0) {
            const calculatedSqft = Math.round(acres * 43560);
            setFormData(prev => ({ ...prev, square_footage: calculatedSqft }));
          }
        }
      }
      
      setLastManuallyChanged(null);
      isCalculatingRef.current = false;
    }
  }, [formData.square_footage, formData.acres, lastManuallyChanged]);

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

          {/* Property Details */}
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
            <div className="space-y-2">
              <Label htmlFor="garage_size_text">Garage Type</Label>
              <Input
                id="garage_size_text"
                value={formData.garage_size_text || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseFloat(value);
                  setFormData({ 
                    ...formData, 
                    garage_size_text: value === '' ? '' : (isNaN(numValue) ? value : String(numValue))
                  });
                }}
                placeholder="text field"
              />
            </div>
          </div>

          {/* LOT INFORMATION Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">Lot Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="square_footage">Feet</Label>
                <Input
                  id="square_footage"
                  type="number"
                  value={formData.square_footage || ''}
                  onChange={(e) => {
                    setLastManuallyChanged('square_footage');
                    setFormData({ 
                      ...formData, 
                      square_footage: e.target.value ? parseInt(e.target.value) : undefined 
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acres">Acres</Label>
                <Input
                  id="acres"
                  type="number"
                  step="0.001"
                  value={formData.acres || ''}
                  onChange={(e) => {
                    setLastManuallyChanged('acres');
                    setFormData({ 
                      ...formData, 
                      acres: e.target.value ? parseFloat(e.target.value) : undefined 
                    });
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lot_number">Lot #</Label>
                <Input
                  id="lot_number"
                  value={formData.lot_number || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = parseFloat(value);
                    setFormData({ 
                      ...formData, 
                      lot_number: value === '' ? '' : (isNaN(numValue) ? value : String(numValue))
                    });
                  }}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lot_width">Lot Width (feet)</Label>
                <Input
                  id="lot_width"
                  type="number"
                  step="0.01"
                  value={formData.lot_width || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lot_width: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lot_depth">Lot Depth (feet)</Label>
                <Input
                  id="lot_depth"
                  type="number"
                  step="0.01"
                  value={formData.lot_depth || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lot_depth: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* PRICING Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lot_price">Lot Price ($)</Label>
                <Input
                  id="lot_price"
                  type="number"
                  step="0.01"
                  value={formData.lot_price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lot_price: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="house_price">House Price ($)</Label>
                <Input
                  id="house_price"
                  type="number"
                  step="0.01"
                  value={formData.house_price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      house_price: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                />
              </div>
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

          {/* Additional Information Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">Additional Information</h3>
            <div className="space-y-2">
              <Label>Lot Info</Label>
              {/* Display existing bullet points */}
              {formData.lot_info && formData.lot_info.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.lot_info.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 border rounded-md bg-gray-50">
                      <span className="text-muted-foreground mt-1">•</span>
                      <Input
                        value={item}
                        onChange={(e) => {
                          const updated = [...(formData.lot_info || [])];
                          updated[index] = e.target.value;
                          setFormData({
                            ...formData,
                            lot_info: updated,
                          });
                        }}
                        className="flex-1 bg-white"
                        placeholder="Enter lot information..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          const updated = (formData.lot_info || []).filter((_, i) => i !== index);
                          setFormData({
                            ...formData,
                            lot_info: updated,
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {/* Add new bullet point button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setFormData({
                    ...formData,
                    lot_info: [...(formData.lot_info || []), ''],
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bullet Point
              </Button>
            </div>
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

