import { createTool } from '@mastra/core/tools';
import { User } from '../types/user';
import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { databaseIntrospectionTool } from './database-introspection-tool';
import { RuntimeContext } from '@mastra/core/runtime-context';

// Simple in-memory cache for SQL generation results
const sqlCache = new Map<string, any>();

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
    databaseSchema: z.string().describe('Tool ID for database introspection'),
  }),
  description: 'Generates SQL queries from natural language descriptions using database schema information',
  execute: async ({ context: { naturalLanguageQuery, databaseSchema }, runtimeContext }) => {
    const start = Date.now();
    try {
      console.log('🔍 [SQL-GEN] RuntimeContext received:', runtimeContext);
      const user: User = runtimeContext.get('user');
      console.log('🔍 [SQL-GEN] userId extracted:', user.sub);
      if (!user) {
        throw new Error('User is required for data filtering');
      }
      console.log('🔌 Generating SQL query for:', naturalLanguageQuery);

      // Check cache first
      const cacheKey = `${user.sub}:${naturalLanguageQuery}`;
      if (sqlCache.has(cacheKey)) {
        console.log('📋 Returning cached SQL generation result');
        return sqlCache.get(cacheKey);
      }

      // Fetch database schema using introspection tool
      const databaseSchema = await databaseIntrospectionTool?.execute({
        context: {},
        runtimeContext: runtimeContext || new RuntimeContext(),
      });

      let schema = databaseSchema;
      if (!schema) {
        // Fetch database schema using introspection tool
        schema = await databaseIntrospectionTool.execute({
          context: {},
          runtimeContext: runtimeContext || new RuntimeContext(),
        });
      }

      // Create a comprehensive schema description for the AI
      const schemaDescription = createSchemaDescription(schema);

      const systemPrompt = `Expert PostgreSQL query generator. Convert natural language to SQL.

User ID: ${user.sub}

SCHEMA:
${schemaDescription}

RULES:
- SELECT only
- PostgreSQL syntax
- Qualify columns in joins
- ILIKE for text searches
- Always WHERE user_id = '${user.sub}'
- LIMIT for large sets
- Fast, concise response`;

      const userPrompt = `Generate a SQL query for this question: "${naturalLanguageQuery}"

Please provide:
1. The SQL query
2. A clear explanation of what the query does
3. Your confidence level (0-1)
4. Any assumptions you made
5. List of tables used`;

      // Call the LLM to generate the SQL query
      const response = await generateObject({
        model: openai('gpt-4.1'),
        system: systemPrompt,
        prompt: userPrompt,
        schema: sqlGenerationSchema,
      });

      // Cache the result
      sqlCache.set(cacheKey, response);

      return response;
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

function createSchemaDescription(databaseSchema: any): string {
  let description = '';

  // Group columns by table
  const tableColumns = new Map<string, any[]>();
  databaseSchema.columns.forEach((column: any) => {
    const tableKey = `${column.table_schema}.${column.table_name}`;
    if (!tableColumns.has(tableKey)) {
      tableColumns.set(tableKey, []);
    }
    tableColumns.get(tableKey)?.push(column);
  });

  // Create table descriptions
  databaseSchema.tables.forEach((table: any) => {
    const tableKey = `${table.schema_name}.${table.table_name}`;
    const columns = tableColumns.get(tableKey) || [];
    const rowCount = databaseSchema.rowCounts.find(
      (rc: any) => rc.schema_name === table.schema_name && rc.table_name === table.table_name,
    );

    description += `\nTable: ${table.schema_name}.${table.table_name}`;
    if (rowCount) {
      description += ` (${rowCount.row_count} rows)`;
    }
    description += '\nColumns:\n';

    columns.forEach((column: any) => {
      description += `  - ${column.column_name}: ${column.data_type}`;
      if (column.character_maximum_length) {
        description += `(${column.character_maximum_length})`;
      }
      if (column.is_primary_key) {
        description += ' [PRIMARY KEY]';
      }
      if (column.is_nullable === 'NO') {
        description += ' [NOT NULL]';
      }
      if (column.column_default) {
        description += ` [DEFAULT: ${column.column_default}]`;
      }
      description += '\n';
    });
  });

  // Add relationship information
  if (databaseSchema.relationships.length > 0) {
    description += '\nRelationships:\n';
    databaseSchema.relationships.forEach((rel: any) => {
      description += `  - ${rel.table_schema}.${rel.table_name}.${rel.column_name} → ${rel.foreign_table_schema}.${rel.foreign_table_name}.${rel.foreign_column_name}\n`;
    });
  }

  // Add index information
  if (databaseSchema.indexes.length > 0) {
    description += '\nIndexes:\n';
    databaseSchema.indexes.forEach((index: any) => {
      description += `  - ${index.schema_name}.${index.table_name}: ${index.index_name}\n`;
    });
  }

  return description;
}
