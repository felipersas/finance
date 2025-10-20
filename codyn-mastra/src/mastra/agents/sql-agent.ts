import { Agent } from '@mastra/core/agent';
import { executeSqlQueryTool } from '../tools/execute-sql-query';
import { openai } from '@ai-sdk/openai';
import { prompt } from '../prompts/sql-agent';
import { LibSQLStore } from '@mastra/libsql';
import { Memory } from '@mastra/memory';

const memory = new Memory({
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  options: {
    lastMessages: 4,
  }
});

export const sqlAgent = new Agent({
  name: 'SQL Financial Assistant',
  instructions: prompt,
  model: openai('gpt-4o'),
  defaultGenerateOptions: {
    maxTokens: 4096,
  },
  memory,
  tools: {
    executeSqlQuery: executeSqlQueryTool,
  },
});
