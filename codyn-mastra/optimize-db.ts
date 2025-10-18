import 'dotenv/config';
import { pool } from "./src/mastra/db.js";

async function optimizeDatabase() {
  const client = await pool.connect();
  try {
    console.log("Starting database optimizations...");

    // Enable pg_trgm extension if not exists
    await client.query("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
    console.log("✓ pg_trgm extension ensured");

    // Composite indexes
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_user_data ON public.extrato_records (user_id, data);",
    );
    console.log("✓ Created idx_user_data");

    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_user_tipo ON public.extrato_records (user_id, tipo_operacao);",
    );
    console.log("✓ Created idx_user_tipo");

    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_user_valor ON public.extrato_records (user_id, valor);",
    );
    console.log("✓ Created idx_user_valor");

    // Text search index
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_descricao_trgm ON public.extrato_records USING gin (descricao gin_trgm_ops);",
    );
    console.log("✓ Created idx_descricao_trgm");

    // Partial index for debits
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_user_data_debits ON public.extrato_records (user_id, data) WHERE valor < 0;",
    );
    console.log("✓ Created idx_user_data_debits");

    // Expression-based index
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_data_year_month ON public.extrato_records (EXTRACT(YEAR FROM data), EXTRACT(MONTH FROM data));",
    );
    console.log("✓ Created idx_data_year_month");

    // Analyze table
    await client.query("ANALYZE public.extrato_records;");
    console.log("✓ Analyzed table");

    console.log("Database optimizations completed successfully!");
  } catch (error) {
    console.error("Error optimizing database:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

optimizeDatabase();
