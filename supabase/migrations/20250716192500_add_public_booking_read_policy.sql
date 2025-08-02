-- Add public read access for booking availability checking
-- This allows anonymous users to view bookings for availability purposes
-- while maintaining security for booking creation/updates

CREATE POLICY "Anyone can view booking availability" ON public.bookings
    FOR SELECT USING (true);
