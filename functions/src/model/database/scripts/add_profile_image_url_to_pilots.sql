-- Migration to add profile_image_url column to pilots table
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS profile_image_url TEXT;