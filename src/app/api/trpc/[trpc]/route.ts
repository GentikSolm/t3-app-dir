import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const handler = (request: NextRequest) => {
  return fetchRequestHandler({
    router: appRouter,
    createContext: createTRPCContext,
    endpoint: "/api/trpc",
    req: request,
    onError({ error }) {
      console.log("Error: ", error.message);
      console.log("Reason: ", JSON.stringify(error.cause, null, 4));
    },
  });
};

export { handler as GET, handler as POST };
