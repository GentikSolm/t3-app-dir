import { and, eq } from "drizzle-orm";
import { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import {
  Accounts,
  Sessions,
  Users,
  VerificationTokens,
  type Session as DBSession,
  type User,
} from "~/db/schema/users";
import { env } from "~/env.mjs";
import { db } from "./db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      handle: string | null;
      email: string | null;
      image: string | null;
    };
  }
  interface DefaultUser {
    id: string;
    handle?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export const auth: NextAuthOptions = {
  pages: {
    signIn: "/sign-in",
    signOut: "/logout",
    newUser: "/",
  },
  adapter: {
    async createUser(data) {
      const id = crypto.randomUUID();

      await db
        .insert(Users)
        .values({ email: data.email, image: data.image, id });

      return (await db
        .select()
        .from(Users)
        .where(eq(Users.id, id))
        .then((res) => res[0])) as User;
    },
    async getUser(data) {
      const thing =
        (await db
          .select()
          .from(Users)
          .where(eq(Users.id, data))
          .then((res) => res[0])) ?? null;

      return thing;
    },
    async getUserByEmail(data) {
      const user =
        (await db
          .select()
          .from(Users)
          .where(eq(Users.email, data))
          .then((res) => res[0])) ?? null;

      return user;
    },
    async createSession(data) {
      await db.insert(Sessions).values(data);

      return (await db
        .select()
        .from(Sessions)
        .where(eq(Sessions.sessionToken, data.sessionToken))
        .then((res) => res[0])) as DBSession;
    },
    async getSessionAndUser(data) {
      const sessionAndUser =
        (await db
          .select({
            session: Sessions,
            user: Users,
          })
          .from(Sessions)
          .where(eq(Sessions.sessionToken, data))
          .innerJoin(Users, eq(Users.id, Sessions.userId))
          .then((res) => res[0])) ?? null;

      return sessionAndUser;
    },
    async updateUser(data) {
      if (!data.id) {
        throw new Error("No user id.");
      }

      await db.update(Users).set(data).where(eq(Users.id, data.id));

      return (await db
        .select()
        .from(Users)
        .where(eq(Users.id, data.id))
        .then((res) => res[0])) as User;
    },
    async updateSession(data) {
      await db
        .update(Sessions)
        .set(data)
        .where(eq(Sessions.sessionToken, data.sessionToken));

      return await db
        .select()
        .from(Sessions)
        .where(eq(Sessions.sessionToken, data.sessionToken))
        .then((res) => res[0]);
    },
    async linkAccount(rawAccount) {
      await db.insert(Accounts).values(rawAccount);
    },
    async getUserByAccount(account) {
      const dbAccount =
        (await db
          .select()
          .from(Accounts)
          .where(
            and(
              eq(Accounts.providerAccountId, account.providerAccountId),
              eq(Accounts.provider, account.provider),
            ),
          )
          .leftJoin(Users, eq(Accounts.userId, Users.id))
          .then((res) => res[0])) ?? null;

      if (!dbAccount) {
        return null;
      }

      return dbAccount.user;
    },
    async deleteSession(sessionToken) {
      const session =
        (await db
          .select()
          .from(Sessions)
          .where(eq(Sessions.sessionToken, sessionToken))
          .then((res) => res[0])) ?? null;

      await db.delete(Sessions).where(eq(Sessions.sessionToken, sessionToken));

      return session;
    },
    async createVerificationToken(token) {
      await db.insert(VerificationTokens).values(token);

      return await db
        .select()
        .from(VerificationTokens)
        .where(eq(VerificationTokens.identifier, token.identifier))
        .then((res) => res[0]);
    },
    async useVerificationToken(token) {
      try {
        const deletedToken =
          (await db
            .select()
            .from(VerificationTokens)
            .where(
              and(
                eq(VerificationTokens.identifier, token.identifier),
                eq(VerificationTokens.token, token.token),
              ),
            )
            .then((res) => res[0])) ?? null;

        await db
          .delete(VerificationTokens)
          .where(
            and(
              eq(VerificationTokens.identifier, token.identifier),
              eq(VerificationTokens.token, token.token),
            ),
          );

        return deletedToken;
      } catch (err) {
        throw new Error("No verification token found.");
      }
    },
    async deleteUser(id) {
      const user = await db
        .select()
        .from(Users)
        .where(eq(Users.id, id))
        .then((res) => res[0] ?? null);

      await db.delete(Users).where(eq(Users.id, id));

      return user;
    },
    async unlinkAccount(account) {
      await db
        .delete(Accounts)
        .where(
          and(
            eq(Accounts.providerAccountId, account.providerAccountId),
            eq(Accounts.provider, account.provider),
          ),
        );

      return undefined;
    },
  },
  callbacks: {
    redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        id: user.id,
        handle: user.handle,
        email: user.email,
        image: user.image,
      },
    }),
  },
  providers: [
    DiscordProvider({
      allowDangerousEmailAccountLinking: true,
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ],
};
