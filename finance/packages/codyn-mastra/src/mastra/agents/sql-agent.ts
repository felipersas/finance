import { Agent } from '@mastra/core/agent';
import { executeSqlQueryTool } from '../tools/execute-sql-query';
import { openai } from '@ai-sdk/openai';
import { prompt } from '../prompts/sql-agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { databaseQueryWorkflow } from '../workflows/database-query-workflow';

const memory = new Memory({
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  options: {
    lastMessages: 4,
  }
});

export const sqlAgent = new Agent({
  name: 'Financial Assistant',
  instructions: prompt,
  model: openai('gpt-4.1'),
  memory,
  workflows: {
   databaseQueryWorkflow,
  },
  tools: {
    executeSqlQuery: executeSqlQueryTool,
  },
});
