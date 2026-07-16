import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}
