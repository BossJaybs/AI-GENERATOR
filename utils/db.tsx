import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'
console.log('DB: NEXT_PUBLIC_DRIZZLE_DB_URL is set:', !!process.env.NEXT_PUBLIC_DRIZZLE_DB_URL);
if (!process.env.NEXT_PUBLIC_DRIZZLE_DB_URL) {
  console.error('DB: NEXT_PUBLIC_DRIZZLE_DB_URL is not set, database connection will fail');
}
const sql = neon(process.env.NEXT_PUBLIC_DRIZZLE_DB_URL!);
export const db = drizzle(sql, {schema});
