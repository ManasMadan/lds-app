"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { Sidebar } from "@/components/layout/sidebar";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { Role } from "@prisma/client";

export default function AdminPanelLayout({
  children,
  userRole,
}: {
  children: React.ReactNode;
  userRole: Role;
}) {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  return (
    <>
      <Sidebar userRole={userRole} />
      <main
        className={cn(
          "min-h-screen bg-zinc-50 dark:bg-slate-900 transition-[margin-left] ease-in-out duration-300",
          sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-72"
        )}
      >
        {children}
      </main>
    </>
  );
}
