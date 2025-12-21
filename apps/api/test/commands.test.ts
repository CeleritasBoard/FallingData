import { expect, test, beforeAll } from "vitest";
import fetch from "node-fetch";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { getSupaAuthCredentials, initSupaAuth } from "./utils/auth";

beforeAll(async () => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);

  initSupaAuth();
});

test("Command Deletion", async () => {
  const token = await getSupaAuthCredentials();

  const createResp = await fetch(`${process.env.NEXT_PUBLIC_HOST}/commands`, {
    method: "PUT",
    body: JSON.stringify({
      device: "ONIONSAT_TEST",
      type: "FORCE_STATUS_REPORT",
      params: {},
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  expect(createResp.status).toBe(201);

  const { id } = (await createResp.json()) as any;

  const getResp = await fetch(
    `${process.env.NEXT_PUBLIC_HOST}/commands/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  expect(getResp.status).toBe(200);
});
