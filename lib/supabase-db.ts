import { supabase } from './supabase';

// Types
export interface Journal {
  id: number;
  date: string;
  title: string;
  text: string;
  categories: string; // JSON string
  pinned: number;
  created_at?: string;
  updated_at?: string;
}

// Database operations class
class SupabaseDB {
  private tableName = 'journals';

  // Initialize database tables (creates table if it doesn't exist)
  async init() {
    try {
      // Check if table exists by querying it
      const { error } = await supabase
        .from(this.tableName)
        .select('id')
        .limit(1);

      // If table doesn't exist, it will have an error
      if (error && error.code === 'PGRST116') {
        console.warn('Table does not exist. Please create the journals table manually in Supabase.');
        console.warn('See migration guide in the documentation.');
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  /**
   * Insert a new journal entry
   */
  async insert(
    date: string,
    title: string,
    text: string,
    categories: string,
    pinned: number = 0
  ): Promise<Journal | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          date,
          title,
          text,
          categories,
          pinned,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Journal;
    } catch (error) {
      console.error('Insert failed:', error);
      throw error;
    }
  }

  /**
   * Get all journals ordered by created_at descending
   */
  async selectAll(): Promise<Journal[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Journal[]) || [];
    } catch (error) {
      console.error('Select all failed:', error);
      throw error;
    }
  }

  /**
   * Get a single journal by ID
   */
  async selectById(id: number): Promise<Journal | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Not found
        return null;
      }

      if (error) throw error;
      return data as Journal;
    } catch (error) {
      console.error('Select by ID failed:', error);
      throw error;
    }
  }

  /**
   * Update a journal entry
   */
  async update(
    id: number,
    date: string,
    title: string,
    text: string,
    categories: string,
    pinned: number
  ): Promise<Journal | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          date,
          title,
          text,
          categories,
          pinned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Journal;
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }

  /**
   * Delete a journal entry
   */
  async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  /**
   * Toggle pinned status
   */
  async togglePinned(id: number): Promise<Journal | null> {
    try {
      // First get the current pinned status
      const journal = await this.selectById(id);
      if (!journal) return null;

      const newPinned = journal.pinned ? 0 : 1;

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          pinned: newPinned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Journal;
    } catch (error) {
      console.error('Toggle pinned failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const db = new SupabaseDB();

// Export for convenience
export default db;
