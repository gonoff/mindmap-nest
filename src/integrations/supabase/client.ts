// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://figcpczievwvjtqnheqm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpZ2NwY3ppZXZ3dmp0cW5oZXFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NjMyODIsImV4cCI6MjA1MjUzOTI4Mn0.wSdVB0aoFux523SYLZ6-r12PU7bEbpj779iAzCe1r9o";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);