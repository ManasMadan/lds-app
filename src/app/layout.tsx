import { Inter } from "next/font/google";
import "@/app/globals.css";
import ThemeClient from "@/components/Providers/ThemeClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AuthClient from "@/components/Providers/AuthClient";
import QueryClient from "@/components/Providers/QueryClient";
import { Toaster } from "react-hot-toast";

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
        <script
          type="module"
          defer
          src="https://cdn.jsdelivr.net/npm/ldrs/dist/auto/spiral.js"
        ></script>
        <ThemeClient
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClient>
            <AuthClient session={session}>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className: "dark:bg-gray-800 dark:text-gray-100",
                }}
              />
              {children}
            </AuthClient>
          </QueryClient>
        </ThemeClient>
      </body>
    </html>
  );
}
