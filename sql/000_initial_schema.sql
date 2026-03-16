-- Supabase Initial Schema
-- Run this SQL to set up a fresh journals database
-- This is the complete schema for new database creation (no legacy columns)

-- Create journals table
CREATE TABLE IF NOT EXISTS journals (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date TEXT NOT NULL,
  title TEXT,
  text TEXT,
  categories TEXT,
  pinned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create index on created_at for sorting newest first
CREATE INDEX IF NOT EXISTS journals_created_at_idx ON journals(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

-- Create policy allowing all reads
CREATE POLICY "Enable read access for all users" ON journals
  FOR SELECT
  USING (true);

-- Create policy allowing all writes
CREATE POLICY "Enable insert/update/delete for all users" ON journals
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Create policies by user ID (uncomment if using Supabase Auth)
-- CREATE POLICY "Users can manage their own journals" ON journals
--   FOR ALL
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);
