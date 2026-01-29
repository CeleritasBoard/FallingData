import { createAdminClient } from "../../lib/supabase/server";
import { headers } from "next/headers";

export async function GET(request: Request) {
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
        let user_state = "?";

        if (
          user.email == process.env.SUPABASE_TEST_EMAIL ||
          user.email?.endsWith("@celeritas-board.hu")
        )
          user_state = "TEST";
        else if (!meta.invited) user_state = "?";
        else if (meta.invited && !(meta.full_name && meta.email))
          user_state = "NEW";
        else if (meta.invited && meta.full_name && meta.email)
          user_state = "CONFIRMED";

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

export async function PUT(req: Request) {
  try {
    const headerList = await headers();
    if (
      !(
        headerList.has("Content-Type") &&
        headerList.get("Content-Type") === "application/json"
      )
    )
      return new Response("Unsupported media", { status: 415 });

    let json: { email?: string } | undefined | null = await req.json();

    if (!json || !json.email)
      return new Response("Bad Request", { status: 400 });

    console.log("Creating user with email:", json.email);
    const admin = createAdminClient().auth.admin;
    const { data: _, error } = await admin.createUser({
      email: json.email!,
      password: (() => {
        const length = 12;
        const chars =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}<>?";
        let pwd = "";
        const randomValues = crypto.getRandomValues(new Uint8Array(length));
        for (let i = 0; i < length; i++) {
          pwd += chars[randomValues[i] % chars.length];
        }
        return pwd;
      })(),
      email_confirm: true,
      user_metadata: {
        invited: true,
      },
    });

    if (error) {
      console.error(error);
      return new Response("Bad Gateway", { status: 502 });
    }
    return new Response(
      JSON.stringify({ message: "Created" }, { status: 201 }),
    );
  } catch (e) {
    console.error(e);
    return new Response("Bad Gateway", { status: 502 });
  }
}
