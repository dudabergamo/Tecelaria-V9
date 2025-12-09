import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { memoryCategories } from "./drizzle/schema.js";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const categories = await db.select().from(memoryCategories);

console.log("Total de categorias:", categories.length);
console.log("\nCategorias:");
categories.forEach(cat => {
  console.log(`- ID: ${cat.id}, Nome: ${cat.name}, Order: ${cat.order}`);
});

// Check for duplicates
const names = categories.map(c => c.name);
const duplicates = names.filter((name, index) => names.indexOf(name) !== index);

if (duplicates.length > 0) {
  console.log("\n⚠️  DUPLICADAS ENCONTRADAS:");
  duplicates.forEach(dup => console.log(`- ${dup}`));
} else {
  console.log("\n✅ Nenhuma duplicata encontrada!");
}

await connection.end();
