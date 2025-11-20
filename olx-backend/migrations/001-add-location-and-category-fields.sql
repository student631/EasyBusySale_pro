-- Migration: Add location structure and category improvements
-- Description: Adds city, state, zip code, and coordinates to advertisements table
-- Date: 2025-01-XX (Texas Market Launch)

-- ============================================================================
-- ADVERTISEMENTS TABLE - Add Location Fields
-- ============================================================================

-- Add new location columns
ALTER TABLE advertisements
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(50),
ADD COLUMN IF NOT EXISTS state_code VARCHAR(2),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add currency column (for future international expansion)
ALTER TABLE advertisements
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ads_city ON advertisements(city);
CREATE INDEX IF NOT EXISTS idx_ads_state ON advertisements(state_code);
CREATE INDEX IF NOT EXISTS idx_ads_location_active ON advertisements(city, state_code, is_active);
CREATE INDEX IF NOT EXISTS idx_ads_price_range ON advertisements(price) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ads_condition ON advertisements(condition_type) WHERE is_active = true;

-- Add comment to location column
COMMENT ON COLUMN advertisements.location IS 'Legacy location field - kept for backward compatibility. Use city/state for new data';

-- ============================================================================
-- CATEGORIES TABLE - New Table for Category Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  description TEXT,
  color VARCHAR(50), -- Tailwind color class
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for active categories
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active, display_order);

-- ============================================================================
-- SEED CATEGORIES DATA
-- ============================================================================

INSERT INTO categories (name, slug, icon, description, color, display_order, is_active) VALUES
('Cars & Vehicles', 'vehicles', 'Car', 'Cars, trucks, motorcycles, RVs, and auto parts', 'bg-blue-100 text-blue-700', 1, true),
('Real Estate', 'real-estate', 'Home', 'Houses, apartments, land, and commercial properties', 'bg-green-100 text-green-700', 2, true),
('Jobs', 'jobs', 'Briefcase', 'Job opportunities and career listings', 'bg-purple-100 text-purple-700', 3, true),
('Electronics', 'electronics', 'Laptop', 'Computers, phones, TVs, cameras, and gadgets', 'bg-indigo-100 text-indigo-700', 4, true),
('Furniture', 'furniture', 'Armchair', 'Home and office furniture', 'bg-amber-100 text-amber-700', 5, true),
('Business for Sale', 'business', 'TrendingUp', 'Existing businesses, franchises, and commercial opportunities', 'bg-emerald-100 text-emerald-700', 6, true),
('Services', 'services', 'Users', 'Professional services, home services, and contractors', 'bg-red-100 text-red-700', 7, true),
('Pets', 'pets', 'Heart', 'Pets, pet supplies, and pet services', 'bg-pink-100 text-pink-700', 8, true),
('Clothing & Fashion', 'clothing', 'ShoppingBag', 'Clothing, shoes, accessories, and jewelry', 'bg-rose-100 text-rose-700', 9, true),
('Sports & Outdoors', 'sports', 'Dumbbell', 'Sports equipment, fitness gear, and outdoor items', 'bg-cyan-100 text-cyan-700', 10, true),
('Tools & Equipment', 'equipment', 'Wrench', 'Construction tools, machinery, and equipment', 'bg-slate-100 text-slate-700', 11, true),
('Books & Education', 'books', 'BookOpen', 'Books, textbooks, and educational materials', 'bg-violet-100 text-violet-700', 12, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- UPDATE EXISTING DATA - Migrate Location to City/State Format
-- ============================================================================

-- Parse existing location data for Texas cities
-- This is best effort - assumes format "City, State" or "City, TX"

UPDATE advertisements
SET
  city = TRIM(SPLIT_PART(location, ',', 1)),
  state = 'Texas',
  state_code = 'TX'
WHERE location LIKE '%TX%' OR location LIKE '%Texas%';

-- Set Austin as default for records without proper location
UPDATE advertisements
SET
  city = 'Austin',
  state = 'Texas',
  state_code = 'TX'
WHERE city IS NULL AND is_active = true;

-- ============================================================================
-- TEXAS CITIES REFERENCE TABLE (Optional - for autocomplete)
-- ============================================================================

CREATE TABLE IF NOT EXISTS texas_cities (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  county VARCHAR(100),
  population INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_metro BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_texas_cities_name ON texas_cities(city);

-- Seed major Texas cities
INSERT INTO texas_cities (city, county, population, latitude, longitude, is_metro) VALUES
('Austin', 'Travis', 2300000, 30.2672, -97.7431, true),
('Dallas', 'Dallas', 8000000, 32.7767, -96.7970, true),
('Fort Worth', 'Tarrant', 8000000, 32.7555, -97.3308, true),
('Houston', 'Harris', 7500000, 29.7604, -95.3698, true),
('San Antonio', 'Bexar', 2600000, 29.4241, -98.4936, true),
('El Paso', 'El Paso', 680000, 31.7619, -106.4850, false),
('Arlington', 'Tarrant', 400000, 32.7357, -97.1081, false),
('Corpus Christi', 'Nueces', 430000, 27.8006, -97.3964, false),
('Plano', 'Collin', 290000, 33.0198, -96.6989, false),
('Lubbock', 'Lubbock', 330000, 33.5779, -101.8552, false),
('Irving', 'Dallas', 260000, 32.8140, -96.9489, false),
('Laredo', 'Webb', 260000, 27.5306, -99.4803, false),
('Garland', 'Dallas', 240000, 32.9126, -96.6389, false),
('Frisco', 'Collin', 200000, 33.1507, -96.8236, false),
('McKinney', 'Collin', 200000, 33.1972, -96.6397, false)
ON CONFLICT (city) DO NOTHING;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for advertisements table
DROP TRIGGER IF EXISTS update_advertisements_updated_at ON advertisements;
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON advertisements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for categories table
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if migration was successful
SELECT 'Migration completed successfully!' as status;

-- Show column additions
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'advertisements'
  AND column_name IN ('city', 'state', 'state_code', 'zip_code', 'latitude', 'longitude', 'currency')
ORDER BY ordinal_position;

-- Show categories count
SELECT COUNT(*) as categories_count FROM categories WHERE is_active = true;

-- Show Texas cities count
SELECT COUNT(*) as texas_cities_count FROM texas_cities;

-- Show ads with new location data
SELECT
  COUNT(*) as total_ads,
  COUNT(city) as ads_with_city,
  COUNT(state_code) as ads_with_state
FROM advertisements
WHERE is_active = true;
