import NextAuth from "next-auth";
import { auth } from "~/server/auth";

const handler = NextAuth(auth) as undefined;

export { handler as GET, handler as POST };
