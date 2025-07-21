
-- Remove the free trial plan
DELETE FROM public.storage_plans 
WHERE name = 'Free Trial';
