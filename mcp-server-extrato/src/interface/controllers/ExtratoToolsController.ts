import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ExtratoService } from "../../application/services/ExtratoService.js";
import { z } from "zod";

export class ExtratoToolsController {
  constructor(
    private server: McpServer,
    private extratoService: ExtratoService,
  ) {
    this.registerTools();
  }

  private registerTools(): void {
    this.registerCustomExtratoQueryTool();
    this.registerGetDatabaseSchemaTool();
  }


  private registerCustomExtratoQueryTool(): void {
    this.server.tool(
      "execute-custom-extrato-query",
      "Execute a custom SQL SELECT query on the extrato_db database. Only SELECT statements are allowed for security. Available tables: extrato_records",
      {
        query: z
          .string()
          .describe("SQL SELECT query to execute. Must start with SELECT and only use extrato_records. Example: 'SELECT * FROM extrato_records WHERE value > 80 LIMIT 10'"),
      },
      async ({ query }) => {
        const queryResult = await this.extratoService.executeCustomExtratoQuery(query);

        return {
          content: [
            {
              type: "text",
              text: String(queryResult), // Ensure queryResult is a string
            },
          ],
        };
      }
    );
  }

  private registerGetDatabaseSchemaTool(): void {
    this.server.tool(
      "get-database-schema",
      "Get the database schema information including table structures and sample queries",
      {},
      async () => {
        const schemaInfo = await this.extratoService.getDatabaseSchema();

        return {
          content: [
            {
              type: "text",
              text: schemaInfo,
            },
          ],
        };
      }
    );
  }
}