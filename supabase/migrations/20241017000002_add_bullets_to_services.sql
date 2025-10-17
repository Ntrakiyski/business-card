-- Add bullets field to services table
ALTER TABLE services ADD COLUMN bullets JSONB;

-- Update the bullets column to have a default structure if needed
-- This adds a constraint to ensure the bullets field is an array of up to 3 strings
-- You can remove this if you prefer more flexibility in validation
COMMENT ON COLUMN services.bullets IS 'An array of up to 3 bullet points for the service, stored as JSON';