import { Agent } from '@mastra/core/agent';
import { executeSqlQueryTool } from '../tools/execute-sql-query';
import { openai } from '@ai-sdk/openai';
import { prompt } from '../prompts/sql-agent';

export const sqlAgent = new Agent({
  name: 'SQL Financial Assistant',
  instructions: prompt,
  model: openai('gpt-4o'),
  defaultGenerateOptions: {
    maxTokens: 4096,
    temperature: 0.0,
  },
  tools: {
    executeSqlQuery: executeSqlQueryTool,
  },
});
