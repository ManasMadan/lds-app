import DarkModeToggle from "@/components/DarkModeToggle";
import { UserNav } from "@/components/layout/user-nav";
import { SheetMenu } from "@/components/layout/sheet-menu";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface NavbarProps {
  title: string;
  userRole: Role;
}

export async function Navbar({ title, userRole }: NavbarProps) {
  const session = (await getServerSession(authOptions))!;

  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu userRole={userRole} />
          <h1 className="font-bold">{title}</h1>
        </div>
        <div className="flex flex-1 items-center space-x-2 justify-end">
          <DarkModeToggle />
          <UserNav user={session.user} userRole={session.user.role} />
        </div>
      </div>
    </header>
  );
}
