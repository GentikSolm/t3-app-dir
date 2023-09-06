import { eq } from "drizzle-orm";
import { z } from "zod";
import { Users } from "~/db/schema/users";
import { protectedProcedure, router } from "../trpc";

export const userRouter = router({
  get: protectedProcedure.query(async({ctx}) => {
    return (await ctx.db.select().from(Users).where(eq(Users.id, ctx.session.user.id)))[0]
  }),
  handle: router({
    claim: protectedProcedure
      .input(z.object({ handle: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (input.handle === undefined) return false;
        if (input.handle === "") return false;
        if (!input.handle.match(/^[a-z0-9]+$/)) return false;
        if (input.handle.length > 30) return false;
        if (
          (
            await ctx.db
              .select({ id: Users.id })
              .from(Users)
              .where(eq(Users.handle, input.handle))
          ).length !== 0
        ) {
          return false;
        }
        await ctx.db
          .update(Users)
          .set({ handle: input.handle })
          .where(eq(Users.id, ctx.session.user.id));
        return true;
      }),
    isClaimed: protectedProcedure
      .input(z.object({ handle: z.string() }))
      .query(async ({ ctx, input }) => {
        if (
          (
            await ctx.db
              .select({ id: Users.id })
              .from(Users)
              .where(eq(Users.handle, input.handle))
          ).length !== 0
        ) {
          return false;
        }
        return true;
      }),
  }),
});
