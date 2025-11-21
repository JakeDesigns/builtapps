# Authentication Quick Start Guide

## 🚀 Getting Started (2 Minutes)

### Step 1: Enable Email Auth in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Authentication** → **Providers**
4. Ensure **Email** is enabled
5. (Optional for testing) Disable email confirmations:
   - Go to **Authentication** → **Settings** → **Email Auth**
   - Uncheck "Enable email confirmations"

### Step 2: Start Your App

```bash
npm run dev
```

### Step 3: Test Authentication

1. Visit `http://localhost:3000`
2. You'll be redirected to `/login`
3. Click **"Sign up"**
4. Create an account with:
   - Email: `test@example.com`
   - Password: `password123` (min 6 chars)
5. You'll be logged in and redirected to home page
6. See your email in the top-right corner
7. Click the logout icon to log out

**That's it! Your app is now protected.**

---

## 📁 What Was Added

```
├── lib/
│   ├── supabase/
│   │   └── auth-client.ts          ← Auth-enabled Supabase client
│   └── auth/
│       └── AuthContext.tsx         ← Auth state management
├── app/
│   ├── login/
│   │   └── page.tsx                ← Login page
│   ├── signup/
│   │   └── page.tsx                ← Signup page
│   └── layout.tsx                  ← Updated with AuthProvider
├── middleware.ts                    ← NEW: Route protection
└── components/
    └── layout/
        └── TopBar.tsx              ← Updated with logout
```

---

## 🔐 Quick Code Examples

### Check if User is Logged In

```typescript
'use client';
import { useAuth } from '@/lib/auth/AuthContext';

export default function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return <div>Welcome, {user.email}!</div>;
}
```

### Log Out Programmatically

```typescript
const { signOut } = useAuth();

// Call this anywhere
await signOut();
```

### Get User Info

```typescript
const { user, session } = useAuth();

console.log(user?.id);        // User UUID
console.log(user?.email);     // User email
console.log(session?.access_token); // JWT token
```

---

## 🛡️ What's Protected

### Protected (Requires Login):
- ✅ `/` (home page)
- ✅ All other pages

### Public (No Login Required):
- 🌐 `/login`
- 🌐 `/signup`
- 🌐 `/api/*` (API routes)

---

## 🎨 Customization

### Change Minimum Password Length

**File:** `app/signup/page.tsx`

```typescript
if (password.length < 8) { // Change 6 to 8
  setError('Password must be at least 8 characters');
  return;
}
```

### Add More Routes to Protection

**File:** `middleware.ts`

Middleware already protects all routes except `/login` and `/signup`.

To exclude more routes:

```typescript
const publicRoutes = ['/login', '/signup', '/about', '/help'];
```

### Change Where Users Go After Login

**File:** `lib/auth/AuthContext.tsx`

```typescript
if (event === 'SIGNED_IN') {
  router.push('/dashboard'); // Change '/' to your desired route
}
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Redirected to login immediately after signup | Email confirmation is enabled. Check email or disable in Supabase settings |
| "Invalid login credentials" | Wrong email/password or user doesn't exist |
| Can't access Supabase | Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| TypeScript errors | Run `npm install` to ensure all dependencies are installed |

---

## 📚 More Information

For detailed documentation, see **`AUTH_IMPLEMENTATION.md`**

Topics covered:
- How authentication works
- Using auth in components
- Protecting API routes
- Advanced customization
- Security best practices
- Optional enhancements (OAuth, password reset, etc.)

---

## ✅ Checklist

- [ ] Email auth enabled in Supabase
- [ ] Email confirmation disabled (for testing)
- [ ] Created test account
- [ ] Logged in successfully
- [ ] Logged out successfully
- [ ] Verified route protection works
- [ ] Checked user info displays in TopBar

**All done? Your authentication system is ready!** 🎉

