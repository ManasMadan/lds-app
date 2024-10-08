import RootLayout from "@/components/layout/root-layout";
import getUserRole from "@/lib/getUserRole";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getUserRole();
  return <RootLayout userRole={role}>{children}</RootLayout>;
}
