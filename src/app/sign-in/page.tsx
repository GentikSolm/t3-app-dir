import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { env } from "~/env.mjs";
import { auth } from "~/server/auth";
import ClientPage from "./ClientPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const user = await getServerSession(auth);
  if (!user) {
    return (
      <ClientPage
        isPreview={
          env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development"
        }
      />
    );
  }
  if (searchParams.callbackUrl) redirect(searchParams.callbackUrl);
  redirect("/");
}
