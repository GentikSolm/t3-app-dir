import { getServerSession } from "next-auth";
import DiscordLogin from "~/components/molecules/DiscordLogin";
import { auth } from "~/server/auth";

export default async function Page() {
  const user = await getServerSession(auth)
  return user ? <>Logged in as {user.user.email}</> : <DiscordLogin/>;
}
