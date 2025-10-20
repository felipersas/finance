import { useSession } from "@/providers/SessionProvider";
import { Redirect } from "expo-router";
import { ReactNode } from "react";
import { ActivityIndicator } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "../common";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { session, isLoading } = useSession();
  const tint = useThemeColor({}, "tint");

  if (isLoading) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={tint} />
      </ThemedView>
    );
  }

  if (requireAuth && !session) {
    return <Redirect href="/sign-in" />;
  }

  if (!requireAuth && session) {
    return <Redirect href="/(private)/(tabs)" />;
  }

  return <>{children}</>;
}
