import { eq } from "drizzle-orm";
import { z } from "zod";
import { Accounts, Sessions, Users } from "~/db/schema/users";
import { db } from "~/server/db";
import { protectedProcedure, router } from "../trpc";

export const userRouter = router({
  __DANGEROUS__delete: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session.user) return null;
    await db.delete(Users).where(eq(Users.id, ctx.session.user.id));
    await db.delete(Accounts).where(eq(Accounts.userId, ctx.session.user.id));
    await db.delete(Sessions).where(eq(Sessions.userId, ctx.session.user.id));
    return null;
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
