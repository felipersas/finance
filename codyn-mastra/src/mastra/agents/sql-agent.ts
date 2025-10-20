import { Agent } from '@mastra/core/agent';
import { executeSqlQueryTool } from '../tools/execute-sql-query';
import { openai } from '@ai-sdk/openai';
import { prompt } from '../prompts/sql-agent';

export const sqlAgent = new Agent({
  name: 'Finance Assistant',
  instructions: prompt,
  model: openai('gpt-4.1'),
  tools: {
    executeSqlQuery: executeSqlQueryTool,
  },
});
