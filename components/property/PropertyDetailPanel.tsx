'use client';

import { useState, useEffect, useRef } from 'react';
import { Property, CATEGORY_LABELS, CATEGORY_COLORS, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastManuallyChanged, setLastManuallyChanged] = useState<'acres' | 'square_footage' | null>(null);
  const isCalculatingRef = useRef(false);
  
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
    // New listing fields
    square_footage: property.square_footage?.toString() || '',
    acres: property.acres !== null && property.acres !== undefined ? property.acres.toFixed(3) : '',
    lot_number: property.lot_number !== null && property.lot_number !== undefined ? String(property.lot_number) : '',
    lot_width: property.lot_width?.toString() || '',
    lot_depth: property.lot_depth?.toString() || '',
    lot_price: property.lot_price?.toString() || '',
    house_price: property.house_price?.toString() || '',
    garage_size_text: property.garage_size_text || '',
    lot_info: property.lot_info || [],
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
        // New listing fields
        square_footage: property.square_footage?.toString() || '',
        acres: property.acres !== null && property.acres !== undefined ? property.acres.toFixed(3) : '',
        lot_number: property.lot_number !== null && property.lot_number !== undefined ? String(property.lot_number) : '',
        lot_width: property.lot_width?.toString() || '',
        lot_depth: property.lot_depth?.toString() || '',
        lot_price: property.lot_price?.toString() || '',
        house_price: property.house_price?.toString() || '',
        garage_size_text: property.garage_size_text || '',
        lot_info: property.lot_info || [],
      });
      setLastManuallyChanged(null);
    }
  }, [property, isEditMode]);

  // Two-way conversion between Square Footage and Acres
  useEffect(() => {
    if (isEditMode && lastManuallyChanged && !isCalculatingRef.current) {
      isCalculatingRef.current = true;
      if (lastManuallyChanged === 'square_footage' && editForm.square_footage) {
        const sqft = parseFloat(editForm.square_footage);
        if (!isNaN(sqft) && sqft > 0) {
          const calculatedAcres = (sqft / 43560).toFixed(3);
          setEditForm(prev => ({ ...prev, acres: calculatedAcres }));
        }
      } else if (lastManuallyChanged === 'acres' && editForm.acres) {
        const acres = parseFloat(editForm.acres);
        if (!isNaN(acres) && acres > 0) {
          const calculatedSqft = Math.round(acres * 43560).toString();
          setEditForm(prev => ({ ...prev, square_footage: calculatedSqft }));
        }
      }
      setLastManuallyChanged(null);
      isCalculatingRef.current = false;
    }
  }, [editForm.square_footage, editForm.acres, lastManuallyChanged, isEditMode]);

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
        // New listing fields
        square_footage: editForm.square_footage && String(editForm.square_footage).trim() ? parseInt(String(editForm.square_footage).trim(), 10) : null,
        acres: editForm.acres && String(editForm.acres).trim() ? parseFloat(String(editForm.acres).trim()) : null,
        lot_number: editForm.lot_number && String(editForm.lot_number).trim() 
          ? (isNaN(parseFloat(editForm.lot_number)) ? editForm.lot_number : parseFloat(editForm.lot_number))
          : null,
        lot_width: editForm.lot_width && String(editForm.lot_width).trim() ? parseFloat(String(editForm.lot_width).trim()) : null,
        lot_depth: editForm.lot_depth && String(editForm.lot_depth).trim() ? parseFloat(String(editForm.lot_depth).trim()) : null,
        lot_price: editForm.lot_price && String(editForm.lot_price).trim() ? parseFloat(String(editForm.lot_price).trim()) : null,
        house_price: editForm.house_price && String(editForm.house_price).trim() ? parseFloat(String(editForm.house_price).trim()) : null,
        garage_size_text: editForm.garage_size_text && String(editForm.garage_size_text).trim()
          ? (isNaN(parseFloat(editForm.garage_size_text)) ? editForm.garage_size_text : parseFloat(editForm.garage_size_text))
          : null,
        lot_info: editForm.lot_info && editForm.lot_info.length > 0 
          ? editForm.lot_info.filter((item: string) => item.trim().length > 0)
          : null,
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
      // New listing fields
      square_footage: property.square_footage?.toString() || '',
      acres: property.acres !== null && property.acres !== undefined ? property.acres.toFixed(3) : '',
      lot_number: property.lot_number !== null && property.lot_number !== undefined ? String(property.lot_number) : '',
      lot_width: property.lot_width?.toString() || '',
      lot_depth: property.lot_depth?.toString() || '',
      lot_price: property.lot_price?.toString() || '',
      house_price: property.house_price?.toString() || '',
      garage_size_text: property.garage_size_text || '',
      lot_info: property.lot_info || [],
    });
    setCurrentCategory(property.category);
    setIsEditMode(false);
    setUpdateError(null);
    setLastManuallyChanged(null);
    setShowDeleteConfirm(false);
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    setUpdateError(null);

    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_deleted: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete property');
      }

      setNotification({ type: 'success', message: 'Property deleted successfully!' });
      // Update parent state first to trigger refresh
      if (onUpdate) {
        onUpdate({ ...property, is_deleted: true });
      }
      setTimeout(() => {
        setNotification(null);
        onClose(); // Close the panel after refresh
      }, 1500);
    } catch (error) {
      console.error('Error deleting property:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete property';
      setUpdateError(errorMessage);
      setNotification({ type: 'error', message: errorMessage });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
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
                {/* Edit Mode Form - Reorganized to match image layout */}
                <div className="space-y-4">
                  {/* BASIC INFORMATION Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase">Basic Information</h3>
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
                    <div className="space-y-2">
                      <Label htmlFor="edit-house-name">House Name</Label>
                      <Input
                        id="edit-house-name"
                        value={editForm.house_name}
                        onChange={(e) => setEditForm({ ...editForm, house_name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Property Details Section */}
                  <div className="space-y-4 pt-4 border-t">
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
                        <Label htmlFor="edit-garage">Garage Size</Label>
                        <Input
                          id="edit-garage"
                          type="number"
                          value={editForm.garage_size}
                          onChange={(e) => setEditForm({ ...editForm, garage_size: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-garage-type">Garage Type</Label>
                        <Input
                          id="edit-garage-type"
                          type="text"
                          value={editForm.garage_size_text}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              garage_size_text: e.target.value,
                            })
                          }
                          placeholder="e.g., 3 Car w/ RV"
                        />
                      </div>
                    </div>
                  </div>

                  {/* LOT INFORMATION Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase">Lot Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-square-footage">Square Footage</Label>
                        <Input
                          id="edit-square-footage"
                          type="number"
                          value={editForm.square_footage}
                          onChange={(e) => {
                            setLastManuallyChanged('square_footage');
                            setEditForm({ ...editForm, square_footage: e.target.value });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-acres">Acres</Label>
                        <Input
                          id="edit-acres"
                          type="number"
                          step="0.001"
                          value={editForm.acres}
                          onChange={(e) => {
                            setLastManuallyChanged('acres');
                            setEditForm({ ...editForm, acres: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-lot-number">Lot #</Label>
                        <Input
                          id="edit-lot-number"
                          value={editForm.lot_number}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = parseFloat(value);
                            setEditForm({ 
                              ...editForm, 
                              lot_number: value === '' ? '' : (isNaN(numValue) ? value : String(numValue))
                            });
                          }}
                          placeholder="Enter lot number (text or number)"
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-lot-width">Lot Width (feet)</Label>
                        <Input
                          id="edit-lot-width"
                          type="number"
                          step="0.01"
                          value={editForm.lot_width}
                          onChange={(e) => setEditForm({ ...editForm, lot_width: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-lot-depth">Lot Depth (feet)</Label>
                        <Input
                          id="edit-lot-depth"
                          type="number"
                          step="0.01"
                          value={editForm.lot_depth}
                          onChange={(e) => setEditForm({ ...editForm, lot_depth: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* PRICING Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase">Pricing</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-lot-price">Lot Price ($)</Label>
                        <Input
                          id="edit-lot-price"
                          type="number"
                          step="0.01"
                          value={editForm.lot_price}
                          onChange={(e) => setEditForm({ ...editForm, lot_price: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-house-price">House Price ($)</Label>
                        <Input
                          id="edit-house-price"
                          type="number"
                          step="0.01"
                          value={editForm.house_price}
                          onChange={(e) => setEditForm({ ...editForm, house_price: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Building Setbacks Section */}
                  <div className="space-y-4 pt-4 border-t">
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
                  </div>

                  {/* Additional Information Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase">Additional Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="edit-lot-info">Lot Info</Label>
                      {/* Display existing bullet points */}
                      {editForm.lot_info && editForm.lot_info.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {editForm.lot_info.map((item, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 border rounded-md bg-gray-50">
                              <span className="text-muted-foreground mt-1">•</span>
                              <Input
                                value={item}
                                onChange={(e) => {
                                  const updated = [...editForm.lot_info];
                                  updated[index] = e.target.value;
                                  setEditForm({
                                    ...editForm,
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
                                  const updated = editForm.lot_info.filter((_, i) => i !== index);
                                  setEditForm({
                                    ...editForm,
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
                          setEditForm({
                            ...editForm,
                            lot_info: [...(editForm.lot_info || []), ''],
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bullet Point
                      </Button>
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
                </div>
              </>
            ) : (
              <>
                {/* Read-Only Display - Matches Edit Mode Structure */}
                
                {/* HOUSE INFORMATION Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">House Information</h3>
                  
                  <div className="space-y-3">
                    {/* House Name & House Price */}
                    {(property.house_name || property.house_price) && (
                      <div className="grid grid-cols-2 gap-4">
                        {property.house_name && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">House Name</p>
                            <p className="text-base font-medium break-words">{property.house_name}</p>
                          </div>
                        )}
                        {property.house_price && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">House Price</p>
                            <p className="text-base font-medium">${property.house_price.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Address */}
                    {property.address && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Address</p>
                        <p className="text-base break-words">{property.address}</p>
                      </div>
                    )}
                    
                    {/* Square Footage (House) */}
                    {property.size_sqft && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Square Footage</p>
                        <p className="text-base font-medium">{property.size_sqft.toLocaleString()} sq ft</p>
                      </div>
                    )}
                    
                    {/* Bedrooms & Baths */}
                    {(property.bedrooms !== null && property.bedrooms !== undefined || property.baths !== null && property.baths !== undefined) && (
                      <div className="grid grid-cols-2 gap-4">
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
                      </div>
                    )}
                    
                    {/* Garage Size & Garage Type */}
                    {(property.garage_size !== null && property.garage_size !== undefined || property.garage_size_text) && (
                      <div className="grid grid-cols-2 gap-4">
                        {property.garage_size !== null && property.garage_size !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Garage Size</p>
                            <p className="text-base font-medium">{property.garage_size}</p>
                          </div>
                        )}
                        {property.garage_size_text && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Garage Type</p>
                            <p className="text-base font-medium break-words">{property.garage_size_text}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* House Width & House Depth */}
                    {(property.width || property.depth) && (
                      <div className="grid grid-cols-2 gap-4">
                        {property.width && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">House Width</p>
                            <p className="text-base break-words">{property.width}</p>
                          </div>
                        )}
                        {property.depth && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">House Depth</p>
                            <p className="text-base break-words">{property.depth}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* House Notes */}
                    {property.power_box_location && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">House Notes</p>
                        <p className="text-base whitespace-pre-wrap break-words">{property.power_box_location}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* LOT INFORMATION Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lot Information</h3>
                  
                  <div className="space-y-3">
                    {/* Subdivision Phase */}
                    {property.subdivision_phase && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Subdivision Phase</p>
                        <p className="text-base break-words">{property.subdivision_phase}</p>
                      </div>
                    )}
                    
                    {/* Lot # & Block */}
                    {((property.lot_number || property.lot) || property.block) && (
                      <div className="grid grid-cols-2 gap-4">
                        {(property.lot_number || property.lot) && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Lot #</p>
                            <p className="text-base font-medium break-words">{property.lot_number || property.lot}</p>
                          </div>
                        )}
                        {property.block && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Block</p>
                            <p className="text-base font-medium break-words">{property.block}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Lot Width & Lot Depth */}
                    {(property.lot_width || property.lot_depth) && (
                      <div className="grid grid-cols-2 gap-4">
                        {property.lot_width && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Lot Width (feet)</p>
                            <p className="text-base">{property.lot_width.toLocaleString()}</p>
                          </div>
                        )}
                        {property.lot_depth && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Lot Depth (feet)</p>
                            <p className="text-base">{property.lot_depth.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Feet & Acres */}
                    {(property.square_footage || property.acres) && (
                      <div className="grid grid-cols-2 gap-4">
                        {property.square_footage && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Feet</p>
                            <p className="text-base font-medium">{property.square_footage.toLocaleString()}</p>
                          </div>
                        )}
                        {property.acres && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Acres</p>
                            <p className="text-base font-medium">{property.acres.toFixed(3)}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Lot Price */}
                    {property.lot_price && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Lot Price</p>
                        <p className="text-base font-medium">${property.lot_price.toLocaleString()}</p>
                      </div>
                    )}
                    
                    {/* Building Setbacks */}
                    {property.building_setbacks && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Building Setbacks</p>
                        <p className="text-base whitespace-pre-wrap break-words">{property.building_setbacks}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ADDITIONAL INFORMATION Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Additional Information</h3>
                  
                  <div className="space-y-3">
                    {/* Bullet Points */}
                    {property.lot_info && property.lot_info.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Lot Info</p>
                        <ul className="space-y-1">
                          {property.lot_info.map((item, index) => (
                            <li key={index} className="text-base flex items-start gap-2">
                              <span className="text-muted-foreground">•</span>
                              <span className="break-words">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Latitude & Longitude */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Latitude</p>
                        <p className="text-base font-mono">{property.lat.toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Longitude</p>
                        <p className="text-base font-mono">{property.lng.toFixed(6)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Save/Cancel/Delete Buttons */}
        {isEditMode && (
          <div className="p-6 border-t bg-white space-y-3">
            {showDeleteConfirm ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    Are you sure you want to delete this property? This action cannot be undone later.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Confirm Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
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
        )}
      </div>
    </>
  );
}
