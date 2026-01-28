import {
  createClient,
  getUser,
  createAdminClient,
} from "../../lib/supabase/server";
import { Database } from "@repo/supabase/database.types";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const headerList = await headers();
  const user = await getUser(await createClient(), headerList);

  if (!user) return new Response("Unauthorized", { status: 401 });

  const admin = createAdminClient().auth.admin;

  const { data: users, error } = await admin.listUsers();
  if (error) {
    console.log(error);
    return new Response("Bad Gateway", { status: 502 });
  }

  return new Response(
    JSON.stringify(
      users.users.map((user) => {
        const meta = user.user_metadata;
        let user_state = "SUSPICIOUS";

        if (meta.invited && !(meta.full_name && meta.email)) user_state = "NEW";
        else if (meta.invited && meta.full_name && meta.email)
          user_state = "CONFIRMED";
        else if (user.email == process.env.SUPABASE_TEST_EMAIL)
          user_state = "TEST";

        return {
          id: user.id,
          email: user.email!,
          display_name: user.user_metadata.full_name ?? user.email!,
          avatar: user.user_metadata.avatar,
          status: user_state,
        };
      }),
    ),
    { status: 200 },
  );
}
