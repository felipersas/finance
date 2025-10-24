import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { pool } from '../db';
import { User } from '../types/user';

export const executeSqlQueryTool = createTool({
  id: 'execute-sql-query',
  inputSchema: z.object({
    query: z.string().describe('PostgreSQL SELECT query to execute against the database'),
  }),
  description: `Executes a SQL query against the extrato_records database and returns the results.

  SECURITY:
  - Only SELECT queries are allowed
  - User filtering is enforced automatically
  - Query must be valid PostgreSQL syntax`,

  execute: async ({ context: { query }, runtimeContext }) => {
    const start = Date.now();

    try {
      // Get authenticated user
      const userId: string= runtimeContext.get('userId');

      if (!userId) {
        throw new Error('User authentication required');
      }

      // Clean the SQL query
      let cleanedQuery = query
        .trim()
        .replace(/```sql\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Security: Only allow SELECT queries
      const lowerQuery = cleanedQuery.toLowerCase();
      if (!lowerQuery.startsWith('select')) {
        throw new Error('Only SELECT queries are allowed for security reasons');
      }

      // Security: Prevent dangerous operations
      const dangerousPatterns = [
        /;\s*delete/i,
        /;\s*update/i,
        /;\s*insert/i,
        /;\s*drop/i,
        /;\s*create/i,
        /;\s*alter/i,
        /;\s*truncate/i,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(cleanedQuery)) {
          throw new Error('Query contains forbidden operations');
        }
      }

      // Security: Enforce user_id filter
      // Check if user_id filter exists in the query
      if (!cleanedQuery.includes(userId)) {
        // Inject user_id filter if missing
        if (lowerQuery.includes('where')) {
          // Add to existing WHERE clause
          cleanedQuery = cleanedQuery.replace(
            /WHERE/i,
            `WHERE user_id = '${userId}' AND`
          );
        } else {
          // Add new WHERE clause
          const fromMatch = cleanedQuery.match(/FROM\s+(\S+)/i);
          if (fromMatch) {
            const tableName = fromMatch[1];
            cleanedQuery = cleanedQuery.replace(
              new RegExp(`FROM\\s+${tableName}`, 'i'),
              `FROM ${tableName} WHERE user_id = '${userId}'`
            );
          } else {
            throw new Error('Could not parse FROM clause to add user_id filter');
          }
        }
      }

      // Execute the query
      const result = await pool.query(cleanedQuery);

      const executionTime = ((Date.now() - start) / 1000).toFixed(2);

      // Return results with metadata
      return {
        success: true,
        data: result.rows.slice(0, 100), // Limit to 100 rows for performance
        rowCount: result.rows.length,
        executedQuery: cleanedQuery,
        executionTime: `${executionTime}s`,
        columns: result.fields.map((field) => ({
          name: field.name,
          dataType: field.dataTypeID,
        })),
      };

    } catch (error) {
      const executionTime = ((Date.now() - start) / 1000).toFixed(2);

      console.error('❌ [SQL Tool] Query execution failed:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: `${executionTime}s`,
        data: [],
        rowCount: 0,
      };
    }
  },
});
