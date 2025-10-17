import 'dotenv/config';
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { sqlAgent } from './agents/sql-agent';
import { databaseQueryWorkflow } from './workflows/database-query-workflow';
import { MastraJwtAuth } from '@mastra/auth';
import { LibSQLStore } from '@mastra/libsql';


export const mastra = new Mastra({
  agents: { sqlAgent },
  workflows: {
    databaseQueryWorkflow,
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  storage: new LibSQLStore({
      url: "file:./mastra.db",
  }),
  telemetry: {
      enabled: true,
  },
  observability: {
    default: {
      enabled: true,
    },
  },
  server: {
    experimental_auth: new MastraJwtAuth({
      secret: process.env.JWT_SECRET,
    }),
  }
});
