import { createServerClient } from "@supabase/ssr";
import { createClient as createCustomClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@repo/supabase/database.types";

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}

export async function getUser(supabase: any, headers: Headers) {
  if (!headers.has("Authorization")) return null;
  const token = JSON.parse(atob(headers.get("Authorization")!.split(" ")[1]));
  const { data: user, error } = await supabase.auth.setSession(token);
  if (error) {
    console.error(error);
    return null;
  }
  return user;
}

export function createAdminClient() {
  return createCustomClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET!,
  );
}
