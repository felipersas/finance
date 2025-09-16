import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MySQLService } from "./infrastructure/database/MySQLService.js";
import { ExtratoToolsController } from "./interface/controllers/ExtratoToolsController.js";
import { ExtratoService } from "./application/services/ExtratoService.js";

async function main() {
  // Criação da instância do servidor MCP
  const server = new McpServer({
    name: "weather",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });



  let dbService: MySQLService | undefined;
  try {
    dbService = new MySQLService();
    await dbService.connect();
    console.error("Connected to MySQL database - dbService created successfully");
    console.error("dbService is:", dbService ? "defined" : "undefined");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    // Continue without database if connection fails
    dbService = undefined;
  }

  console.error("Creating ExtratoService with dbService:", dbService ? "defined" : "undefined");
  const extratoService = new ExtratoService(dbService);
  // Pass dbService to controller as well
  // new WeatherToolsController(server, weatherService, dbService);
  new ExtratoToolsController(server, extratoService);

  // Configurando e iniciando o servidor
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Extrato MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
