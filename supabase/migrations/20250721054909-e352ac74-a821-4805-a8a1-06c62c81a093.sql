-- Fix the foreign key relationship for user_purchases -> profiles
-- Since user_purchases.user_id should reference auth.users, but we want to join with profiles
-- Add a foreign key constraint to ensure data integrity
ALTER TABLE public.user_purchases 
ADD CONSTRAINT fk_user_purchases_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;