-- Add api_key column to storage_accounts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='storage_accounts' AND column_name='api_key') THEN
        ALTER TABLE public.storage_accounts ADD COLUMN api_key text;
    END IF;
END $$;

-- Add zerotier_connected column to profiles table to track first-time setup
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='zerotier_connected') THEN
        ALTER TABLE public.profiles ADD COLUMN zerotier_connected boolean DEFAULT false;
    END IF;
END $$;