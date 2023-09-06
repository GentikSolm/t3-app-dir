import type { AdapterAccount } from "@auth/core/adapters";
import {
  int,
  mysqlTable,
  primaryKey,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/mysql-core";

export type User = typeof Users.$inferSelect;
export const Users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  handle: varchar("handle", { length: 31 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).defaultNow(),
  bio: varchar("bio", { length: 511 }),
  cover: varchar("cover", { length: 255 }),
  name: varchar("name", { length: 31 }),
  joined: timestamp("joined", { mode: "date" }).defaultNow(),
});


export type Account = typeof Accounts.$inferSelect;
export const Accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: varchar("access_token", { length: 255 }),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  }),
);

export type Session = typeof Sessions.$inferSelect;
export const Sessions = mysqlTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export type VerificationToken = typeof VerificationTokens.$inferSelect;
export const VerificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);
