"use client";

import { useState, useRef, useEffect } from "react";
import { PromptSuggestions } from "@/components/ui/prompt-suggestions";
import { chatWithAgent } from "@/actions/agent-action";
import { authClient } from "@/lib/auth-client";
import { MessageList } from "@/components/ui/message-list";
import { MessageInput } from "@/components/ui/message-input";
import { useBalanceCheck } from "@/hooks/use-balance-check";
import { useRouter } from "next/navigation";

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
  const [sessionBlocked, setSessionBlocked] = useState(false);

  const { data } = authClient.useSession();

  const {
    blocked: balanceBlocked,
    loading: balanceLoading,
    checkBalance,
  } = useBalanceCheck();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const appendHardcodedMessage = () => {
    const hardcodedMessage = {
      id: `${Date.now()}-assistant`,
      role: "assistant" as const,
      content:
        "Seus créditos acabaram. Recarregue sua conta para continuar conversando com a IA.",
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, hardcodedMessage]);
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || loading || sessionBlocked) return;
    const isBlocked = await checkBalance();
    if (isBlocked) {
      setSessionBlocked(true);
      return;
    }
    appendUserMessage({ role: "user", content: text });
    setInput("");
  };

  if (!balanceLoading && balanceBlocked) {
    return (
      <div className="h-full flex flex-col items-center justify-center w-full mx-auto p-4 bg-background">
        <div className="max-w-md text-center space-y-6">
          <div className="text-lg font-semibold text-destructive">
            Seus créditos acabaram. 😢
          </div>
          <div className="text-muted-foreground">
            Para continuar conversando com a IA, aguarde até a renovação do seu
            plano ou recarregue sua conta.
          </div>
          <button
            className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
            onClick={() => router.push("/")}
            type="button"
          >
            Comprar créditos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-rows-[auto_1fr_auto] overflow-hidden w-full mx-auto p-4 bg-background relative">
      {sessionBlocked && (
        <div className="w-full flex items-center justify-center mb-4">
          <div className="bg-destructive/10 border border-destructive px-4 py-2 rounded text-destructive font-medium text-center max-w-md">
            Seus créditos acabaram durante a conversa. Recarregue sua conta para
            continuar usando a IA.
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
          placeholder="Digite sua mensagem..."
          disabled={balanceBlocked || sessionBlocked || loading}
        />
      </form>
    </div>
  );
}
