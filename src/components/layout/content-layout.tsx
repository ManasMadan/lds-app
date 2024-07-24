import { Navbar } from "@/components/layout/navbar";
import getUserRole from "@/lib/getUserRole";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

export async function ContentLayout({ title, children }: ContentLayoutProps) {
  const role = await getUserRole();
  return (
    <div>
      <Navbar title={title} userRole={role} />
      <div className="container pt-8 pb-8 px-4 sm:px-8">{children}</div>
    </div>
  );
}
