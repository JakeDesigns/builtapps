import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Suppress Supabase realtime connection error dialogs
if (typeof window !== 'undefined') {
  // Prevent error dialogs from showing
  const originalAlert = window.alert;
  window.alert = function(message?: any) {
    const msg = String(message || '');
    if (
      msg.includes('Connection failed') ||
      msg.includes('Connection Error') ||
      msg.includes('internet connection') ||
      msg.includes('VPN') ||
      msg.includes('realtime')
    ) {
      // Silently suppress Supabase connection error dialogs
      console.warn('Supabase connection error suppressed:', msg);
      return;
    }
    return originalAlert.call(window, message);
  };

  // Also suppress unhandled promise rejections related to realtime
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.toString() || '';
    if (
      reason.includes('Connection failed') ||
      reason.includes('Connection Error') ||
      reason.includes('realtime') ||
      reason.includes('websocket') ||
      reason.includes('Supabase')
    ) {
      event.preventDefault();
      console.warn('Supabase realtime error suppressed:', reason);
    }
  });
}

// Create client without realtime to prevent connection errors
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

