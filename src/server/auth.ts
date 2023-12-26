import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Session as DBSession, User } from "~/db/schema/users";
import {
  Accounts,
  Sessions,
  Users,
  VerificationTokens,
} from "~/db/schema/users";
import { env } from "~/env.mjs";
import { db } from "./db";
import { raise } from "~/raise";

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
      name: string | null;
    };
  }
  interface DefaultUser {
    id: string;
    handle?: string | null;
    name?: string | null;
    email?: string | null;
  }
}

export const auth: NextAuthOptions = {
  pages: {
    signIn: "/sign-in",
    signOut: "/",
    newUser: "/",
  },
  // Needed for apple oauth.
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
  adapter: {
    // @@NOTE this lets us define custom columns in our database
    async createUser(data) {
      const id = crypto.randomUUID();
      await db.insert(Users).values({
        email: data.email,
        id,
      });

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
  session:
      // @@NOTE swap to jwt for preview
    env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development"
      ? {
          strategy: "jwt",
        }
      : undefined,
  callbacks: {
    jwt:
      // @@NOTE swap to jwt for preview
      env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development"
        ? async ({ token }) => {
            const [user] = await db
              .select()
              .from(Users)
              .where(eq(Users.email, token.email!));
            const res = { ...token, user };
            return res;
          }
        : undefined,
    redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    session: ({ session, user, token }) => {
      // @@NOTE session for jwt's is actually the token.user for preview deployments
      if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development")
        return {
          ...session,
          user: token.user as User,
        };
      return {
        ...session,
        user: {
          id: user.id,
          handle: user.handle,
          email: user.email,
          name: user.name,
        },
      };
    },
  },
  providers:
    // @@NOTE Use credentials provider for preview deployments
    env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development"
      ? [
          CredentialsProvider({
            name: "Credentials",
            credentials: {
              handle: {
                label: "handle",
                type: "text",
                placeholder: "jsmith",
              },
              password: { label: "Password", type: "password" },
            },
            async authorize(data) {
              if (!data?.handle) return null;
              // @@NOTE Whitelist accounts that we can log into preview with
              if (!["josh"].includes(data.handle))
                return null;
              const user = await db
                .select()
                .from(Users)
                .where(eq(Users.handle, data.handle));
              return user.at(0) ?? raise("Where's our User? Do we need to seed?");
            },
          }),
        ]
      : [
          DiscordProvider({
            allowDangerousEmailAccountLinking: true,
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
          }),
        ],
};

export const isLoggedIn = () => {
  // @@NOTE util function for checking if there is a session token
  // without actually querying the database. This is optimistic,
  // the toekn could be invalid or expired, so make sure to use carefully.
  return (
    cookies().has("__Secure-next-auth.session-token") ||
    cookies().has("next-auth.session-token")
  );
};
