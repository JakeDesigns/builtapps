'use client';

import { useState, useEffect } from 'react';
import { Property, Category } from '@/lib/types';
import { MapCanvas } from '@/components/map/MapCanvas';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyDetailPanel } from '@/components/property/PropertyDetailPanel';
import { MapContextMenu } from '@/components/map/MapContextMenu';
import { ComparePanel } from '@/components/property/ComparePanel';
import { PropertyForm } from '@/components/property/PropertyForm';
import { TopBar } from '@/components/layout/TopBar';
import { FloatingCompareButton } from '@/components/controls/FloatingCompareButton';
import { MapPin, X } from 'lucide-react';

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

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareProperties, setCompareProperties] = useState<Set<string>>(new Set());
  const [isComparePanelOpen, setIsComparePanelOpen] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<Set<Category>>(
    new Set(ALL_CATEGORIES)
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Treasure Valley, Idaho coordinates (Boise area)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-116.2146, 43.6150]);
  const [mapZoom, setMapZoom] = useState(11);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pinMode, setPinMode] = useState(false);
  const [tempMarkerPosition, setTempMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ lat: number; lng: number; x: number; y: number } | null>(null);
  const [prefillAddress, setPrefillAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/properties');
      
      // Read the response body only once
      let responseData: any;
      try {
        responseData = await response.json();
      } catch (e) {
        // If response isn't JSON, create error data from status
        responseData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      if (!response.ok) {
        // Build a more informative error message
        let errorMessage = responseData.error || `API Error: ${response.status} ${response.statusText}`;
        if (responseData.hint) {
          errorMessage += `\n\n${responseData.hint}`;
        }
        if (responseData.details) {
          console.error('Error details:', responseData.details);
          // Include details in dev mode
          if (process.env.NODE_ENV === 'development') {
            errorMessage += `\n\nDetails: ${responseData.details}`;
          }
        }
        throw new Error(errorMessage);
      }
      
      // Success - use the already parsed responseData
      setProperties(responseData.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to fetch properties';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error
        errorMessage = 'Network error: Unable to connect to the server.\n\nMake sure the development server is running on http://localhost:3000';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = `Unknown error: ${String(error)}`;
      }
      
      setError(errorMessage);
      // Don't crash - just show error and continue with empty array
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyClick = (property: Property) => {
    if (compareMode) {
      setCompareProperties((prev) => {
        const next = new Set(prev);
        if (next.has(property.id)) {
          next.delete(property.id);
        } else {
          next.add(property.id);
        }
        return next;
      });
      // On desktop, show panel immediately when properties are selected
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        setIsComparePanelOpen(true);
      }
    } else {
      setSelectedProperty(property);
    }
  };

  const handleSearchSelect = (result: { center: [number, number]; type?: 'address' | 'property'; property?: Property }) => {
    setMapCenter([result.center[0], result.center[1]]);
    setMapZoom(16); // Zoom in closer for both properties and addresses
    
    // If it's a property, also select it
    if (result.type === 'property' && result.property) {
      setSelectedProperty(result.property);
      setCompareMode(false); // Exit compare mode if active
    }
  };

  const handleToggleCategory = (category: Category) => {
    setVisibleCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleAddProperty = async (formData: any) => {
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Build a more informative error message
        let errorMessage = errorData.error || 'Failed to add property';
        if (errorData.hint) {
          errorMessage += `\n\n${errorData.hint}`;
        }
        if (errorData.details) {
          console.error('Error details:', errorData.details);
          // Include details in dev mode
          if (process.env.NODE_ENV === 'development') {
            errorMessage += `\n\nDetails: ${errorData.details}`;
          }
        }
        throw new Error(errorMessage);
      }

      await fetchProperties();
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  };

  const comparePropertiesList = properties.filter((p) => compareProperties.has(p.id));

  return (
    <div className="relative w-full h-screen">
      {/* Error Display */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] max-w-2xl w-full px-4">
          <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-semibold mb-1">Error: {error.split('\n\n')[0]}</div>
                {error.includes('\n\n') && (
                  <div className="text-sm mt-2 opacity-90 whitespace-pre-line">
                    {error.split('\n\n').slice(1).join('\n\n')}
                  </div>
                )}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-white hover:text-gray-200 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
          Loading properties...
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000]">
        <TopBar
          onSearchSelect={handleSearchSelect}
          visibleCategories={visibleCategories}
          onToggleCategory={handleToggleCategory}
          compareMode={compareMode}
          onToggleCompare={() => {
            const newCompareMode = !compareMode;
            setCompareMode(newCompareMode);
            if (newCompareMode) {
              // On desktop, open panel immediately
              if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                setIsComparePanelOpen(true);
              } else {
                // On mobile, keep panel closed, show map
                setIsComparePanelOpen(false);
              }
            } else {
              // Exit compare mode
              setIsComparePanelOpen(false);
              setCompareProperties(new Set());
            }
          }}
          pinMode={pinMode}
          onTogglePinMode={() => {
            if (pinMode) {
              // Toggle off pin mode
              setPinMode(false);
              setTempMarkerPosition(null);
            } else {
              // Toggle on pin mode
              setPinMode(true);
              setIsFormOpen(false);
              setTempMarkerPosition(null);
            }
          }}
          onAddProperty={() => {
            setIsFormOpen(true);
            setPinMode(false);
            setTempMarkerPosition(null);
          }}
          properties={properties}
        />
      </div>

      {/* Pin Mode Instructions */}
      {pinMode && !isFormOpen && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span className="font-medium">Click on the map to place the property location</span>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="w-full h-full pt-16" style={{ isolation: 'isolate', zIndex: 1 }}>
        <MapCanvas
          properties={properties}
          selectedPropertyId={selectedProperty?.id || null}
          onPropertyClick={handlePropertyClick}
          visibleCategories={visibleCategories}
          center={mapCenter}
          zoom={mapZoom}
          pinMode={pinMode}
          onMapClick={(lat, lng) => {
            if (pinMode) {
              setTempMarkerPosition({ lat, lng });
              // Auto-open form when pin is placed
              setIsFormOpen(true);
            }
          }}
          tempMarkerPosition={tempMarkerPosition}
          onTempMarkerDrag={(lat, lng) => {
            setTempMarkerPosition({ lat, lng });
          }}
          onRightClick={(lat, lng, x, y) => {
            setContextMenu({ lat, lng, x, y });
          }}
        />
      </div>

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <MapContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          lat={contextMenu.lat}
          lng={contextMenu.lng}
          onPlacePin={(address) => {
            setTempMarkerPosition({ lat: contextMenu.lat, lng: contextMenu.lng });
            setPrefillAddress(address);
            setIsFormOpen(true);
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Property Detail Panel (Zillow-style) */}
      {!compareMode && selectedProperty && (
        <PropertyDetailPanel
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onUpdate={(updatedProperty) => {
            // Update the selected property
            setSelectedProperty(updatedProperty);
            // Refresh the properties list to update markers
            fetchProperties();
          }}
        />
      )}

      {/* Floating Compare Button (Mobile) */}
      {compareMode && (
        <FloatingCompareButton
          count={comparePropertiesList.length}
          onClick={() => setIsComparePanelOpen(true)}
        />
      )}

      {/* Compare Panel */}
      {compareMode && (
        <ComparePanel
          properties={comparePropertiesList}
          isOpen={isComparePanelOpen}
          onRemove={(id) => {
            setCompareProperties((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          }}
          onClose={() => {
            setIsComparePanelOpen(false);
            // Just close the panel - compare mode stays active so users can continue adding properties
          }}
          onAddAnother={() => {
            setIsComparePanelOpen(false);
            // Return to map view, compare mode stays active
          }}
        />
      )}

      {/* Add Property Form */}
      <PropertyForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setPinMode(false);
            setTempMarkerPosition(null);
            setPrefillAddress(undefined);
          }
        }}
        onSubmit={handleAddProperty}
        pinMode={pinMode}
        openedViaPin={pinMode && tempMarkerPosition !== null}
        onPinModeChange={setPinMode}
        tempMarkerPosition={tempMarkerPosition}
        onCoordinatesUpdate={(lat, lng) => {
          setTempMarkerPosition({ lat, lng });
        }}
        prefillAddress={prefillAddress}
      />
    </div>
  );
}

