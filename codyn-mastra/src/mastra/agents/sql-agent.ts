import { Agent } from '@mastra/core/agent';
import { executeSqlQueryTool } from '../tools/execute-sql-query';
import { openai } from '@ai-sdk/openai';
import { prompt } from '../prompts/sql-agent';
import { User } from '../types/user';

export const sqlAgent = new Agent({
  name: 'SQL Financial Assistant',
  instructions: prompt,
  model: openai('gpt-4o'),
  defaultGenerateOptions({runtimeContext}) {
    const user: User = runtimeContext.get("user");
    return {
      maxTokens: 4096,
      temperature: 0.0,
      threadId: user.sub,
      resourceId: user.sub,
    }
  },
  defaultStreamOptions({runtimeContext}) {
    const user: User = runtimeContext.get("user");
    return {
      maxTokens: 4096,
      temperature: 0.0,
      threadId: user.sub,
      resourceId: user.sub,
    };
  },
  tools: {
    executeSqlQuery: executeSqlQueryTool,
  },
});
