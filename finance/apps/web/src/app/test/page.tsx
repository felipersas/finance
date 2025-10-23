

"use client"

import React, { useRef, useState } from "react";
import { useUploadCsvMutation } from "@/hooks/useUploadCsv";

export default function TestCsvUpload() {
  const mutation = useUploadCsvMutation();
  const [name, setName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const file = fileInputRef.current?.files?.[0];
    if (!name || !file) {
      alert("Preencha todos os campos!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("csv", file);

    mutation.mutate(formData as any); // "as any" para passar pelo TS, pois o mutation espera um objeto
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label>
        Nome do arquivo:
        <input
          type="text"
          name="name"
          required
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </label>
      <label>
        CSV:
        <input
          type="file"
          name="csv"
          accept=".csv,text/csv"
          ref={fileInputRef}
          required
        />
      </label>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Enviando..." : "Enviar CSV"}
      </button>
      {mutation.isSuccess && <div>Upload realizado com sucesso!</div>}
      {mutation.isError && <div>Erro ao enviar: {mutation.error?.message}</div>}
    </form>
  );
};
