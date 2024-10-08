"use client";

import React from "react";
import {
  QueryClient as TanstackQueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

export default function QueryClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new TanstackQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
