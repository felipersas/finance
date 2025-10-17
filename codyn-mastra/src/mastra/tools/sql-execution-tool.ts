import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { pool } from '../db';
import { User } from '../types/user';

export const sqlExecutionTool = createTool({
  id: 'sql-execution',
  inputSchema: z.object({
    query: z.string().describe('SQL query to execute'),
  }),
  description: 'Executes SQL queries against a PostgreSQL database',
  execute: async ({ context: { query }, runtimeContext }) => {
    const user: User = runtimeContext.get('user');
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
      // Removed timing log for speed
    }
  },
});
