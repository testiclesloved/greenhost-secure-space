-- Add one_time_fee column to storage_plans if it doesn't exist
ALTER TABLE storage_plans ADD COLUMN IF NOT EXISTS one_time_fee NUMERIC DEFAULT 0;

-- Insert admin settings for payment details if they don't exist
INSERT INTO admin_settings (setting_key, setting_value) VALUES 
('bank_name', 'Opay')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO admin_settings (setting_key, setting_value) VALUES 
('account_number', '8109595054')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO admin_settings (setting_key, setting_value) VALUES 
('account_name', 'UCHECHUKWU EMMANUEL')
ON CONFLICT (setting_key) DO NOTHING;