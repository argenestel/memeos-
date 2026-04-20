import { $ } from "bun";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function init() {
  console.log("Creating table...");
  await sql`
    CREATE TABLE IF NOT EXISTS token_analyses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token_address TEXT NOT NULL,
      persona TEXT NOT NULL,
      take TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      UNIQUE(token_address, persona)
    );
  `;
  console.log("Table created!");
  process.exit(0);
}

init().catch(console.error);