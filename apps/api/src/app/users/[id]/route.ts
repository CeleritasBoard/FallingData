import { create } from "node:domain";
import {
  createClient,
  getUser,
  createAdminClient,
} from "../../../lib/supabase/server";
import { headers } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser(
    await createClient(),
    (await headers()) as Headers,
  );

  if (!user.user) return new Response("Unauthorized", { status: 401 });

  let { id } = await params;

  const admin = createAdminClient().auth.admin;

  const { data: _, error } = await admin.updateUserById(id, {
    user_metadata: { invited: true },
  });

  if (error) {
    console.error(error);
    return new Response("Bad Gateway", { status: 502 });
  }

  return new Response("OK", { status: 200 });
}
