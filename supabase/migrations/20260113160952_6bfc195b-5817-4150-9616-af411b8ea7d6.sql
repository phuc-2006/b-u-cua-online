-- Create a function to handle room cleanup and host transfer when a player leaves
CREATE OR REPLACE FUNCTION public.handle_player_leave()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    remaining_count INTEGER;
    new_host_id UUID;
    room_host_id UUID;
BEGIN
    -- Get the current host of the room
    SELECT host_id INTO room_host_id
    FROM public.rooms
    WHERE id = OLD.room_id;
    
    -- Count remaining players in the room
    SELECT COUNT(*) INTO remaining_count
    FROM public.room_players
    WHERE room_id = OLD.room_id;
    
    -- If no players remaining, delete the room
    IF remaining_count = 0 THEN
        DELETE FROM public.rooms WHERE id = OLD.room_id;
        RETURN OLD;
    END IF;
    
    -- If the leaving player was the host, transfer to another player
    IF OLD.user_id = room_host_id THEN
        -- Get the first remaining player (oldest by joined_at)
        SELECT user_id INTO new_host_id
        FROM public.room_players
        WHERE room_id = OLD.room_id
        ORDER BY joined_at ASC
        LIMIT 1;
        
        -- Update the room with new host
        IF new_host_id IS NOT NULL THEN
            UPDATE public.rooms
            SET host_id = new_host_id, updated_at = now()
            WHERE id = OLD.room_id;
        END IF;
    END IF;
    
    RETURN OLD;
END;
$$;

-- Create trigger that fires AFTER a player is deleted from room_players
DROP TRIGGER IF EXISTS on_player_leave ON public.room_players;
CREATE TRIGGER on_player_leave
    AFTER DELETE ON public.room_players
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_player_leave();