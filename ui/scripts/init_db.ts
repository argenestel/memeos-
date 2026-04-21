import postgres from "postgres";

const sql = postgres("postgresql://postgres:RatEEvq%23fx17ay404GwA@db.ugkucjbnwgohmmhdebri.supabase.co:5432/postgres", {
  ssl: "require",
});

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
  await sql.end();
  process.exit(0);
}

init().catch((e) => {
  console.error(e);
  process.exit(1);
});