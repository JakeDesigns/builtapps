'use server';

import { PropertyFormData } from '@/lib/types';

export async function addProperty(formData: PropertyFormData) {
  const adminToken = process.env.ADMIN_TOKEN;
  
  if (!adminToken) {
    throw new Error('Admin token not configured');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/properties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': adminToken,
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add property');
  }

  return await response.json();
}

