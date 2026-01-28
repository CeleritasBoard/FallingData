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

const generateRandomChars = (length: number) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let pwd = "";
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    pwd += chars[randomValues[i] % chars.length];
  }
  return pwd;
};

test("User Creation", async () => {
  const token = await getSupaAuthCredentials();

  const resp = await fetch(`${process.env.NEXT_PUBLIC_HOST}/users`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: `${generateRandomChars(10)}@celeritas-board.hu`,
    }),
  });
  expect(resp.status).toBe(201);
});
