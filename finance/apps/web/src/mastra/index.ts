import 'dotenv/config';
import { Mastra } from '@mastra/core/mastra';
import { sqlAgent } from './agents/sql-agent';
import { databaseQueryWorkflow } from './workflows/database-query-workflow';
import { LibSQLStore } from '@mastra/libsql';

export const mastra = new Mastra({
  agents: { sqlAgent },
  workflows: {
    databaseQueryWorkflow,
  },
  storage: new LibSQLStore({
      url: "file:./mastra.db",
  }),
  observability: {
    default: {
      enabled: true,
    },
  },
  server: {
    // experimental_auth: new MastraJwtAuth({
    //   secret: process.env.JWT_SECRET,
    // }),
  }
});
