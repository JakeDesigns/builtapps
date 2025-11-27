'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Property, Category, CATEGORY_COLORS } from '@/lib/types';
import { MarkerPin } from './MarkerPin';

interface MapCanvasProps {
  properties: Property[];
  selectedPropertyId: string | null;
  onPropertyClick: (property: Property) => void;
  visibleCategories: Set<Category>;
  center?: [number, number];
  zoom?: number;
  pinMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  tempMarkerPosition?: { lat: number; lng: number } | null;
  onTempMarkerDrag?: (lat: number, lng: number) => void;
  onRightClick?: (lat: number, lng: number, x: number, y: number) => void;
}

export function MapCanvas({
  properties,
  selectedPropertyId,
  onPropertyClick,
  visibleCategories,
  center = [-116.2146, 43.6150], // Treasure Valley, Idaho (Boise area)
  zoom = 11,
  pinMode = false,
  onMapClick,
  tempMarkerPosition,
  onTempMarkerDrag,
  onRightClick,
}: MapCanvasProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const tempMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const tooltipsRef = useRef<Map<string, mapboxgl.Popup>>(new Map());

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error('Mapbox token not found');
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center,
        zoom,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map center and zoom when props change
  useEffect(() => {
    if (map.current) {
      map.current.flyTo({
        center,
        zoom,
        duration: 1000,
      });
    }
  }, [center, zoom]);

  // Handle map click for pin mode
  useEffect(() => {
    if (!map.current || !pinMode || !onMapClick) return;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      if (pinMode) {
        const { lng, lat } = e.lngLat;
        onMapClick(lat, lng);
      }
    };

    map.current.on('click', handleMapClick);
    map.current.getCanvas().style.cursor = pinMode ? 'crosshair' : '';

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
        map.current.getCanvas().style.cursor = '';
      }
    };
  }, [pinMode, onMapClick]);

  // Handle right-click context menu
  useEffect(() => {
    if (!map.current || !onRightClick) return;

    const handleContextMenu = (e: mapboxgl.MapMouseEvent) => {
      e.preventDefault();
      const { lng, lat } = e.lngLat;
      const point = e.point;
      onRightClick(lat, lng, point.x, point.y);
    };

    map.current.on('contextmenu', handleContextMenu);

    return () => {
      if (map.current) {
        map.current.off('contextmenu', handleContextMenu);
      }
    };
  }, [onRightClick]);

  // Update temporary marker
  useEffect(() => {
    if (!map.current) return;

    // Remove existing temp marker
    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }

    // Add new temp marker if position is set
    if (tempMarkerPosition) {
      const el = document.createElement('div');
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#3B82F6';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 0 2px #3B82F6, 0 2px 8px rgba(0,0,0,0.3)';
      el.style.cursor = 'move';
      el.style.zIndex = '1000';

      const marker = new mapboxgl.Marker({ 
        element: el,
        draggable: true,
      })
        .setLngLat([tempMarkerPosition.lng, tempMarkerPosition.lat])
        .addTo(map.current);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        if (onTempMarkerDrag) {
          onTempMarkerDrag(lngLat.lat, lngLat.lng);
        }
      });

      tempMarkerRef.current = marker;
    }

    return () => {
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }
    };
  }, [tempMarkerPosition, onTempMarkerDrag]);

  // Update markers when properties or visibleCategories change
  useEffect(() => {
    if (!map.current) return;

    // Remove all existing markers and tooltips
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();
    tooltipsRef.current.forEach((tooltip) => tooltip.remove());
    tooltipsRef.current.clear();

    // Add markers for visible properties
    properties.forEach((property) => {
      if (!visibleCategories.has(property.category)) return;

      const color = CATEGORY_COLORS[property.category];
      const isSplit = property.category === 'pending_under_construction';

      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker-container';
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.cursor = pinMode ? 'default' : 'pointer';

      if (isSplit) {
        el.style.background = 'linear-gradient(90deg, #EF4444 50%, #3B82F6 50%)';
      } else {
        el.style.backgroundColor = color;
      }
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.2)';

      if (selectedPropertyId === property.id) {
        el.style.transform = 'scale(1.3)';
        // Don't set z-index - let it stay in map's stacking context, below UI panels
      }

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([property.lng, property.lat])
        .addTo(map.current!);

      // Create tooltip popup
      const tooltipContent = document.createElement('div');
      tooltipContent.style.padding = '8px 12px';
      tooltipContent.style.fontSize = '14px';
      tooltipContent.style.fontWeight = '500';
      tooltipContent.style.color = '#1f2937';
      tooltipContent.style.lineHeight = '1.4';
      
      // Build tooltip text: ${address} • Lot ${lotNumber} • Block ${block}
      const tooltipParts: string[] = [];
      
      if (property.address) {
        tooltipParts.push(property.address);
      }
      
      if (property.lot_number) {
        tooltipParts.push(`Lot ${property.lot_number}`);
      }
      
      if (property.block) {
        tooltipParts.push(`Block ${property.block}`);
      }
      
      const titleDiv = document.createElement('div');
      titleDiv.textContent = tooltipParts.length > 0 
        ? tooltipParts.join(' • ')
        : property.title; // Fallback to title if no fields available
      
      tooltipContent.appendChild(titleDiv);

      const tooltip = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: 'bottom',
        offset: [0, -8],
        className: 'property-tooltip',
      })
        .setLngLat([property.lng, property.lat])
        .setDOMContent(tooltipContent);

      // Show tooltip on hover
      el.addEventListener('mouseenter', () => {
        if (!pinMode) {
          tooltip.addTo(map.current!);
        }
      });

      el.addEventListener('mouseleave', () => {
        tooltip.remove();
      });

      // Only allow property clicks when not in pin mode
      if (!pinMode) {
        el.addEventListener('click', () => {
          onPropertyClick(property);
        });
      }

      markersRef.current.set(property.id, marker);
      tooltipsRef.current.set(property.id, tooltip);
    });
  }, [properties, visibleCategories, selectedPropertyId, onPropertyClick, pinMode]);

  return <div ref={mapContainer} className="w-full h-full" />;
}

