import { getServerSession } from "next-auth";
import { appRouter } from "~/server/api/root";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import ClientPage from "./ClientPage";
import Link from "next/link";

export default async function Page() {
  // @@NOTE create trpc instance server side
  const trpc = appRouter.createCaller({
    db,
    session: await getServerSession(auth),
  });

  // @@NOTE call trpc route. Note we do not use `useMutation` or `useQuery`. We just directly call the function.
  const user = await trpc.user.get();

  return (
    <div className="mx-auto flex max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
      {/* We've used 3xl here, but feel free to try other max-widths based on your needs */}
      <div className="mx-auto max-w-3xl">
        {/* If we dont have a user, return the discord login button*/}
        {user ? (
          <ClientPage user={user} />
        ) : (
          <Link href="/sign-in">Log In</Link>
        )}
      </div>
    </div>
  );
}
