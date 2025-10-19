import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { pool } from '../db';
import { User } from '../types/user';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Hardcoded schema for speed - no dynamic introspection
const DATABASE_SCHEMA = `
Table: public.extrato_records
Columns:
  - id: text [PRIMARY KEY]
  - user_id: text [NOT NULL] (filter by this)
  - data: timestamp (date in Portuguese)
  - valor: numeric(15,2) (amount in Portuguese - negative = debit, positive = credit)
  - descricao: text (description in Portuguese)
  - tipo_operacao: varchar(100) (operation type)
  - remetente_destinatario: varchar(255) (sender/recipient)
  - documento: varchar(50)
  - instituicao_financeira: varchar(255)
  - codigo_banco: varchar(10)
  - agencia: varchar(20)
  - conta: varchar(50)
  - tipo: ExtratoType
  - created_at: timestamp

Foreign Keys:
  - user_id → user.id
`;

export const executeSqlQueryTool = createTool({
  id: 'execute-sql-query',
  inputSchema: z.object({
    naturalLanguageQuery: z.string().describe('User question in natural language about their financial data'),
  }),
  description: 'Generates SQL from natural language and executes it against the database in one step',
  execute: async ({ context: { naturalLanguageQuery }, runtimeContext }) => {
    const start = Date.now();

    try {
      // Get authenticated user
      const user: User = runtimeContext.get('user');
      console.log("user", user)
      if (!user) {
        throw new Error('User authentication required');
      }

      // Generate SQL using AI with optimized settings
      const { text: sqlQuery } = await generateText({
        model: openai('gpt-4o'),
        temperature: 0, // Deterministic = faster
        maxOutputTokens: 200, // Limit output = faster
        prompt: `Generate PostgreSQL SELECT query for: "${naturalLanguageQuery}"

DATABASE SCHEMA:
${DATABASE_SCHEMA}

CRITICAL RULES:
1. Use EXACT Portuguese column names (valor, data, descricao)
2. MUST include: WHERE user_id = '${user.sub}'
3. SELECT only (no INSERT/UPDATE/DELETE)
4. Use ILIKE with LOWER() for text search
5. Return ONLY the SQL query, nothing else

User ID: ${user.sub}

SQL Query:`,
      });

      let finalSql = sqlQuery.trim().replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();

      const lowerSql = finalSql.toLowerCase();
      if (!lowerSql.startsWith('select')) {
        throw new Error('Only SELECT queries are allowed');
      }

      // Ensure user_id filter exists
      if (!finalSql.includes(user.sub)) {
        // Inject user_id filter if missing
        if (lowerSql.includes('where')) {
          finalSql = finalSql.replace(/WHERE/i, `WHERE user_id = '${user.sub}' AND`);
        } else {
          const fromMatch = finalSql.match(/FROM\s+(\w+)/i);
          if (fromMatch) {
            finalSql = finalSql.replace(
              new RegExp(`FROM\\s+${fromMatch[1]}`, 'i'),
              `FROM ${fromMatch[1]} WHERE user_id = '${user.sub}'`
            );
          }
        }
      }

      // Execute query
      const result = await pool.query(finalSql);

      const executionTime = ((Date.now() - start) / 1000).toFixed(2);

      return {
        success: true,
        data: result.rows.slice(0, 100), // Limit to 100 rows for performance
        rowCount: result.rows.length,
        executedQuery: finalSql,
        executionTime: `${executionTime}s`,
      };

    } catch (error) {
      const executionTime = ((Date.now() - start) / 1000).toFixed(2);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: `${executionTime}s`,
      };
    }
  },
});
