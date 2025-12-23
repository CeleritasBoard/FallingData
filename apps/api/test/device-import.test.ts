import { expect, test, beforeAll } from "vitest";
import fetch from "node-fetch";
import { loadEnvConfig } from "@next/env";
import { initSupaAuth, getSupaAuthCredentials } from "./utils/auth";

beforeAll(async () => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);
  await initSupaAuth();
});

test("Device Import", async () => {
  const token = await getSupaAuthCredentials();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HOST}/device-import`,
    {
      method: "POST",
      body: JSON.stringify({
        startDate: new Date("2025-06-22").getTime() / 1000,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  expect(response.status).toBe(201);
});
