"use client";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { trpc } from "./providers";
import { useState, useTransition } from "react";
import { SITE_NAME } from "~/name";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, CheckCircleIcon } from "lucide-react";

export default function ClientPage({
  user,
}: {
  user: NonNullable<inferRouterOutputs<AppRouter>["user"]["get"]>;
}) {
  const [isTransitioning, startTransion] = useTransition();
  const [handle, setHandle] = useState("");
  const router = useRouter();
  const isClaimed = trpc.user.handle.isClaimed.useQuery({ handle });
  const claimHandle = trpc.user.handle.claim.useMutation({
    onSuccess: () => {
      // Since our user object is fetched server side, we use router.refresh to refetch it.
      // Start transition is used to track loading of router.refresh.
      startTransion(() => router.refresh());
      toast.success(`${handle} claimed as Handle!`);
    },
  });
  const isLoading = claimHandle.isLoading || isTransitioning
  return (
    <>
      <div className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow">
        <div className="flex flex-1 flex-col p-8">
          <h3 className="text-sm font-medium text-gray-900">
            {user.handle ?? "Select Handle"}
          </h3>
          <dl className="mt-1 flex flex-grow flex-col justify-between">
            <dt className="sr-only">Email</dt>
            <dd className="text-sm text-gray-500">{user.email}</dd>
          </dl>
        </div>
      </div>

      {!user.handle && (
        <>
          <label
            htmlFor="handle"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Handle
          </label>
          <div className="mt-2">
            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 sm:max-w-md">
              <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                {SITE_NAME.toLowerCase()}.com/
              </span>
              <input
                onChange={(e) => setHandle(e.target.value.toLowerCase())}
                value={handle ?? ""}
                type="text"
                name="handle"
                id="handle"
                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="janesmith"
              />
            </div>
            <p className="mt-2 min-h-[1.5rem] text-sm font-bold">
              {isClaimed.isFetching ? (
                <span className="flex gap-1 text-yellow-500">
                  <AlertTriangle
                    aria-hidden="true"
                    className="pointer-events-none inline h-5 w-5"
                  />
                  Checking availability...
                </span>
              ) : !isClaimed.data ? (
                <span className="flex gap-1 text-red-500">
                  <CheckCircleIcon
                    aria-hidden="true"
                    className="pointer-events-none inline h-5 w-5"
                  />
                  {handle} is taken.
                </span>
              ) : (
                <span className="flex gap-1 text-green-500">
                  <CheckCircleIcon
                    aria-hidden="true"
                    className="pointer-events-none inline h-5 w-5"
                  />
                  {handle} is available.
                </span>
              )}
            </p>
            <button
              className="mt-3 rounded-md bg-green-200 px-2 py-1.5 text-green-800 transition-colors hover:bg-green-600 hover:text-green-50"
              onClick={() => claimHandle.mutate({ handle })}
              disabled={!isClaimed.data || isClaimed.isFetching || isLoading}
            >
              Claim Handle
            </button>
          </div>
        </>
      )}
    </>
  );
}
