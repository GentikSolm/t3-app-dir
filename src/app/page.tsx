import { getServerSession } from "next-auth";
import DiscordLogin from "~/components/molecules/DiscordLogin";
import { appRouter } from "~/server/api/root";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export default async function Page() {
  const trpc = appRouter.createCaller({
    db,
    session: await getServerSession(auth),
  });
  const user = await trpc.user.get();
  return user ? <>Logged in as {user.name}</> : <DiscordLogin />;
}
