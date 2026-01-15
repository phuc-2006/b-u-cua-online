-- Allow host to update room_players rows (reset is_ready, total_bet)
-- This is needed for handleStartGame/handleNewRound to reset all players' ready status
CREATE POLICY "Host can update players in their room"
ON public.room_players FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.rooms 
        WHERE rooms.id = room_players.room_id 
        AND rooms.host_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.rooms 
        WHERE rooms.id = room_players.room_id 
        AND rooms.host_id = auth.uid()
    )
);
