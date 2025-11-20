-- Migration: Add slug/permalink support to advertisements
-- Description: Adds SEO-friendly URL slugs to all advertisements
-- Date: 2025-01-24

-- ============================================================================
-- STEP 1: Add slug column to advertisements table
-- ============================================================================

ALTER TABLE advertisements
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- ============================================================================
-- STEP 2: Create slug generation function
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase
  slug := LOWER(input_text);

  -- Replace spaces and special characters with hyphens
  slug := REGEXP_REPLACE(slug, '[^a-z0-9]+', '-', 'g');

  -- Remove leading/trailing hyphens
  slug := TRIM(BOTH '-' FROM slug);

  -- Limit length to 200 characters
  slug := SUBSTRING(slug FROM 1 FOR 200);

  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- STEP 3: Generate slugs for existing advertisements
-- ============================================================================

-- Update existing ads with generated slugs (title + id for uniqueness)
UPDATE advertisements
SET slug = generate_slug(title) || '-' || id::TEXT
WHERE slug IS NULL;

-- ============================================================================
-- STEP 4: Make slug column NOT NULL and UNIQUE
-- ============================================================================

-- Now that all rows have slugs, make it required and unique
ALTER TABLE advertisements
ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint
ALTER TABLE advertisements
ADD CONSTRAINT advertisements_slug_unique UNIQUE (slug);

-- ============================================================================
-- STEP 5: Create indexes for better performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ads_slug ON advertisements(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ads_slug_active ON advertisements(slug, is_active);

-- ============================================================================
-- STEP 6: Create trigger function to auto-generate slug on INSERT
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if slug is not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Generate base slug from title
    NEW.slug := generate_slug(NEW.title);

    -- For new records (INSERT), we can't add ID yet, so leave it
    -- The application will need to update it after INSERT
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT
DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON advertisements;
CREATE TRIGGER trigger_auto_generate_slug
BEFORE INSERT ON advertisements
FOR EACH ROW
EXECUTE FUNCTION auto_generate_slug();

-- ============================================================================
-- STEP 7: Create function to update slug when title changes
-- ============================================================================

CREATE OR REPLACE FUNCTION update_slug_on_title_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If title changed, regenerate slug (keeping the ID suffix)
  IF OLD.title IS DISTINCT FROM NEW.title THEN
    NEW.slug := generate_slug(NEW.title) || '-' || NEW.id::TEXT;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for UPDATE
DROP TRIGGER IF EXISTS trigger_update_slug_on_title_change ON advertisements;
CREATE TRIGGER trigger_update_slug_on_title_change
BEFORE UPDATE ON advertisements
FOR EACH ROW
EXECUTE FUNCTION update_slug_on_title_change();

-- ============================================================================
-- STEP 8: Helper function to fix slug after INSERT (called from app)
-- ============================================================================

CREATE OR REPLACE FUNCTION finalize_slug(ad_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE advertisements
  SET slug = generate_slug(title) || '-' || id::TEXT
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if migration was successful
SELECT 'Slug migration completed successfully!' as status;

-- Show sample slugs
SELECT id, title, slug, created_at
FROM advertisements
ORDER BY created_at DESC
LIMIT 10;

-- Verify slug column properties
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'advertisements'
  AND column_name = 'slug';

-- Check for any NULL slugs (should be 0)
SELECT COUNT(*) as null_slugs_count
FROM advertisements
WHERE slug IS NULL;

-- Check for duplicate slugs (should be 0)
SELECT slug, COUNT(*) as count
FROM advertisements
GROUP BY slug
HAVING COUNT(*) > 1;

-- Show total ads with slugs
SELECT
  COUNT(*) as total_ads,
  COUNT(slug) as ads_with_slug
FROM advertisements;
