# Authentication Code Examples

This document contains copy-paste ready code examples for common authentication scenarios.

---

## Table of Contents

1. [Display User Info](#1-display-user-info)
2. [Conditional Rendering Based on Auth](#2-conditional-rendering-based-on-auth)
3. [Protected Component](#3-protected-component)
4. [Custom Login Button](#4-custom-login-button)
5. [Protected API Route](#5-protected-api-route)
6. [User-Specific Data Query](#6-user-specific-data-query)
7. [Add User ID to New Records](#7-add-user-id-to-new-records)
8. [Check Auth Status](#8-check-auth-status)
9. [Loading State During Auth Check](#9-loading-state-during-auth-check)
10. [Redirect Unauthenticated Users](#10-redirect-unauthenticated-users)

---

## 1. Display User Info

Show logged-in user's email anywhere in your app:

```typescript
'use client';

import { useAuth } from '@/lib/auth/AuthContext';

export default function UserDisplay() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
        {user.email?.[0].toUpperCase()}
      </div>
      <span>{user.email}</span>
    </div>
  );
}
```

---

## 2. Conditional Rendering Based on Auth

Show different content for logged-in vs logged-out users:

```typescript
'use client';

import { useAuth } from '@/lib/auth/AuthContext';

export default function ConditionalContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome back, {user.email}!</h1>
          <p>You have access to premium features.</p>
        </div>
      ) : (
        <div>
          <h1>Welcome, Guest!</h1>
          <p>Please log in to access premium features.</p>
        </div>
      )}
    </div>
  );
}
```

---

## 3. Protected Component

Component that only renders for authenticated users:

```typescript
'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedComponent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Only authenticated users can see this.</p>
    </div>
  );
}
```

---

## 4. Custom Login Button

Add a custom login/logout button anywhere:

```typescript
'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AuthButton() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (user) {
    return (
      <Button onClick={signOut} variant="outline">
        Log Out
      </Button>
    );
  }

  return (
    <Button onClick={() => router.push('/login')}>
      Log In
    </Button>
  );
}
```

---

## 5. Protected API Route

Create an API route that requires authentication:

```typescript
// app/api/protected-data/route.ts

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // User is authenticated - return protected data
  return NextResponse.json({
    message: 'This is protected data',
    userId: session.user.id,
    userEmail: session.user.email,
  });
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await request.json();

  // Process the request with authenticated user
  return NextResponse.json({
    success: true,
    userId: session.user.id,
    data: body,
  });
}
```

---

## 6. User-Specific Data Query

Query data that belongs to the logged-in user:

```typescript
'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useEffect, useState } from 'react';
import { supabaseAuth } from '@/lib/supabase/auth-client';

export default function MyProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserProperties = async () => {
      try {
        const { data, error } = await supabaseAuth
          .from('properties')
          .select('*')
          .eq('user_id', user.id) // Filter by user_id
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProperties(data || []);
      } catch (err) {
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProperties();
  }, [user]);

  if (!user) {
    return <div>Please log in to see your properties.</div>;
  }

  if (loading) {
    return <div>Loading your properties...</div>;
  }

  return (
    <div>
      <h1>My Properties</h1>
      {properties.length === 0 ? (
        <p>You haven't added any properties yet.</p>
      ) : (
        <ul>
          {properties.map((property: any) => (
            <li key={property.id}>{property.address}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Note:** This requires adding a `user_id` column to your properties table.

---

## 7. Add User ID to New Records

Automatically add the user's ID when creating records:

```typescript
'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { supabaseAuth } from '@/lib/supabase/auth-client';
import { useState } from 'react';

export default function CreateProperty() {
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { data, error } = await supabaseAuth
        .from('properties')
        .insert([
          {
            address,
            user_id: user.id, // Add user ID to the record
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;

      alert('Property created successfully!');
      setAddress('');
    } catch (err) {
      console.error('Error creating property:', err);
      alert('Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to create properties.</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Property address"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Property'}
      </button>
    </form>
  );
}
```

---

## 8. Check Auth Status

Simple function to check if user is authenticated:

```typescript
'use client';

import { useAuth } from '@/lib/auth/AuthContext';

export function useIsAuthenticated() {
  const { user, loading } = useAuth();
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
  };
}

// Usage in any component:
export default function MyComponent() {
  const { isAuthenticated, isLoading } = useIsAuthenticated();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>You are logged in</div>
      ) : (
        <div>You are not logged in</div>
      )}
    </div>
  );
}
```

---

## 9. Loading State During Auth Check

Show a loading screen while checking authentication:

```typescript
'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { ReactNode } from 'react';

export default function AuthLoadingWrapper({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Usage in layout or page:
<AuthLoadingWrapper>
  <YourContent />
</AuthLoadingWrapper>
```

---

## 10. Redirect Unauthenticated Users

Custom hook to redirect if not authenticated:

```typescript
'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRequireAuth(redirectUrl = '/login') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);

  return { user, loading };
}

// Usage in any component:
export default function ProtectedPage() {
  const { user, loading } = useRequireAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return null; // Will redirect

  return <div>Protected content for {user.email}</div>;
}
```

---

## Database Schema Example

If you want to add user-specific data, add a `user_id` column to your tables:

```sql
-- Add user_id column to properties table
ALTER TABLE properties
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add index for faster queries
CREATE INDEX properties_user_id_idx ON properties(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own properties
CREATE POLICY "Users can view own properties"
ON properties FOR SELECT
USING (auth.uid() = user_id);

-- Create policy: Users can insert their own properties
CREATE POLICY "Users can insert own properties"
ON properties FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own properties
CREATE POLICY "Users can update own properties"
ON properties FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy: Users can delete their own properties
CREATE POLICY "Users can delete own properties"
ON properties FOR DELETE
USING (auth.uid() = user_id);
```

---

## TypeScript Types

Useful TypeScript types for authentication:

```typescript
import { User, Session } from '@supabase/supabase-js';

// Auth context type
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Component props that need auth
interface AuthenticatedComponentProps {
  user: User;
}

// Optional auth props
interface OptionalAuthProps {
  user?: User | null;
}
```

---

## Next Steps

1. Copy any example you need
2. Adjust to your specific use case
3. Test thoroughly
4. See `AUTH_IMPLEMENTATION.md` for more details

Happy coding! 🚀

