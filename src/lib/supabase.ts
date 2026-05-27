import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ''

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    global: {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  }
)

export const getStoredSession = () => {
  if (typeof window === "undefined") return null;

  try {
    // 1. Try Supabase expected localStorage key
    const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
    const storageKey = `sb-${projectRef}-auth-token`;
    const rawSession = localStorage.getItem(storageKey);
    
    if (rawSession) {
      return JSON.parse(rawSession);
    }

    // 2. Try clipshift_session backup
    const backupSession = localStorage.getItem("clipshift_session");
    if (backupSession) {
      return JSON.parse(backupSession);
    }
  } catch (e) {
    console.error("Failed to retrieve stored session:", e);
  }

  return null;
};

