import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { memoryCategories } from "./drizzle/schema.js";
import { sql } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log("Removendo categorias duplicadas...\n");

// Keep only the first occurrence of each category name
await connection.query(`
  DELETE t1 FROM memory_categories t1
  INNER JOIN memory_categories t2
  WHERE t1.id > t2.id AND t1.name = t2.name
`);

console.log("✅ Duplicatas removidas!");

// Show remaining categories
const categories = await db.select().from(memoryCategories);
console.log(`\nTotal de categorias restantes: ${categories.length}`);
categories.forEach(cat => {
  console.log(`- ${cat.name}`);
});

await connection.end();
