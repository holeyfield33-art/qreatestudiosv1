-- Insert a test user if none exists
INSERT INTO "User" (id, email, name, "emailVerified", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'test@qreatestudios.com',
  'Test User',
  NOW(),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "User" LIMIT 1);

-- Show all users
SELECT id, email, name, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 5;
