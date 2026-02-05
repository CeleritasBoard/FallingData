import { expect, test, beforeAll } from "vitest";
import fetch from "node-fetch";
import { loadEnvConfig } from "@next/env";
import { getSupaAuthCredentials, initSupaAuth } from "./utils/auth";

beforeAll(async () => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir, process.env.NODE_ENV === "development");

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

  const deleteResp = await fetch(
    `${process.env.NEXT_PUBLIC_HOST}/commands/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  expect(deleteResp.status).toBe(200);
});

test("Command Schedule", async () => {
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

  const scheduleResp = await fetch(
    `${process.env.NEXT_PUBLIC_HOST}/commands/${id}`,
    {
      method: "POST",
      body: JSON.stringify({
        date: Date.now() / 1000 + 120,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  expect(scheduleResp.status).toBe(200);
});
