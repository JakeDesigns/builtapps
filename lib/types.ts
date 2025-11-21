export type Category =
  | 'vacant_lot'
  | 'planned_construction'
  | 'under_construction'
  | 'for_sale_completed'
  | 'pending'
  | 'pending_under_construction'
  | 'sold'
  | 'competitors';

export const CATEGORY_COLORS: Record<Category, string> = {
  vacant_lot: '#8B4513',
  planned_construction: '#93C5FD',
  under_construction: '#3B82F6',
  for_sale_completed: '#10B981',
  pending: '#EF4444',
  pending_under_construction: 'split-red-blue', // handled via CSS gradient
  sold: '#D4AF37',
  competitors: '#000000',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  vacant_lot: 'Vacant Lots',
  planned_construction: 'Planned for Construction',
  under_construction: 'Homes Under Construction',
  for_sale_completed: 'Homes for Sale (Completed)',
  pending: 'Homes Pending',
  pending_under_construction: 'Pending & Under Construction',
  sold: 'Homes Sold',
  competitors: 'Competitors',
};

export interface Property {
  id: string;
  title: string;
  subdivision_phase: string | null;
  lot: string | null;
  block: string | null;
  address: string | null;
  house_name: string | null;
  size_sqft: number | null;
  garage_size: number | null;
  bedrooms: number | null;
  baths: number | null;
  depth: string | null;
  width: string | null;
  building_setbacks: string | null;
  power_box_location: string | null;
  lat: number;
  lng: number;
  category: Category;
  created_at: string;
}

export interface PropertyFormData {
  title: string;
  subdivision_phase?: string;
  lot?: string;
  block?: string;
  address?: string;
  house_name?: string;
  size_sqft?: number;
  garage_size?: number;
  bedrooms?: number;
  baths?: number;
  depth?: string;
  width?: string;
  building_setbacks?: string;
  power_box_location?: string;
  lat: number;
  lng: number;
  category: Category;
}

