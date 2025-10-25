"use client";

import { useState, useRef, useEffect } from "react";
import { PromptSuggestions } from "@/components/ui/prompt-suggestions";
import { chatWithAgent } from "@/actions/agent-action";
import { authClient } from "@/lib/auth-client";
import { MessageList } from "@/components/ui/message-list";
import { MessageInput } from "@/components/ui/message-input";
import { auth } from "@finance/auth";
import { useBalanceCheck } from "@/hooks/use-balance-check";

// Sugestões iniciais para o chat
const SUGGESTIONS = [
  "Quais são meus gastos este mês?",
  "Me mostre um resumo das minhas receitas.",
  "Como posso economizar mais?",
  "Qual foi minha maior despesa recente?",
];

export function AIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    {
      id: string;
      role: "user" | "assistant";
      content: string;
      createdAt?: Date;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const { data } = authClient.useSession();

  const { blocked: balanceBlocked, loading: balanceLoading } =
    useBalanceCheck();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const appendUserMessage = async (message: {
    role: "user";
    content: string;
  }) => {
    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user" as const,
      content: message.content,
      createdAt: new Date(),
    };
    const { data: ingested } = await authClient.usage.ingest({
      event: "total_prompts",
      metadata: {
        total_prompts: 1,
      },
    });

    console.log(ingested);
    setMessages((prev) => [...prev, userMessage]);
    handleAgentResponse(message.content);
  };

  const handleAgentResponse = async (text: string) => {
    setLoading(true);
    try {
      const response = await chatWithAgent(text, data?.user.id!);
      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant" as const,
        content: response.content,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        id: `${Date.now()}-error`,
        role: "assistant" as const,
        content: "Erro ao conversar com o agente.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || loading || balanceBlocked) return;
    appendUserMessage({ role: "user", content: text });
    setInput("");
  };

  return (
    <div className="h-full grid grid-rows-[auto_1fr_auto] overflow-hidden w-full mx-auto p-4 bg-background relative">
      {balanceBlocked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center p-6 max-w-md">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="text-lg font-semibold mb-2">Créditos Esgotados</h3>
            <p className="text-muted-foreground">
              Seus créditos acabaram. Recarregue sua conta para continuar
              conversando com a IA.
            </p>
          </div>
        </div>
      )}

      <div className="mb-12 mt-20">
        {messages.length === 0 && !balanceBlocked && (
          <PromptSuggestions
            label="Sugestões para começar"
            append={appendUserMessage}
            suggestions={SUGGESTIONS}
          />
        )}
      </div>
      <div className="overflow-y-auto space-y-4 pb-4">
        <MessageList
          messages={messages}
          showTimeStamps={true}
          isTyping={loading}
        />
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full flex items-center space-x-2 pt-2 border-t bg-background"
      >
        <MessageInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          isGenerating={loading}
          placeholder={
            balanceBlocked ? "Créditos esgotados..." : "Digite sua mensagem..."
          }
          disabled={balanceBlocked}
        />
      </form>
    </div>
  );
}
