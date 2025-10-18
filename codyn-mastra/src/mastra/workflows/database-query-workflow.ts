import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { RuntimeContext } from '@mastra/core/di';
import { executeSqlQueryTool } from '../tools/execute-sql-query';

// Single step workflow - just execute the query
const executeQueryStep = createStep({
  id: 'execute-query',
  inputSchema: z.object({
    naturalLanguageQuery: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any().optional(),
    rowCount: z.number().optional(),
    executedQuery: z.string().optional(),
    executionTime: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const { naturalLanguageQuery } = inputData;

    try {
      if (!executeSqlQueryTool.execute) {
        throw new Error('Execute SQL query tool is not available');
      }

      const result = await executeSqlQueryTool.execute({
        context: {
          naturalLanguageQuery,
        },
        runtimeContext: runtimeContext || new RuntimeContext(),
      });

      return result as any;
    } catch (error) {
      return {
        success: false,
        error: `Failed to execute query: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

// Define the simplified database query workflow
export const databaseQueryWorkflow = createWorkflow({
  id: 'database-query-workflow',
  inputSchema: z.object({
    naturalLanguageQuery: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any().optional(),
    rowCount: z.number().optional(),
    executedQuery: z.string().optional(),
    executionTime: z.string().optional(),
    error: z.string().optional(),
  }),
  steps: [executeQueryStep],
});

databaseQueryWorkflow.then(executeQueryStep).commit();
