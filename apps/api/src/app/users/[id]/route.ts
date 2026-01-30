import { createAdminClient } from "../../../lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let { id } = await params;

  const admin = createAdminClient().auth.admin;

  const { data: _, error } = await admin.updateUserById(id, {
    user_metadata: { invited: true },
  });

  if (error) {
    console.error(error);
    return new Response("Bad Gateway", { status: 502 });
  }

  return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
}
