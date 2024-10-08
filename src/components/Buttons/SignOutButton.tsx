"use client";

import React from "react";
import { Button, ButtonProps } from "../ui/button";
import { signOut } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface SignOutButtonProps extends ButtonProps {
  loading?: React.ReactNode;
  children?: React.ReactNode;
}

export default function SignOutButton({
  loading,
  children,
  ...buttonProps
}: SignOutButtonProps) {
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
      {...buttonProps}
    >
      {mutation.isPending ? loading || children : children}
    </Button>
  );
}
