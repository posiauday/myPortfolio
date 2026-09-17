import { createClient } from "@supabase/supabase-js";

/* A dedicated Supabase project for the Clipboard page only — kept
   separate from any other project so this feature's data never mixes
   with anything else. The publishable key below is the client-safe
   key Supabase itself designs for exactly this use (embedded in a
   public static site, not a secret) — real protection for what's
   stored comes from the PIN gate in Clipboard.jsx, not from hiding
   this key. Row Level Security policies on both tables only allow
   what this page actually needs (read/insert on both tables, delete
   on items) — see the clipboard_schema migration. */
const SUPABASE_URL = "https://xfxqulhleipkdpgzpufp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZguDs62SbeGw0Itnry3WQA_DO1XYcJk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
