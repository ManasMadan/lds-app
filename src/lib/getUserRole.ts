import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export default async function getUserRole() {
  const session = await getServerSession(authOptions);
  return session?.user.role!;
}
