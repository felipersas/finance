

"use server";

import { mastra } from "@/mastra";
import { RuntimeContext } from "@mastra/core/runtime-context";

// Recebe a mensagem e o userId, retorna o texto completo do stream
export async function chatWithAgent(message: string, userId: string) {
  const agent = mastra.getAgent("sqlAgent");

  if (!agent) {
    throw new Error("Agent 'sqlAgent' not found in codyn-mastra.");
  }

  const runtimeContext = new RuntimeContext<{ userId: string }>();
  runtimeContext.set("userId", userId);

  const stream = await agent.stream(
    [
      {
        role: "user",
        content: message,
      },
    ],
    {
      runtimeContext,
      modelSettings: {
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
      memory: {
        thread: userId,
        resource: userId,
        options: {
          lastMessages: 4,
        }
      }
    }
  );

  // O stream provavelmente tem uma propriedade textStream que é async iterable
  let responseText = "";
  if (stream.textStream && typeof stream.textStream[Symbol.asyncIterator] === "function") {
    for await (const chunk of stream.textStream) {
      responseText += typeof chunk === "string" ? chunk : chunk.text ?? "";
    }
  } else if (typeof stream === "string") {
    responseText = stream;
  } else {
    throw new Error("Agent stream did not return an async iterable or string.");
  }

  // Retorne no formato esperado pelo frontend (Message)
  return {
    role: "assistant",
    content: responseText || "No response from agent.",
  };
}
