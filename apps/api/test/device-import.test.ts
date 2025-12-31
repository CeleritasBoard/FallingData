import { expect, test, beforeAll } from "vitest";
import fetch from "node-fetch";
import { loadEnvConfig } from "@next/env";
import { initSupaAuth, getSupaAuthCredentials } from "./utils/auth";
import * as fs from "node:fs";
import * as path from "node:path";

beforeAll(async () => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);
  await initSupaAuth();
});

test("Onionsat Device Import", async () => {
  const token = await getSupaAuthCredentials();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HOST}/device-import`,
    {
      method: "POST",
      body: JSON.stringify({
        startDate: new Date("2025-06-22").getTime() / 1000,
        device: "ONIONSAT_TEST",
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  expect(response.status).toBe(201);
});

test("Sloth Device Import", async () => {
  const content = fs.readFileSync(
    path.resolve(__dirname, "../../../test_data/test.cel"),
    "utf8",
  );

  const token = await getSupaAuthCredentials();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HOST}/device-import`,
    {
      method: "POST",
      body: JSON.stringify({
        startDate: new Date("2025-12-31").getTime() / 1000,
        device: "SLOTH",
        content,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  expect(response.status).toBe(201);
});
