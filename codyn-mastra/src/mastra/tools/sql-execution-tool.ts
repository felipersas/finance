import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { pool } from '../db';

export const sqlExecutionTool = createTool({
  id: 'sql-execution',
  inputSchema: z.object({
    query: z.string().describe('SQL query to execute'),
  }),
  description: 'Executes SQL queries against a PostgreSQL database',
  execute: async ({ context: { query }, runtimeContext }) => {
    const start = Date.now();
    const user = runtimeContext.get('user');
    if (!user) {
      throw new Error('User is required for data filtering');
    }
    try {
      const trimmedQuery = query.trim().toLowerCase();
      if (!trimmedQuery.startsWith('select')) {
        throw new Error('Only SELECT queries are allowed for security reasons');
      }

      // Use async/await directly, no .then()
      const res = await pool.query(query);
      // Limit result size for speed
      const result = res.rows.slice(0, 100);

      return {
        success: true,
        data: result,
        rowCount: result.length,
        executedQuery: query,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executedQuery: query,
      };
    } finally {
      const end = Date.now();
      const seconds = ((end - start) / 1000).toFixed(2);
      console.log(`[DEBUG] sqlExecutionTool executed in ${seconds} seconds`);
    }
  },
});
