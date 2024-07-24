import { authOptions } from "@/lib/auth";
import { getServerSession, Session } from "next-auth";
import React from "react";

export default async function page() {
  const session = await getServerSession(authOptions);
  return <div>page</div>;
}
