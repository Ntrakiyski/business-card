import { db } from '@/lib/db';
import { profiles, customLinks, socialLinks, services, widgetSettings } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

/**
 * Script to clean all database records
 * Use with caution - this will delete ALL data!
 * 
 * Run with: bun run scripts/clean-database.ts
 */
async function cleanDatabase() {
  console.log('🗑️  Starting database cleanup...');
  
  try {
    // Delete in correct order (respecting foreign keys)
    console.log('Deleting widget_settings...');
    await db.delete(widgetSettings);
    
    console.log('Deleting services...');
    await db.delete(services);
    
    console.log('Deleting social_links...');
    await db.delete(socialLinks);
    
    console.log('Deleting custom_links...');
    await db.delete(customLinks);
    
    console.log('Deleting profiles...');
    await db.delete(profiles);
    
    console.log('✅ Database cleanup completed successfully!');
    console.log('All records have been removed from:');
    console.log('  - profiles');
    console.log('  - custom_links');
    console.log('  - social_links');
    console.log('  - services');
    console.log('  - widget_settings');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

cleanDatabase();

