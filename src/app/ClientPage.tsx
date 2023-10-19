"use client";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { trpc } from "./providers";
import { useState } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { SITE_NAME } from "~/name";

export default function ClientPage({
  user,
}: {
  user: NonNullable<inferRouterOutputs<AppRouter>["user"]["get"]>;
}) {
  const [handle, setHandle] = useState("");
  const isClaimed = trpc.user.handle.isClaimed.useQuery({ handle });
  return (
    <>
      <div className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow">
        <div className="flex flex-1 flex-col p-8">
          <h3 className="mt-6 text-sm font-medium text-gray-900">
            {user.name}
          </h3>
          <dl className="mt-1 flex flex-grow flex-col justify-between">
            <dt className="sr-only">Email</dt>
            <dd className="text-sm text-gray-500">{user.email}</dd>
            <dt className="sr-only">Handle</dt>
            <dd className="mt-3">
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                {user.handle}
              </span>
            </dd>
          </dl>
        </div>
      </div>

      <label
        htmlFor="handle"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Handle
        <span className="group relative">
          <InformationCircleIcon className="mb-0.5 ml-1 hidden h-4 w-4 text-gray-400 sm:inline" />
          <span className="-top-1/2 ml-2 hidden whitespace-nowrap rounded-xl border-2 bg-white p-2 text-xs sm:absolute sm:group-hover:inline">
            Handles must be Alphanumeric
          </span>
          <span className="text-gray-500 sm:hidden">
            {" "}
            (handles must be alphanumeric)
          </span>
        </span>
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
              <ExclamationTriangleIcon
                aria-hidden="true"
                className="pointer-events-none inline h-5 w-5"
              />
              Checking availability...
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
      </div>
    </>
  );
}
