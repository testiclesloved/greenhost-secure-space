-- Add user activity tracking and account locking system
ALTER TABLE profiles ADD COLUMN is_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN lock_reason TEXT;
ALTER TABLE profiles ADD COLUMN locked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN login_attempts INTEGER DEFAULT 0;

-- Create user activity log table
CREATE TABLE public.user_activity_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user activity logs
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for user activity logs
CREATE POLICY "Admins can view all activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (auth.email() = 'emzywoo89@gmail.com'::text);

CREATE POLICY "Users can view their own activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" 
ON public.user_activity_logs 
FOR INSERT 
WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);
CREATE INDEX idx_profiles_is_locked ON public.profiles(is_locked);

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
    p_user_id UUID,
    p_action TEXT,
    p_details JSONB DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.user_activity_logs (
        user_id, 
        action, 
        details, 
        ip_address, 
        user_agent
    )
    VALUES (
        p_user_id, 
        p_action, 
        p_details, 
        p_ip_address, 
        p_user_agent
    )
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$;