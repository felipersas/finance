import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  const subscriptionsData = await authClient.customer.subscriptions.list({
    query: {
      active: true,
    },
    fetchOptions: {
      headers: await headers(),
    },
  });

  const hasSubscription =
    (subscriptionsData.data?.result?.items?.length ?? 0) > 0;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        session={session}
        hasSubscription={hasSubscription}
      />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
