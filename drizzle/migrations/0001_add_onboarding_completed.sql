-- Add onboarding_completed column to profiles table
ALTER TABLE "profiles" ADD COLUMN "onboarding_completed" boolean DEFAULT false;

-- Update existing profiles to mark onboarding as completed (since they already exist)
UPDATE "profiles" SET "onboarding_completed" = true WHERE "username" IS NOT NULL;

