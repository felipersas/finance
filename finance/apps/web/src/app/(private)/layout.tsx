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

	return (
				<div>
					{children}
				</div>
	);
}
