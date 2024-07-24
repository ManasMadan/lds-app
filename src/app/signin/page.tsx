import SignInForm from "@/components/Forms/SignInForm";
import React from "react";

export default async function page() {
  return (
    <div className="grid w-screen h-screen place-items-center">
      <SignInForm />
    </div>
  );
}
