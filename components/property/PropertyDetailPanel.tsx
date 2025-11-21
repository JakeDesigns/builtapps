'use client';

import { useState, useEffect } from 'react';
import { Property, CATEGORY_LABELS, CATEGORY_COLORS, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Loader2, Pencil } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PropertyDetailPanelProps {
  property: Property;
  onClose: () => void;
  onUpdate?: (updatedProperty: Property) => void;
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

export function PropertyDetailPanel({ property, onClose, onUpdate }: PropertyDetailPanelProps) {
  const [currentCategory, setCurrentCategory] = useState<Category>(property.category);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: property.title,
    category: property.category,
    address: property.address || '',
    subdivision_phase: property.subdivision_phase || '',
    lot: property.lot || '',
    block: property.block || '',
    house_name: property.house_name || '',
    size_sqft: property.size_sqft?.toString() || '',
    garage_size: property.garage_size?.toString() || '',
    bedrooms: property.bedrooms?.toString() || '',
    baths: property.baths?.toString() || '',
    depth: property.depth || '',
    width: property.width || '',
    building_setbacks: property.building_setbacks || '',
    power_box_location: property.power_box_location || '',
    lat: property.lat.toString(),
    lng: property.lng.toString(),
  });

  // Sync form state when property prop changes (when not in edit mode)
  useEffect(() => {
    if (!isEditMode) {
      setCurrentCategory(property.category);
      setEditForm({
        title: property.title,
        category: property.category,
        address: property.address || '',
        subdivision_phase: property.subdivision_phase || '',
        lot: property.lot || '',
        block: property.block || '',
        house_name: property.house_name || '',
        size_sqft: property.size_sqft?.toString() || '',
        garage_size: property.garage_size?.toString() || '',
        bedrooms: property.bedrooms?.toString() || '',
        baths: property.baths?.toString() || '',
        depth: property.depth || '',
        width: property.width || '',
        building_setbacks: property.building_setbacks || '',
        power_box_location: property.power_box_location || '',
        lat: property.lat.toString(),
        lng: property.lng.toString(),
      });
    }
  }, [property, isEditMode]);

  const handleCategoryChange = async (newCategory: Category) => {
    if (newCategory === currentCategory) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: newCategory }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update category');
      }

      const data = await response.json();
      setCurrentCategory(newCategory);
      
      // Update parent component with new property data
      if (onUpdate) {
        onUpdate(data.property);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setUpdateError(error instanceof Error ? error.message : 'Failed to update category');
      // Revert to original category on error
      setCurrentCategory(property.category);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!String(editForm.title || '').trim()) {
      setNotification({ type: 'error', message: 'Please fill in the property title' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setIsSaving(true);
    setUpdateError(null);

    try {
      // Build update payload with proper number parsing
      // Ensure all string fields are converted to strings before trimming
      const updateData: any = {
        title: String(editForm.title || '').trim(),
        category: editForm.category,
        address: String(editForm.address || '').trim() || null,
        subdivision_phase: String(editForm.subdivision_phase || '').trim() || null,
        lot: String(editForm.lot || '').trim() || null,
        block: String(editForm.block || '').trim() || null,
        house_name: String(editForm.house_name || '').trim() || null,
        size_sqft: editForm.size_sqft && String(editForm.size_sqft).trim() ? parseInt(String(editForm.size_sqft).trim(), 10) : null,
        garage_size: editForm.garage_size && String(editForm.garage_size).trim() ? parseInt(String(editForm.garage_size).trim(), 10) : null,
        bedrooms: editForm.bedrooms && String(editForm.bedrooms).trim() ? parseInt(String(editForm.bedrooms).trim(), 10) : null,
        baths: editForm.baths && String(editForm.baths).trim() ? parseFloat(String(editForm.baths).trim()) : null,
        depth: String(editForm.depth || '').trim() || null,
        width: String(editForm.width || '').trim() || null,
        building_setbacks: String(editForm.building_setbacks || '').trim() || null,
        power_box_location: String(editForm.power_box_location || '').trim() || null,
        lat: parseFloat(String(editForm.lat || '0')) || 0,
        lng: parseFloat(String(editForm.lng || '0')) || 0,
      };

      // Validate lat/lng are valid numbers
      if (isNaN(updateData.lat) || isNaN(updateData.lng)) {
        setNotification({ type: 'error', message: 'Please enter valid latitude and longitude values' });
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        const errorMessage = error.details 
          ? `${error.error}: ${error.details}` 
          : error.error || 'Failed to update property';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Show success notification
      setNotification({ type: 'success', message: 'Property saved successfully!' });
      setTimeout(() => setNotification(null), 3000);
      
      // Update parent component
      if (onUpdate) {
        onUpdate(data.property);
      }
      
      // Exit edit mode
      setIsEditMode(false);
      setCurrentCategory(editForm.category);
    } catch (error) {
      console.error('Error saving property:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save property';
      setUpdateError(errorMessage);
      setNotification({ type: 'error', message: errorMessage });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original property values
    setEditForm({
      title: property.title,
      category: property.category,
      address: property.address || '',
      subdivision_phase: property.subdivision_phase || '',
      lot: property.lot || '',
      block: property.block || '',
      house_name: property.house_name || '',
      size_sqft: property.size_sqft?.toString() || '',
      garage_size: property.garage_size?.toString() || '',
      bedrooms: property.bedrooms?.toString() || '',
      baths: property.baths?.toString() || '',
      depth: property.depth || '',
      width: property.width || '',
      building_setbacks: property.building_setbacks || '',
      power_box_location: property.power_box_location || '',
      lat: property.lat.toString(),
      lng: property.lng.toString(),
    });
    setCurrentCategory(property.category);
    setIsEditMode(false);
    setUpdateError(null);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/50 z-[1100] md:hidden"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[420px] bg-background border-l shadow-xl z-[1200] flex flex-col animate-in slide-in-from-right duration-300" style={{ isolation: 'isolate' }}>
        {/* Notification Bar */}
        {notification && (
          <div className={`absolute top-0 left-0 right-0 z-[1300] px-4 py-3 text-sm font-medium text-white animate-in slide-in-from-top duration-300 ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            <div className="flex items-center justify-between">
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-white hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className={`p-6 border-b flex items-start justify-between bg-white ${notification ? 'pt-16' : ''}`}>
          <div className="flex-1 pr-4">
            {/* Category Badge */}
            <div className="mb-3">
              {(() => {
                const category = isEditMode ? editForm.category : (currentCategory || property.category);
                const isSplit = category === 'pending_under_construction';
                const bgColor = CATEGORY_COLORS[category];
                
                // Ensure we have a valid color
                if (!isSplit && !bgColor) {
                  console.warn(`No color found for category: ${category}`);
                }
                
                const badgeStyle: React.CSSProperties = isSplit
                  ? { 
                      background: 'linear-gradient(90deg, #EF4444 50%, #3B82F6 50%)',
                    }
                  : { 
                      backgroundColor: bgColor || '#000000'
                    };
                
                return (
                  <div
                    key={`badge-${property.id}-${category}`}
                    className="h-12 w-12 rounded flex items-center justify-center text-white font-bold text-xl shadow-sm border-2 border-white"
                    style={badgeStyle}
                  >
                    {(isEditMode ? editForm.title : property.title).charAt(0).toUpperCase()}
                  </div>
                );
              })()}
            </div>
            {isEditMode ? (
              <div className="space-y-2 mb-3">
                <Label htmlFor="edit-title">House Title *</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="text-2xl font-semibold"
                />
              </div>
            ) : (
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                {property.title}
              </h2>
            )}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Category
              </label>
              <Select
                value={isEditMode ? editForm.category : currentCategory}
                onValueChange={(value) => {
                  if (isEditMode) {
                    setEditForm({ ...editForm, category: value as Category });
                  } else {
                    handleCategoryChange(value as Category);
                  }
                }}
                disabled={isUpdating || isSaving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3.5 w-3.5 rounded-full flex-shrink-0 border border-gray-300"
                          style={
                            (isEditMode ? editForm.category : currentCategory) === 'pending_under_construction'
                              ? {
                                  background: 'linear-gradient(90deg, #EF4444 50%, #3B82F6 50%)',
                                  minWidth: '14px',
                                  minHeight: '14px',
                                }
                              : {
                                  backgroundColor: CATEGORY_COLORS[isEditMode ? editForm.category : currentCategory],
                                  minWidth: '14px',
                                  minHeight: '14px',
                                }
                          }
                        />
                        {CATEGORY_LABELS[isEditMode ? editForm.category : currentCategory]}
                      </div>
                    )}
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
              {updateError && (
                <p className="text-xs text-red-500">{updateError}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditMode(true)}
                className="h-8 w-8 shrink-0"
                title="Edit property"
              >
                <Pencil className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {isEditMode ? (
              <>
                {/* Edit Mode Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Address</Label>
                    <Input
                      id="edit-address"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-subdivision">Subdivision Phase</Label>
                    <Input
                      id="edit-subdivision"
                      value={editForm.subdivision_phase}
                      onChange={(e) => setEditForm({ ...editForm, subdivision_phase: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-lot">Lot</Label>
                      <Input
                        id="edit-lot"
                        value={editForm.lot}
                        onChange={(e) => setEditForm({ ...editForm, lot: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-block">Block</Label>
                      <Input
                        id="edit-block"
                        value={editForm.block}
                        onChange={(e) => setEditForm({ ...editForm, block: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-house-name">House Name</Label>
                    <Input
                      id="edit-house-name"
                      value={editForm.house_name}
                      onChange={(e) => setEditForm({ ...editForm, house_name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-size">Size (sq ft)</Label>
                      <Input
                        id="edit-size"
                        type="number"
                        value={editForm.size_sqft}
                        onChange={(e) => setEditForm({ ...editForm, size_sqft: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-garage">Garage Size</Label>
                      <Input
                        id="edit-garage"
                        type="number"
                        value={editForm.garage_size}
                        onChange={(e) => setEditForm({ ...editForm, garage_size: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-bedrooms">Bedrooms</Label>
                      <Input
                        id="edit-bedrooms"
                        type="number"
                        value={editForm.bedrooms}
                        onChange={(e) => setEditForm({ ...editForm, bedrooms: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-baths">Baths</Label>
                      <Input
                        id="edit-baths"
                        type="number"
                        step="0.1"
                        value={editForm.baths}
                        onChange={(e) => setEditForm({ ...editForm, baths: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-depth">Depth</Label>
                      <Input
                        id="edit-depth"
                        value={editForm.depth}
                        onChange={(e) => setEditForm({ ...editForm, depth: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-width">Width</Label>
                      <Input
                        id="edit-width"
                        value={editForm.width}
                        onChange={(e) => setEditForm({ ...editForm, width: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-building-setbacks">Building Setbacks</Label>
                    <Textarea
                      id="edit-building-setbacks"
                      value={editForm.building_setbacks}
                      onChange={(e) => setEditForm({ ...editForm, building_setbacks: e.target.value })}
                      rows={4}
                      placeholder="Enter building setbacks information..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-power-box-location">Power Box Location</Label>
                    <Input
                      id="edit-power-box-location"
                      value={editForm.power_box_location}
                      onChange={(e) => setEditForm({ ...editForm, power_box_location: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-lat">Latitude</Label>
                      <Input
                        id="edit-lat"
                        type="number"
                        step="0.000001"
                        value={editForm.lat}
                        onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-lng">Longitude</Label>
                      <Input
                        id="edit-lng"
                        type="number"
                        step="0.000001"
                        value={editForm.lng}
                        onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Read-Only Display */}
                {/* Address Section */}
                {property.address && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                      Location
                    </h3>
                    <p className="text-base text-foreground">{property.address}</p>
                  </div>
                )}

                {/* Key Details Grid */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                    Property Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {property.size_sqft && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Size</p>
                        <p className="text-base font-medium">
                          {property.size_sqft.toLocaleString()} sq ft
                        </p>
                      </div>
                    )}
                    {property.bedrooms !== null && property.bedrooms !== undefined && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Bedrooms</p>
                        <p className="text-base font-medium">{property.bedrooms}</p>
                      </div>
                    )}
                    {property.baths !== null && property.baths !== undefined && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Baths</p>
                        <p className="text-base font-medium">{property.baths}</p>
                      </div>
                    )}
                    {property.garage_size !== null && property.garage_size !== undefined && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Garage</p>
                        <p className="text-base font-medium">
                          {property.garage_size} car{property.garage_size !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                {(property.subdivision_phase || property.lot || property.block || property.house_name || property.depth || property.width || property.building_setbacks || property.power_box_location) && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                      Additional Information
                    </h3>
                    <div className="space-y-3">
                      {property.subdivision_phase && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Subdivision Phase
                          </p>
                          <p className="text-base">{property.subdivision_phase}</p>
                        </div>
                      )}
                      {(property.lot || property.block) && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Lot / Block
                          </p>
                          <p className="text-base">
                            {[property.lot, property.block].filter(Boolean).join(' / ') || '—'}
                          </p>
                        </div>
                      )}
                      {property.house_name && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            House Name
                          </p>
                          <p className="text-base">{property.house_name}</p>
                        </div>
                      )}
                      {(property.depth || property.width) && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Depth / Width
                          </p>
                          <p className="text-base">
                            {[property.depth, property.width].filter(Boolean).join(' / ') || '—'}
                          </p>
                        </div>
                      )}
                      {property.building_setbacks && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Building Setbacks
                          </p>
                          <p className="text-base whitespace-pre-wrap">{property.building_setbacks}</p>
                        </div>
                      )}
                      {property.power_box_location && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Power Box Location
                          </p>
                          <p className="text-base">{property.power_box_location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Coordinates */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                    Coordinates
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Latitude: </span>
                      <span className="font-mono">{property.lat.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Longitude: </span>
                      <span className="font-mono">{property.lng.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Save/Cancel Buttons */}
        {isEditMode && (
          <div className="p-6 border-t bg-white flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

