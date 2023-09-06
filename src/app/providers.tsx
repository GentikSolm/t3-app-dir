"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createTRPCReact,
  getFetch,
  httpBatchLink,
  loggerLink,
} from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import superjson from "superjson";
import type { AppRouter } from "~/server/api/root";

export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "/api/trpc"; // browser should use relative url
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}/api/trpc`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}/api/trpc`; // dev SSR should use localhost
};

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5000 } },
      }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: () => false,
        }),
        httpBatchLink({
          url: getBaseUrl(),
          fetch: async (input, init?) => {
            const fetch = getFetch();
            return fetch(input, {
              ...init,
              credentials: "include",
            });
          },
        }),
      ],
      transformer: superjson,
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
