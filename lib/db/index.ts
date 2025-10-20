import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Disable prefetch to avoid connection issues
const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { 
  prepare: false,
  max: 10,
});

export const db = drizzle(client, { schema });

// Helper to close the connection (useful for scripts)
export const closeConnection = async () => {
  await client.end();
};

