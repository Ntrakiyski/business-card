import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

function validateDatabaseUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsedUrl = new URL(url);
    
    if (parsedUrl.protocol !== 'postgresql:' && parsedUrl.protocol !== 'postgres:') {
      return { valid: false, error: 'URL must start with postgresql:// or postgres://' };
    }
    
    if (!parsedUrl.hostname) {
      return { valid: false, error: 'Missing hostname in DATABASE_URL' };
    }
    
    if (!parsedUrl.password) {
      return { valid: false, error: 'Missing password in DATABASE_URL' };
    }
    
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('\n📝 To fix this in Coolify:');
    console.error('1. Go to your Coolify dashboard');
    console.error('2. Navigate to your application settings');
    console.error('3. Add environment variable: DATABASE_URL');
    console.error('4. Get the value from Supabase: Project Settings → Database → Connection String → URI');
    console.error('\n⚠️  Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres');
    process.exit(1);
  }

  // Validate DATABASE_URL format
  const validation = validateDatabaseUrl(connectionString);
  if (!validation.valid) {
    console.error(`❌ Invalid DATABASE_URL: ${validation.error}`);
    console.error('\n📝 Expected format:');
    console.error('postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres');
    console.error('\nExample:');
    console.error('postgresql://postgres:yourpassword@db.xxxxxxxxxxxxx.supabase.co:5432/postgres');
    console.error('\n⚠️  Common issues:');
    console.error('- Missing password (check for [YOUR-PASSWORD] placeholder)');
    console.error('- Wrong protocol (must be postgresql:// or postgres://)');
    console.error('- Missing host or port');
    console.error('- Extra spaces or quotes around the URL');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL format is valid');
  console.log(`🔗 Connecting to: ${connectionString.replace(/:[^:]*@/, ':***@')}`);

  const migrationClient = postgres(connectionString, { 
    max: 1,
    ssl: 'require',
    connection: {
      application_name: 'drizzle-migrator'
    }
  });
  const db = drizzle(migrationClient);

  try {
    // Test connection first
    console.log('🔌 Testing database connection...');
    await migrationClient`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Run migrations
    console.log('🚀 Applying migrations...');
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('✅ Migrations completed successfully');
    
    await migrationClient.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    
    // Provide specific error guidance
    if (error.code === 'SASL_SIGNATURE_MISMATCH' || error.message?.includes('SASL')) {
      console.error('\n🔐 Authentication Error Detected!');
      console.error('This usually means:');
      console.error('1. The password in DATABASE_URL is incorrect');
      console.error('2. The connection string was copy-pasted incorrectly');
      console.error('3. Special characters in the password need to be URL-encoded');
      console.error('\n📝 To fix:');
      console.error('1. Go to Supabase → Project Settings → Database');
      console.error('2. Copy the "URI" connection string (NOT the session mode one)');
      console.error('3. Make sure to use your actual database password');
      console.error('4. If password has special chars (!, @, #, etc), URL-encode them');
      console.error('\n🔗 URL encoding guide:');
      console.error('! = %21, @ = %40, # = %23, $ = %24, % = %25, etc.');
    } else if (error.code === 'ENOTFOUND' || error.message?.includes('getaddrinfo')) {
      console.error('\n🌐 Connection Error: Cannot reach database host');
      console.error('Check:');
      console.error('1. Hostname is correct in DATABASE_URL');
      console.error('2. Network/firewall allows outbound PostgreSQL connections');
      console.error('3. Supabase project is active and not paused');
    }
    
    try {
      await migrationClient.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    process.exit(1);
  }
}

runMigrations();
