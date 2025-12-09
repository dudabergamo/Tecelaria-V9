import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { memoryCategories } from "./drizzle/schema.ts";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Add "Receitas da Família" category
const result = await db.insert(memoryCategories).values({
  name: "Receitas da Família",
  description: "Receitas especiais que fazem parte da história familiar",
  isPredefined: true,
  order: 100, // Put it at the end
});

console.log("✅ Categoria 'Receitas da Família' adicionada com sucesso!");

await connection.end();
