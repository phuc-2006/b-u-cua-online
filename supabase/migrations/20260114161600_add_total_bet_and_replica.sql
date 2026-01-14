-- Add total_bet column to track each player's bet for display
ALTER TABLE room_players 
ADD COLUMN IF NOT EXISTS total_bet bigint DEFAULT 0;

-- Enable REPLICA IDENTITY FULL for reliable UPDATE events in realtime
-- This ensures Supabase sends complete row data on UPDATE events
ALTER TABLE public.room_players REPLICA IDENTITY FULL;
