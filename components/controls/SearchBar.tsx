'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Property } from '@/lib/types';

interface GeocodeResult {
  id: string;
  place_name: string;
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
  type?: 'address' | 'property';
  property?: Property;
}

interface SearchBarProps {
  onSelect: (result: GeocodeResult) => void;
  initialValue?: string; // Pre-filled address value
  properties?: Property[]; // List of properties to search through
}

export function SearchBar({ onSelect, initialValue, properties = [] }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue || '');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Update query when initialValue changes (without triggering search)
  useEffect(() => {
    if (initialValue) {
      setQuery(initialValue);
      // Reset interaction state when pre-filled from outside
      setHasUserInteracted(false);
      setIsOpen(false);
      setResults([]);
    }
  }, [initialValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Only search if user has interacted with the field
    if (!hasUserInteracted) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const searchQuery = query.toLowerCase().trim();
        const allResults: GeocodeResult[] = [];

        // Search properties
        const propertyMatches = properties.filter((property) => {
          const titleMatch = property.title?.toLowerCase().includes(searchQuery);
          const addressMatch = property.address?.toLowerCase().includes(searchQuery);
          const houseNameMatch = property.house_name?.toLowerCase().includes(searchQuery);
          return titleMatch || addressMatch || houseNameMatch;
        });

        // Add property results
        propertyMatches.forEach((property) => {
          const displayName = property.title || property.address || property.house_name || 'Untitled Property';
          allResults.push({
            id: `property-${property.id}`,
            place_name: `Property: ${displayName}${property.address ? ` - ${property.address}` : ''}`,
            center: [property.lng, property.lat],
            type: 'property',
            property: property,
          });
        });

        // Search addresses via Mapbox
        try {
          const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
          const data = await response.json();
          
          if (data.features) {
            const addressResults = data.features.map((f: any) => ({
              id: f.id,
              place_name: f.place_name,
              center: f.center,
              context: f.context,
              type: 'address' as const,
            }));
            allResults.push(...addressResults);
          }
        } catch (error) {
          console.error('Geocode error:', error);
        }

        setResults(allResults);
        setIsOpen(allResults.length > 0);
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, hasUserInteracted, properties]);

  const handleSelect = (result: GeocodeResult) => {
    setQuery(result.place_name);
    setIsOpen(false);
    setResults([]);
    setHasUserInteracted(false); // Reset interaction state to prevent dropdown from reopening
    onSelect(result);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search address or property..."
          value={query}
          onChange={(e) => {
            setHasUserInteracted(true);
            setQuery(e.target.value);
          }}
          onFocus={() => {
            setHasUserInteracted(true);
            // Search will be triggered by the useEffect when hasUserInteracted becomes true
          }}
          className="pl-10"
        />
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute z-[1300] w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm flex items-start gap-2"
            >
              {result.type === 'property' && (
                <span className="text-blue-600 font-semibold text-xs mt-0.5">Property</span>
              )}
              <span className="flex-1">{result.place_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

