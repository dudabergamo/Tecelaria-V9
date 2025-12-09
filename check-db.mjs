import { drizzle } from 'drizzle-orm/mysql2';
import { memoryCategories, dailyInspirations } from './drizzle/schema.ts';
import 'dotenv/config';

const db = drizzle(process.env.DATABASE_URL);

console.log('🔍 Checking database...');

const cats = await db.select().from(memoryCategories);
console.log(`✅ Categories: ${cats.length}`);

const inspirations = await db.select().from(dailyInspirations);
console.log(`✅ Inspirations: ${inspirations.length}`);

process.exit(0);
