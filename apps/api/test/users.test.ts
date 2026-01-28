import { expect, test, beforeAll } from "vitest";
import fetch from "node-fetch";
import { loadEnvConfig } from "@next/env";
import { getSupaAuthCredentials, initSupaAuth } from "./utils/auth";

beforeAll(async () => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir, process.env.NODE_ENV === "development");

  initSupaAuth();
});

test("User Listing", async () => {
  const token = await getSupaAuthCredentials();

  const resp = await fetch(`${process.env.NEXT_PUBLIC_HOST}/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(resp.status).toBe(200);

  const json = (await resp.json()) as any[];

  expect(
    json.find((item) => item.email == process.env.SUPABASE_TEST_EMAIL)?.status,
  ).toBe("TEST");
});
