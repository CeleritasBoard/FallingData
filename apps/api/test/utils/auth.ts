import { createClient } from "@supabase/supabase-js";

/**
 * Initialize Supabase authentication for testing purposes.
 * Use only after the env vars are loaded.
 */
export async function initSupaAuth() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.SUPABASE_TEST_EMAIL!,
    password: process.env.SUPABASE_TEST_PASSWORD!,
  });

  if (!data.user) {
    // We take that our test user does not exist, so we create it
    const { data: createdUser, error: createUserError } =
      await supabase.auth.signUp({
        email: process.env.SUPABASE_TEST_EMAIL!,
        password: process.env.SUPABASE_TEST_PASSWORD!,
      });

    console.log(createdUser);

    if (createUserError) {
      console.error(createUserError);
      process.exit(1);
    }
  }
}

export async function getSupaAuthCredentials() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.SUPABASE_TEST_EMAIL!,
    password: process.env.SUPABASE_TEST_PASSWORD!,
  });

  if (error) {
    console.error(error);
    process.exit(1);
  }

  return btoa(
    JSON.stringify({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    }),
  );
}
