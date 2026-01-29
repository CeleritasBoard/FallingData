"use server";

import apiFetch from "@/lib/api_client";
import { UserItem, type IUserParams } from "./user-item";
import { createClient } from "@/lib/supabase/server";

export default async function UsersPage() {
  const supa = await createClient();
  const data = (await apiFetch(
    "/users",
    "GET",
    null,
    null,
    supa,
  )) as IUserParams[];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Felhasználók
        </h1>
      </div>
      <div className="grid grid-flow-col col-span-4">
        {data.map((item) => (
          <UserItem key={item.id} data={item} />
        ))}
      </div>
    </div>
  );
}
