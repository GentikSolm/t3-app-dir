import { getServerSession } from "next-auth";
import DiscordLogin from "~/components/molecules/DiscordLogin";
import { appRouter } from "~/server/api/root";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import ClientPage from "./ClientPage";

export default async function Page() {
  // create trpc instance server side
  const trpc = appRouter.createCaller({
    db,
    session: await getServerSession(auth),
  });

  // call trpc route. Note we do not use `useMutation` or `useQuery`. We just directly call the function.
  const user = await trpc.user.get();
  return (
    <div className="mx-auto max-w-7xl flex pt-20 px-4 sm:px-6 lg:px-8">
      {/* We've used 3xl here, but feel free to try other max-widths based on your needs */}
      <div className="mx-auto max-w-3xl">
        {/* If we dont have a user, return the discord login button*/}
        {user ? <ClientPage user={user} /> : <DiscordLogin />}
      </div>
    </div>
  );
}
