import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          links: string[];
          image_url: string | null;
          quadrant: 'immediate' | 'today' | 'week' | 'month';
          completed: boolean;
          created_at: string;
          completed_at: string | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          links?: string[];
          image_url?: string | null;
          quadrant: 'immediate' | 'today' | 'week' | 'month';
          completed?: boolean;
          created_at?: string;
          completed_at?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          links?: string[];
          image_url?: string | null;
          quadrant?: 'immediate' | 'today' | 'week' | 'month';
          completed?: boolean;
          created_at?: string;
          completed_at?: string | null;
          user_id?: string;
        };
      };
    };
  };
};