import { Inter } from "next/font/google";
import "@/app/globals.css";
import ThemeClient from "@/components/ThemeClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AuthClient from "@/components/AuthClient";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeClient>
          <AuthClient session={session}>{children}</AuthClient>
        </ThemeClient>
      </body>
    </html>
  );
}
