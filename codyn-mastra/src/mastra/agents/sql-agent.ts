import { Agent } from '@mastra/core/agent';
import { LibSQLStore } from '@mastra/libsql';
import { Memory } from '@mastra/memory';
import { sqlExecutionTool } from '../tools/sql-execution-tool';
import { sqlGenerationTool } from '../tools/sql-generation-tool';
import { openai } from '@ai-sdk/openai';
import { prompt } from '../prompts/sql-agent';
import { TokenLimiterProcessor } from '@mastra/core/processors';
import { TokenLimiter } from '@mastra/memory/processors';


const memory = new Memory({
    // processors: [new TokenLimiter(4096)], // More generous token limit for memory context
    options: {
      lastMessages: 3, // Slightly more context
      workingMemory: {
        enabled: false, // Disable for debugging
      },
    },
    storage: new LibSQLStore({
      url: ':memory:',
    }),
  });

export const sqlAgent = new Agent({
  name: 'Finance Assistant',
  instructions: prompt,
  outputProcessors: [
    new TokenLimiterProcessor({
      limit: 4096, // More generous output token limit for debugging
      strategy: "truncate",
      countMode: "part"
    })
  ],
  model: openai("gpt-4.1-mini"),
  tools: {
    sqlGenerationTool,
    sqlExecutionTool,
  },
  memory,
});
