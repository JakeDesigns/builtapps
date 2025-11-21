import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 
        'NOT SET',
    },
    connection: {
      status: 'unknown',
      error: null,
    },
    database: {
      tableExists: false,
      canQuery: false,
      error: null,
    },
  };

  try {
    // Test 1: Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      diagnostics.connection.status = 'failed';
      diagnostics.connection.error = 'Missing environment variables';
      return NextResponse.json(diagnostics, { status: 500 });
    }

    // Test 1.5: Try to reach Supabase REST endpoint directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    try {
      const healthCheck = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
      });
      diagnostics.connection.httpStatus = healthCheck.status;
      diagnostics.connection.httpStatusText = healthCheck.statusText;
      if (!healthCheck.ok) {
        diagnostics.connection.status = 'failed';
        diagnostics.connection.error = `HTTP ${healthCheck.status}: ${healthCheck.statusText}`;
      }
    } catch (fetchError: any) {
      diagnostics.connection.status = 'failed';
      diagnostics.connection.error = `Network error: ${fetchError.message}`;
      diagnostics.connection.suggestion = 'Check if your Supabase project is active. Free tier projects pause after inactivity. Go to https://supabase.com/dashboard to reactivate.';
      return NextResponse.json(diagnostics, { status: 500 });
    }

    // Test 2: Try to query the properties table
    const { data, error } = await supabase
      .from('properties')
      .select('id')
      .limit(1);

    if (error) {
      diagnostics.connection.status = 'connected';
      diagnostics.database.canQuery = false;
      diagnostics.database.error = {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      };

      // Check if it's a table not found error
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        diagnostics.database.tableExists = false;
        diagnostics.database.error.suggestion = 'Run the SQL migration: supabase/migrations/001_create_properties_table.sql';
      } else if (error.code === '42501' || error.message?.includes('permission denied')) {
        diagnostics.database.tableExists = true; // Table exists but no permission
        diagnostics.database.error.suggestion = 'Check Row Level Security (RLS) policies in Supabase dashboard';
      }
    } else {
      diagnostics.connection.status = 'connected';
      diagnostics.database.canQuery = true;
      diagnostics.database.tableExists = true;
      diagnostics.database.rowCount = data?.length || 0;
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    diagnostics.connection.status = 'failed';
    diagnostics.connection.error = error instanceof Error ? error.message : String(error);
    return NextResponse.json(diagnostics, { status: 500 });
  }
}

