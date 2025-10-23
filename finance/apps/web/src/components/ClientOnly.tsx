"use client";
import { useEffect, useState } from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
}

/**
 * Componente que garante que os filhos só serão renderizados no client,
 * evitando problemas de hydration mismatch com conteúdo dinâmico.
 */
export function ClientOnly({ children }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <>{children}</>;
}
