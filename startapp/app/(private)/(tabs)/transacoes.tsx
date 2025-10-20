import { ExtractList } from "@/components/transactions";
import { ThemedView } from "@/components/common";
import React from "react";

export default function Transacoes() {
  return (
    <ThemedView className="flex-1 bg-transparent">
      <ExtractList />
    </ThemedView>
  );
}
