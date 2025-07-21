-- Add INSERT policy for profiles table to allow new user registration
CREATE POLICY "Allow profile creation during user registration" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);