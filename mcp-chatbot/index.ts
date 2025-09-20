// Remove Anthropic imports and add OpenAI types
import { OpenAI } from "openai";
import type { ChatCompletionTool, ChatCompletionMessageParam } from "openai/resources/chat/completions";

// mcp sdk
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import dotenv from "dotenv";
import readline from "readline/promises";

import express, { RequestHandler } from "express";
import cors from "cors";
import os from "os";
import { prompt } from "./promp.js";
import { validateDockerNetwork, validateInternalCall } from "./security-middleware.js";



dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

const model = "openai/gpt-4.1";

class MCPClient {
  private mcp: Client;
  private llm: OpenAI;
  private transport: StdioClientTransport | null = null;
  public tools: ChatCompletionTool[] = [];
  private conversationHistory: Map<string, ChatCompletionMessageParam[]> = new Map();

  constructor() {
    this.llm = new OpenAI({
      baseURL: "https://models.github.ai/inference",
      apiKey: OPENAI_API_KEY,
    });
    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
  }

  // Connect to the MCP
  async connectToServer(serverScriptPath: string) {
    const isJs = serverScriptPath.endsWith(".js");
    const isPy = serverScriptPath.endsWith(".py");
    if (!isJs && !isPy) {
      throw new Error("Server script must be a .js or .py file");
    }
    const command = isPy
      ? process.platform === "win32"
        ? "python"
        : "python3"
      : process.execPath;

    this.transport = new StdioClientTransport({
      command,
      args: [serverScriptPath],
      env: {
         ...process.env, // Pass all environment variables from parent
        // Explicitly ensure DB variables are passed
        DB_HOST: process.env.DB_HOST || 'mysql',
        DB_PORT: process.env.DB_PORT || '3306',
        DB_USER: process.env.DB_USER!,
        DB_PASSWORD: process.env.DB_PASSWORD!,
        DB_NAME: process.env.DB_NAME || 'extrato_db',
        NODE_ENV: process.env.NODE_ENV || 'production'
      }
    });
    await this.mcp.connect(this.transport);

    // Register tools - convert MCP tools to OpenAI format
    const toolsResult = await this.mcp.listTools();
    this.tools = toolsResult.tools.map((tool) => {
      return {
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        },
      };
    });

