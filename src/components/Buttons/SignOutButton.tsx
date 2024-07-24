"use client";

import React from "react";
import { Button, ButtonProps } from "../ui/button";
import { signOut } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function SignOutButton(props: ButtonProps) {
  const mutation = useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {
      toast.success("Signed Out");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });
  return (
    <Button
      onClick={() => {
        mutation.mutate();
      }}
      {...props}
    >
      {mutation.isPending ? "Signing Out" : "Sign Out"}
    </Button>
  );
}
