import SignOutButton from "@/components/Buttons/SignOutButton";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import React from "react";

export default async function page() {
  const session = (await getServerSession(authOptions))!;
  return (
    <div>
      {session.user.name}
      <SignOutButton />
    </div>
  );
}