    console.log(
      "Connected to server with tools:",
      this.tools.map((tool) => (tool as any).function.name)
    );
  }

  private getSystemPrompt(userId?: string): string {
    let systemPrompt = prompt;

    if (userId) {
      systemPrompt += `

      CONTEXTO IMPORTANTE DE USUÁRIO:
      - Você está operando exclusivamente com dados do userId: ${userId}
      - Em TODAS as consultas ao banco de dados, inclua obrigatoriamente a cláusula: WHERE user_id = ${userId}
      - Nunca acesse, utilize ou infira dados de outros usuários sob nenhuma circunstância.
      - Não mencione o userId nas respostas ao usuário.
      - Se não houver userId fornecido, recuse a solicitação de forma educada, explicando que é necessário um identificador de usuário para processar a análise financeira.`;
          } else {
            systemPrompt += `

      CONTEXTO IMPORTANTE DE USUÁRIO:
      - Nenhum userId foi fornecido.
      - Recuse todas as solicitações e informe educadamente que é necessário um identificador de usuário válido para realizar a análise financeira.`;
          }

          return systemPrompt;
      }


  // Process query with conversation history
  async processQuery(query: string, conversationId: string = 'default', userId?: string) {
    try {
      console.log("User query:", query);

      // Create user-specific conversation ID to prevent cross-user access
      const userConversationId = userId ? `${userId}:${conversationId}` : conversationId;

      // Get or create conversation history
      if (!this.conversationHistory.has(userConversationId)) {
        this.conversationHistory.set(userConversationId, [
          {
            role: "system",
            content: this.getSystemPrompt(userId),
          }
        ]);
      }

      const messages = this.conversationHistory.get(userConversationId)!;

      // Add user message to conversation history
      messages.push({
        role: "user",
        content: query,
      });

      console.log("Sending to LLM with messages:", messages);
      const response = await this.llm.chat.completions.create({
        model,
        messages,
        tools: this.tools.length > 0 ? this.tools : undefined,
        tool_choice: "auto",
      });

      console.log("LLM Response:", response);

      const choice = response.choices[0];
      if (!choice.message) {
        return "No response from LLM";
      }

      const finalText = [];

      // Handle tool calls
      if (choice.message.tool_calls) {
        // Add assistant message with tool call to history
        messages.push({
          role: "assistant",
          content: choice.message.content,
          tool_calls: choice.message.tool_calls,
        });

        for (const toolCall of choice.message.tool_calls) {
          if (toolCall.type === "function") {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

            console.log(`Executing ${toolName} with args:`, toolArgs);

            const result = await this.mcp.callTool({
              name: toolName,
              arguments: toolArgs,
            });

            console.log("Tool result:", result.content);

            // Add tool response to history
            messages.push({
              role: "tool",
              content: JSON.stringify(result.content),
              tool_call_id: toolCall.id,
            });
          }
        }

        // Get final response from LLM after all tool executions
        const followUpResponse = await this.llm.chat.completions.create({
          model,
          messages,
          tools: this.tools.length > 0 ? this.tools : undefined,
          tool_choice: "auto",
        });

        const followUpChoice = followUpResponse.choices[0];

        // Handle additional tool calls if needed
        if (followUpChoice.message?.tool_calls) {
          // Add to history
          messages.push({
            role: "assistant",
            content: followUpChoice.message.content,
            tool_calls: followUpChoice.message.tool_calls,
          });

          for (const toolCall of followUpChoice.message.tool_calls) {
            if (toolCall.type === "function") {
              const toolName = toolCall.function.name;
              const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

              console.log(`Executing additional ${toolName} with args:`, toolArgs);

              const result = await this.mcp.callTool({
                name: toolName,
                arguments: toolArgs,
              });

              console.log("Additional tool result:", result.content);

              messages.push({
                role: "tool",
                content: JSON.stringify(result.content),
                tool_call_id: toolCall.id,
              });
            }
          }

          // Get final natural language response
          const finalResponse = await this.llm.chat.completions.create({
            model,
            messages,
          });

          if (finalResponse.choices[0].message?.content) {
            const finalContent = finalResponse.choices[0].message.content;
            finalText.push(finalContent);

            // Add final assistant response to history
            messages.push({
              role: "assistant",
              content: finalContent,
            });
          }
        } else if (followUpChoice.message?.content) {
          finalText.push(followUpChoice.message.content);

          // Add assistant response to history
          messages.push({
            role: "assistant",
            content: followUpChoice.message.content,
          });
        }
      } else {
        // If no tool calls, add the initial response
        if (choice.message.content) {
          finalText.push(choice.message.content);

          // Add assistant response to history
          messages.push({
            role: "assistant",
            content: choice.message.content,
          });
        }
      }

      // Trim conversation history if it gets too long (keep last 50 messages)
      if (messages.length > 50) {
        const systemMessage = messages[0]; // Keep system message
        const recentMessages = messages.slice(-49); // Keep last 49 messages
        this.conversationHistory.set(userConversationId, [systemMessage, ...recentMessages]);
      }

      return finalText.join("\n");
    } catch (e) {
      console.log("Error in processing query:", e);
      throw e;
    }
  }

  // Method to clear conversation history
  clearConversation(conversationId: string = 'default', userId?: string) {
    const userConversationId = userId ? `${userId}:${conversationId}` : conversationId;
    this.conversationHistory.delete(userConversationId);
  }

  // Method to get conversation history
  getConversationHistory(conversationId: string = 'default', userId?: string): ChatCompletionMessageParam[] {
    const userConversationId = userId ? `${userId}:${conversationId}` : conversationId;
    return this.conversationHistory.get(userConversationId) || [];
  }

  async chatLoop() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      console.log("\nMCP Chatbot Started!");
      console.log("Type your queries or 'quit' to exit.");

      while (true) {
        const message = await rl.question("\nQuery: ");
        if (message.toLowerCase() === "quit") {
          break;
        }
        console.log("Processing your query...");
        const response = await this.processQuery(message);
        console.log("\n" + response);
      }
    } finally {
      rl.close();
    }
  }

  async cleanup() {
    await this.mcp.close();
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Usage: node index.js <path_to_server_script>");
    return;
  }

  const app = express();
  const port = parseInt(process.env.PORT || "3001", 10);
  const networkInterfaces = os.networkInterfaces();
  const ip = Object.values(networkInterfaces)
  .flat()
  .find((iface) => iface?.family === 'IPv4' && !iface?.internal)?.address ?? 'localhost';

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(validateDockerNetwork);
  app.use(validateInternalCall)

  // Security middleware to validate userId (you can enhance this with JWT validation)
  const validateUser: RequestHandler = (req, res, next) => {
    // Skip validation for health check
    if (req.path === '/health') {
      return next();
    }

    const userId = req.body.userId || req.query.userId;
    if (!userId) {
      return res.status(401).json({ error: 'UserId is required for all operations' });
    }

    // TODO: Add JWT token validation here
    // const token = req.headers.authorization?.replace('Bearer ', '');
    // if (!validateJWT(token, userId)) {
    //   return res.status(403).json({ error: 'Invalid token for this user' });
    // }

    next();
  };

  // Apply security middleware to protected routes
  app.use(['/chat', '/clear-conversation', '/conversation-history'], validateUser);

  const mcpClient = new MCPClient();

  try {
    await mcpClient.connectToServer(process.argv[2]);

    // Health check endpoint
    const healthCheck: RequestHandler = (req, res) => {
      res.json({ status: 'ok', tools: mcpClient.tools.map((t) => (t as any).function.name) });
    };
    app.get('/health', healthCheck);

    // Main chat endpoint
    const chatHandler: RequestHandler = async (req, res) => {
      try {
        const { query, conversationId = 'default', userId } = req.body;
        if (!query) {
          res.status(400).json({ error: 'Query is required' });
          return;
        }

        if (!userId) {
          res.status(400).json({ error: 'UserId is required for security' });
          return;
        }

        const response = await mcpClient.processQuery(query, conversationId, userId);
        res.json({ response, conversationId, userId });
      } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ error: 'Failed to process query' });
      }
    };
    app.post('/chat', chatHandler);

    // Conversation management endpoints
    const clearConversationHandler: RequestHandler = (req, res) => {
      const { conversationId = 'default', userId } = req.body;
      if (!userId) {
        res.status(400).json({ error: 'UserId is required for security' });
        return;
      }
      mcpClient.clearConversation(conversationId, userId);
      res.json({ success: true, message: `Conversation ${conversationId} cleared for user ${userId}` });
    };
    app.post('/clear-conversation', clearConversationHandler);

    const getHistoryHandler: RequestHandler = (req, res) => {
      const { conversationId = 'default', userId } = req.query;
      if (!userId) {
        res.status(400).json({ error: 'UserId is required for security' });
        return;
      }
      const history = mcpClient.getConversationHistory(conversationId as string, userId as string);
      res.json({ history, conversationId, userId });
    };
    app.get('/conversation-history', getHistoryHandler);


    app.listen(port, '0.0.0.0', () => {
      console.log(`MCP Chatbot Server running on port ${port}`);
      console.log(`Health check: http://${ip}:${port}/health`);
      console.log(`Chat endpoint: http://${ip}:${port}/chat`);
      console.log(`Clear conversation: http://${ip}:${port}/clear-conversation`);
      console.log(`Get history: http://${ip}:${port}/conversation-history`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      await mcpClient.cleanup();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();