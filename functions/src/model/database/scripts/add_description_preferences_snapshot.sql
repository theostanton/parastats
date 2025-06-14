-- Add description_preferences_snapshot column to flights table
ALTER TABLE flights ADD COLUMN description_preferences_snapshot jsonb;