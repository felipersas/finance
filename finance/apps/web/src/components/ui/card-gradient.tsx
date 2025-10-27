import { cn } from "@/lib/utils";
import React from "react";

/**
 * CardGradient
 * Componente genérico para aplicar o gradient visual padrão dos cards do dashboard.
 * Encapsula o background gradient e permite conteúdo customizado via children.
 *
 * Props:
 * - className: classes adicionais para o container
 * - children: conteúdo do card
 * - opacity: opacidade do gradient (default: 0.2)
 */
type CardGradientProps = {
  className?: string;
  children: React.ReactNode;
  opacity?: number;
};

export function CardGradient({
  className,
  children,
  opacity = 0.2,
}: CardGradientProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-6 border border-muted",
        className,
      )}
    >
      <div
        className="absolute inset-0 z-0 pointer-events-none rounded-xl"
        style={{
          opacity,
          background: `
            linear-gradient(
              135deg,
              var(--color-primary) 0%,
              var(--color-accent) 60%,
              var(--color-muted) 100%
            )
          `,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
