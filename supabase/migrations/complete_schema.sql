-- ============================================
-- COMPLETE SCHEMA MIGRATION FOR BUSINESS CARD APP
-- Multi-card support with visibility controls
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (Multi-card support)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  card_name TEXT NOT NULL DEFAULT 'My Card',
  is_primary BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
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

-- ============================================
-- CUSTOM LINKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS custom_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  "order" INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SOCIAL LINKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- facebook, instagram, twitter, linkedin, youtube, spotify, etc.
  url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  bullets JSONB,
  icon TEXT, -- icon name or URL
  "order" INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WIDGET SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS widget_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL, -- profile, bio, links, social, services, contact, map
  enabled BOOLEAN DEFAULT TRUE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, widget_type)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_is_primary ON profiles(is_primary);
CREATE INDEX IF NOT EXISTS idx_custom_links_profile_id ON custom_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_custom_links_order ON custom_links("order");
CREATE INDEX IF NOT EXISTS idx_social_links_profile_id ON social_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_services_profile_id ON services(profile_id);
CREATE INDEX IF NOT EXISTS idx_services_order ON services("order");
CREATE INDEX IF NOT EXISTS idx_widget_settings_profile_id ON widget_settings(profile_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR PROFILES
-- ============================================

-- Public can view public profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (is_public = true);

-- Users can view all their own profiles (public and private)
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
CREATE POLICY "Users can view their own profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profiles
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;
CREATE POLICY "Users can delete their own profiles"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR CUSTOM LINKS
-- ============================================

-- Public can view enabled links from public profiles
DROP POLICY IF EXISTS "Public custom links are viewable by everyone" ON custom_links;
CREATE POLICY "Public custom links are viewable by everyone"
  ON custom_links FOR SELECT
  USING (
    enabled = true AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = custom_links.profile_id 
      AND profiles.is_public = true
    )
  );

-- Users can view all their own custom links
DROP POLICY IF EXISTS "Users can view their own custom links" ON custom_links;
CREATE POLICY "Users can view their own custom links"
  ON custom_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = custom_links.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Users can manage their own custom links
DROP POLICY IF EXISTS "Users can manage their own custom links" ON custom_links;
CREATE POLICY "Users can manage their own custom links"
  ON custom_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = custom_links.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES FOR SOCIAL LINKS
-- ============================================

-- Public can view enabled social links from public profiles
DROP POLICY IF EXISTS "Public social links are viewable by everyone" ON social_links;
CREATE POLICY "Public social links are viewable by everyone"
  ON social_links FOR SELECT
  USING (
    enabled = true AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = social_links.profile_id 
      AND profiles.is_public = true
    )
  );

-- Users can view all their own social links
DROP POLICY IF EXISTS "Users can view their own social links" ON social_links;
CREATE POLICY "Users can view their own social links"
  ON social_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = social_links.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Users can manage their own social links
DROP POLICY IF EXISTS "Users can manage their own social links" ON social_links;
CREATE POLICY "Users can manage their own social links"
  ON social_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = social_links.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES FOR SERVICES
-- ============================================

-- Public can view enabled services from public profiles
DROP POLICY IF EXISTS "Public services are viewable by everyone" ON services;
CREATE POLICY "Public services are viewable by everyone"
  ON services FOR SELECT
  USING (
    enabled = true AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = services.profile_id 
      AND profiles.is_public = true
    )
  );

-- Users can view all their own services
DROP POLICY IF EXISTS "Users can view their own services" ON services;
CREATE POLICY "Users can view their own services"
  ON services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = services.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Users can manage their own services
DROP POLICY IF EXISTS "Users can manage their own services" ON services;
CREATE POLICY "Users can manage their own services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = services.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES FOR WIDGET SETTINGS
-- ============================================

-- Public can view widget settings for public profiles
DROP POLICY IF EXISTS "Public widget settings are viewable by everyone" ON widget_settings;
CREATE POLICY "Public widget settings are viewable by everyone"
  ON widget_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = widget_settings.profile_id 
      AND profiles.is_public = true
    )
  );

-- Users can view their own widget settings
DROP POLICY IF EXISTS "Users can view their own widget settings" ON widget_settings;
CREATE POLICY "Users can view their own widget settings"
  ON widget_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = widget_settings.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Users can manage their own widget settings
DROP POLICY IF EXISTS "Users can manage their own widget settings" ON widget_settings;
CREATE POLICY "Users can manage their own widget settings"
  ON widget_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = widget_settings.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_default_widget_settings ON profiles;

-- Trigger to create default widget settings when profile is created
CREATE TRIGGER create_default_widget_settings
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION initialize_widget_settings();

-- Function to ensure only one primary card per user
CREATE OR REPLACE FUNCTION ensure_single_primary_card()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a card as primary, unset all other primary cards for this user
  IF NEW.is_primary = true THEN
    UPDATE profiles 
    SET is_primary = false 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id 
    AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_single_primary ON profiles;

-- Trigger to ensure only one primary card per user
CREATE TRIGGER ensure_single_primary
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_card();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE profiles IS 'User business card profiles - supports multiple cards per user';
COMMENT ON COLUMN profiles.user_id IS 'References auth.users - allows multiple cards per user';
COMMENT ON COLUMN profiles.card_name IS 'Name/label for this specific card (e.g., Professional, Freelance)';
COMMENT ON COLUMN profiles.is_primary IS 'Whether this is the users primary/default card';
COMMENT ON COLUMN profiles.is_public IS 'Whether this card appears in the public directory';
COMMENT ON COLUMN services.bullets IS 'Array of up to 3 bullet points for the service, stored as JSON';

