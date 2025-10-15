-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  job_title TEXT,
  company TEXT,
  location TEXT,
  bio TEXT,
  profile_image_url TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create custom_links table
CREATE TABLE custom_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  "order" INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create social_links table
CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- facebook, instagram, twitter, linkedin, youtube, spotify, etc.
  url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- icon name or URL
  "order" INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create widget_settings table
CREATE TABLE widget_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL, -- profile, bio, links, social, services, contact, map
  enabled BOOLEAN DEFAULT TRUE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, widget_type)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_custom_links_profile_id ON custom_links(profile_id);
CREATE INDEX idx_custom_links_order ON custom_links("order");
CREATE INDEX idx_social_links_profile_id ON social_links(profile_id);
CREATE INDEX idx_services_profile_id ON services(profile_id);
CREATE INDEX idx_services_order ON services("order");
CREATE INDEX idx_widget_settings_profile_id ON widget_settings(profile_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Public can view profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for custom_links
-- Public can view enabled links
CREATE POLICY "Public custom links are viewable by everyone"
  ON custom_links FOR SELECT
  USING (enabled = true);

-- Users can manage their own links
CREATE POLICY "Users can manage their own custom links"
  ON custom_links FOR ALL
  USING (auth.uid() = profile_id);

-- RLS Policies for social_links
-- Public can view enabled social links
CREATE POLICY "Public social links are viewable by everyone"
  ON social_links FOR SELECT
  USING (enabled = true);

-- Users can manage their own social links
CREATE POLICY "Users can manage their own social links"
  ON social_links FOR ALL
  USING (auth.uid() = profile_id);

-- RLS Policies for services
-- Public can view enabled services
CREATE POLICY "Public services are viewable by everyone"
  ON services FOR SELECT
  USING (enabled = true);

-- Users can manage their own services
CREATE POLICY "Users can manage their own services"
  ON services FOR ALL
  USING (auth.uid() = profile_id);

-- RLS Policies for widget_settings
-- Public can view widget settings (to know which widgets to display)
CREATE POLICY "Public widget settings are viewable by everyone"
  ON widget_settings FOR SELECT
  USING (true);

-- Users can manage their own widget settings
CREATE POLICY "Users can manage their own widget settings"
  ON widget_settings FOR ALL
  USING (auth.uid() = profile_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize default widget settings for new profiles
CREATE OR REPLACE FUNCTION initialize_widget_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO widget_settings (profile_id, widget_type, enabled, "order") VALUES
    (NEW.id, 'profile', true, 1),
    (NEW.id, 'bio', true, 2),
    (NEW.id, 'links', true, 3),
    (NEW.id, 'social', true, 4),
    (NEW.id, 'services', true, 5),
    (NEW.id, 'contact', true, 6),
    (NEW.id, 'map', true, 7);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create default widget settings when profile is created
CREATE TRIGGER create_default_widget_settings
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION initialize_widget_settings();

