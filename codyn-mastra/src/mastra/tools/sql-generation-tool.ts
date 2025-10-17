import { createTool } from '@mastra/core/tools';
import { User } from '../types/user';
import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { databaseIntrospectionTool } from './database-introspection-tool';
import { RuntimeContext } from '@mastra/core/runtime-context';

// Cache disabled for faster response

// Define the schema for SQL generation output
const sqlGenerationSchema = z.object({
  sql: z.string().describe('The generated SQL query'),
  explanation: z.string().describe('Explanation of what the query does'),
  confidence: z.number().min(0).max(1).describe('Confidence level in the generated query (0-1)'),
  assumptions: z.array(z.string()).describe('Any assumptions made while generating the query'),
  tables_used: z.array(z.string()).describe('List of tables used in the query'),
});

export const sqlGenerationTool = createTool({
  id: 'sql-generation',
  inputSchema: z.object({
    naturalLanguageQuery: z.string().describe('Natural language query from the user'),
    databaseSchema: z.any().describe('Database schema information'),
  }),
  description: 'Generates SQL queries from natural language descriptions using database schema information',
  execute: async ({ context: { naturalLanguageQuery }, runtimeContext }) => {
    const start = Date.now();
    try {
      const user: User = runtimeContext.get('user');
      if (!user) {
        throw new Error('User is required for data filtering');
      }

      // Simple hardcoded schema for speed - extrato_records table only
      const schemaDescription = `
Table: public.extrato_records (72 rows)
Columns:
  - id: text [PRIMARY KEY]
  - user_id: text [NOT NULL]
  - data: timestamp
  - valor: numeric(15,2) [NOT NULL]
  - descricao: text
  - tipo_operacao: varchar(100)
  - remetente_destinatario: varchar(255)
  - documento: varchar(50)
  - tipo: ExtratoType
Relationships:
  - user_id → user.id
`;

      const systemPrompt = `Generate PostgreSQL SELECT query.
SCHEMA: ${schemaDescription}
RULES: SELECT only | Use exact Portuguese columns (valor, data, descricao) | ALWAYS WHERE user_id = '${user.sub}' | ILIKE for text search`;

      const userPrompt = `SQL for: "${naturalLanguageQuery}"
Return: {sql, explanation, confidence, assumptions, tables_used}`;

      const response = await generateObject({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        prompt: userPrompt,
        schema: sqlGenerationSchema,
      });

      // Validate and fix the SQL to ensure userId is properly included
      let finalSql = response.object.sql;

      // Check if SQL contains the actual userId value
      if (finalSql && !finalSql.includes(user.sub)) {
        console.warn('⚠️  [SQL-GEN] Warning: Generated SQL does not contain userId value!');

        // Check if it has a placeholder like ${userId} or $userId
        if (finalSql.includes('${userId}') || finalSql.includes('$userId') || finalSql.includes('user_id = ?')) {
          console.log('🔧 [SQL-GEN] Fixing SQL: Replacing placeholder with actual userId');
          finalSql = finalSql.replace(/\$\{userId\}/g, `'${user.sub}'`);
          finalSql = finalSql.replace(/\$userId/g, `'${user.sub}'`);
          finalSql = finalSql.replace(/user_id\s*=\s*\?/gi, `user_id = '${user.sub}'`);
        }
        // If SQL has WHERE but no user_id filter, inject it
        else if (finalSql.toLowerCase().includes('where') && !finalSql.toLowerCase().includes('user_id')) {
          console.log('🔧 [SQL-GEN] Fixing SQL: Adding missing user_id filter');
          finalSql = finalSql.replace(/WHERE/i, `WHERE user_id = '${user.sub}' AND`);
        }
        // If no WHERE clause exists, add it
        else if (!finalSql.toLowerCase().includes('where')) {
          console.log('🔧 [SQL-GEN] Fixing SQL: Adding WHERE clause with user_id');
          // Find the FROM clause and add WHERE after table name
          const fromMatch = finalSql.match(/FROM\s+(\w+)/i);
          if (fromMatch) {
            const tableName = fromMatch[1];
            finalSql = finalSql.replace(
              new RegExp(`FROM\\s+${tableName}`, 'i'),
              `FROM ${tableName} WHERE user_id = '${user.sub}'`
            );
          }
        }
      }

      return {
        ...response,
        object: {
          ...response.object,
          sql: finalSql,
        },
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        success: false,
      };
    } finally {
      const end = Date.now();
      const seconds = ((end - start) / 1000).toFixed(2);
      console.log(`[DEBUG] sqlGenerationTool executed in ${seconds} seconds`);
    }
  },
});
