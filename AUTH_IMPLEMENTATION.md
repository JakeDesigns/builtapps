# Authentication Implementation Guide

## Overview

This guide documents the authentication system added to your Next.js 13+ property listings application using Supabase Auth. The implementation protects your app pages while preserving all existing functionality.

## What Was Added

### 1. New Files Created

#### Authentication Core
- **`lib/supabase/auth-client.ts`** - Supabase client with session persistence enabled for authentication
- **`lib/auth/AuthContext.tsx`** - React Context Provider for managing auth state across the app

#### Auth Pages
- **`app/signup/page.tsx`** - User registration page with email/password
- **`app/login/page.tsx`** - User login page

#### Middleware
- **`middleware.ts`** - Route protection middleware that redirects unauthenticated users to `/login`

### 2. Modified Files

#### Layout
- **`app/layout.tsx`** - Wrapped with `AuthProvider` to provide auth state to all components

#### Top Bar
- **`components/layout/TopBar.tsx`** - Added user email display and logout button (desktop and mobile)

### 3. New Dependencies
- `@supabase/ssr` - For server-side rendering and middleware support

---

## How It Works

### Authentication Flow

1. **User visits the app** → Middleware checks for active session
2. **No session found** → Redirect to `/login`
3. **User logs in/signs up** → Supabase creates session
4. **Session stored** → In browser's localStorage (automatic)
5. **User redirected** → To home page (`/`)
6. **User can access** → All protected pages
7. **User logs out** → Session cleared, redirected to `/login`

### Protected vs Public Routes

**Protected Routes** (require authentication):
- `/` (home page)
- `/test-page`
- All other pages except login/signup

**Public Routes** (no authentication required):
- `/login`
- `/signup`
- `/api/*` (API routes are not protected by middleware)

---

## Using Authentication in Your Code

### Check if User is Logged In

In any component, import and use the `useAuth` hook:

```typescript
'use client';

import { useAuth } from '@/lib/auth/AuthContext';

export default function MyComponent() {
  const { user, session, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      <p>User ID: {user.id}</p>
    </div>
  );
}
```

### Get Current User Info

```typescript
const { user } = useAuth();

// User object contains:
// - user.id (UUID)
// - user.email
// - user.created_at
// - user.user_metadata (custom data)
```

### Manually Log Out

```typescript
const { signOut } = useAuth();

// Call this function
await signOut();
// User will be redirected to /login automatically
```

### Protect an API Route

If you want to protect API routes (currently not protected), add this to your route handler:

```typescript
// app/api/protected-route/route.ts
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

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // User is authenticated, proceed with your logic
  return NextResponse.json({ message: 'Success', userId: session.user.id });
}
```

---

## Testing the Authentication

### 1. Enable Email Auth in Supabase (If Not Already Enabled)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Make sure **Email** provider is enabled
4. **Disable** email confirmation for development (optional):
   - Go to **Authentication** → **Settings**
   - Uncheck "Enable email confirmations"

### 2. Test Sign Up

1. Start your dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. You'll be redirected to `/login`
4. Click "Sign up"
5. Enter email and password (min. 6 characters)
6. If email confirmation is disabled, you'll be logged in immediately
7. If enabled, check your email for confirmation link

### 3. Test Login

1. Visit `http://localhost:3000/login`
2. Enter your credentials
3. Click "Log In"
4. You'll be redirected to home page

### 4. Test Logout

1. Look for your email in the top right (desktop) or menu (mobile)
2. Click the logout icon (desktop) or "Log Out" button (mobile)
3. You'll be redirected to `/login`

### 5. Test Route Protection

1. Log out
2. Try to access `http://localhost:3000` directly
3. You'll be redirected to `/login`

---

## Environment Variables

The authentication uses your existing Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**No new environment variables are needed!**

---

## Customization

### Change Password Requirements

Edit `app/signup/page.tsx` and `app/login/page.tsx`:

```typescript
// Change minimum password length
if (password.length < 8) { // Change from 6 to 8
  setError('Password must be at least 8 characters');
  return;
}
```

### Add More User Fields

Modify the signup form to include additional fields:

```typescript
// In app/signup/page.tsx
const { data, error } = await supabaseAuth.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: fullName, // Add custom fields here
      phone: phoneNumber,
    },
  },
});
```

Access custom fields:

```typescript
const { user } = useAuth();
const fullName = user?.user_metadata?.full_name;
```

### Customize Redirect Behavior

Edit `lib/auth/AuthContext.tsx`:

```typescript
// Change where users go after login
if (event === 'SIGNED_IN') {
  router.push('/dashboard'); // Change from '/' to '/dashboard'
}

// Change where users go after logout
if (event === 'SIGNED_OUT') {
  router.push('/goodbye'); // Change from '/login'
}
```

### Add Loading Screen During Auth Check

Edit `app/layout.tsx`:

```typescript
'use client';

import { useAuth } from '@/lib/auth/AuthContext';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

// Then wrap children with AuthWrapper
```

---

## Troubleshooting

### Issue: "Cannot reach auth server"

**Solution**: Check that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct in `.env.local`

### Issue: "Email already registered"

**Solution**: The user already exists. Use `/login` instead or use a different email.

### Issue: "Please confirm your email"

**Solution**: 
1. Check your email for confirmation link from Supabase
2. Or disable email confirmation in Supabase dashboard (Settings → Email Auth → Uncheck "Enable email confirmations")

### Issue: Redirected to login immediately after signup

**Solution**: Email confirmation is likely enabled. Check your email or disable confirmations in Supabase settings.

### Issue: User stays logged in after closing browser

**Solution**: This is expected behavior. Session is stored in localStorage. To change this, edit `lib/supabase/auth-client.ts`:

```typescript
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Change to false for session-only auth
    autoRefreshToken: true,
  },
});
```

### Issue: TypeScript errors about User type

**Solution**: Import the correct type:

```typescript
import { User } from '@supabase/supabase-js';
```

---

## Security Best Practices

1. **Never expose service_role_key on the client** - Only use `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. **Use Row Level Security (RLS)** in Supabase for your tables
3. **Validate user input** on both client and server
4. **Use HTTPS in production** (automatic on Vercel/Netlify)
5. **Set up proper email templates** in Supabase for production

---

## Next Steps (Optional Enhancements)

### Add Password Reset
1. Create `/forgot-password` page
2. Use `supabaseAuth.auth.resetPasswordForEmail(email)`
3. Handle reset token in callback page

### Add OAuth Providers
1. Enable Google/GitHub in Supabase dashboard
2. Add OAuth buttons to login/signup pages
3. Use `supabaseAuth.auth.signInWithOAuth({ provider: 'google' })`

### Add User Profiles
1. Create `profiles` table in Supabase
2. Set up RLS policies
3. Create profile page to edit user info

### Add Role-Based Access Control (RBAC)
1. Add `role` field to user metadata or profiles table
2. Check role in components/pages
3. Protect admin routes with role checks

---

## Summary

✅ Email/password authentication added
✅ Login and signup pages created
✅ All pages protected (except login/signup)
✅ User info displayed in TopBar
✅ Logout functionality added
✅ Existing code and features preserved
✅ No breaking changes to current functionality

Your app now requires authentication while keeping all existing features intact!

