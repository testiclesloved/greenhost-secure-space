-- Create enum for storage plans
CREATE TYPE public.storage_plan_type AS ENUM ('personal', 'enterprise', 'custom');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'confirmed', 'failed');

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage plans table
CREATE TABLE public.storage_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_type storage_plan_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  storage_gb INTEGER NOT NULL,
  monthly_fee DECIMAL(10,2) NOT NULL,
  one_time_fee DECIMAL(10,2),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user purchases table
CREATE TABLE public.user_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_plan_id UUID NOT NULL REFERENCES public.storage_plans(id),
  payment_status payment_status NOT NULL DEFAULT 'pending',
  amount_paid DECIMAL(10,2) NOT NULL,
  account_number TEXT,
  sftpgo_api_key TEXT,
  company_email TEXT,
  storage_setup_completed BOOLEAN NOT NULL DEFAULT false,
  admin_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage accounts table
CREATE TABLE public.storage_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL REFERENCES public.user_purchases(id) ON DELETE CASCADE,
  account_email TEXT NOT NULL,
  account_password TEXT NOT NULL,
  storage_quota_gb INTEGER NOT NULL,
  setup_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage users table (for sub-users)
CREATE TABLE public.storage_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_account_id UUID NOT NULL REFERENCES public.storage_accounts(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  sftp_link TEXT,
  web_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin settings table
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default storage plans
INSERT INTO public.storage_plans (plan_type, name, storage_gb, monthly_fee, one_time_fee, description) VALUES
('personal', 'Personal', 500, 15000.00, NULL, '500GB+ storage with one-time disk purchase. Monthly fee for internet and maintenance.'),
('enterprise', 'Enterprise', 1000, 15000.00, NULL, '1TB+ storage for businesses. Monthly fee for internet and maintenance.'),
('custom', 'Custom', 10000, 0.00, NULL, '10TB+ custom storage solution. Contact us for pricing and consultation.');

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
('zerotier_network_id', '233ccaac274edbe5'),
('sftpgo_encryption_key', '9__dHEdhjcXhhBlji2aGs1DZvn1p3v6t'),
('sftpgo_tunnel_url', 'https://zda7qzpeeucs.share.zrok.io'),
('admin_key', 'A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W3x4Y5z6A7b8C9d0E1f2G3h4I5j6K7l8M9n0O1p2Q3r4S5t6U7v8W9x0Y1z2A3b4C5d6E7f8G9h0I1j2K3l4M5n6O7p8Q9r0S1t2U3v4W5x6Y7z8');

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (auth.email() = 'emzywoo89@gmail.com');
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (auth.email() = 'emzywoo89@gmail.com');

-- RLS Policies for storage plans
CREATE POLICY "Anyone can view active storage plans" ON public.storage_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage storage plans" ON public.storage_plans FOR ALL USING (auth.email() = 'emzywoo89@gmail.com');

-- RLS Policies for user purchases
CREATE POLICY "Users can view their own purchases" ON public.user_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own purchases" ON public.user_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own purchases" ON public.user_purchases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all purchases" ON public.user_purchases FOR SELECT USING (auth.email() = 'emzywoo89@gmail.com');
CREATE POLICY "Admins can update all purchases" ON public.user_purchases FOR UPDATE USING (auth.email() = 'emzywoo89@gmail.com');

-- RLS Policies for storage accounts
CREATE POLICY "Users can view their own storage accounts" ON public.storage_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own storage accounts" ON public.storage_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own storage accounts" ON public.storage_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all storage accounts" ON public.storage_accounts FOR SELECT USING (auth.email() = 'emzywoo89@gmail.com');

-- RLS Policies for storage users
CREATE POLICY "Users can view their storage users" ON public.storage_users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.storage_accounts sa 
    WHERE sa.id = storage_account_id AND sa.user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage their storage users" ON public.storage_users FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.storage_accounts sa 
    WHERE sa.id = storage_account_id AND sa.user_id = auth.uid()
  )
);

-- RLS Policies for admin settings
CREATE POLICY "Admins can manage settings" ON public.admin_settings FOR ALL USING (auth.email() = 'emzywoo89@gmail.com');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    CASE WHEN NEW.email = 'emzywoo89@gmail.com' THEN 'admin'::user_role ELSE 'user'::user_role END
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_storage_plans_updated_at BEFORE UPDATE ON public.storage_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_purchases_updated_at BEFORE UPDATE ON public.user_purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_storage_accounts_updated_at BEFORE UPDATE ON public.storage_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();