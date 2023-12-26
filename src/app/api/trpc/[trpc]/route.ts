import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { withAxiom, type AxiomRequest } from "next-axiom";

import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const handler = withAxiom((request: AxiomRequest) => {
  return fetchRequestHandler({
    router: appRouter,
    createContext: createTRPCContext,
    endpoint: "/api/trpc",
    req: request,
    onError(error) {
      // @@NOTE axiom error logging
      request.log.error("TRPC Error", { ...error });
      return error.error;
    },
  });
});

export { handler as GET, handler as POST };
