import { expect, test, beforeAll } from "vitest";
import fetch from "node-fetch";
import { loadEnvConfig } from "@next/env";
import { getSupaAuthCredentials, initSupaAuth } from "./utils/auth";

beforeAll(async () => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir, process.env.NODE_ENV === "development");

  initSupaAuth();
});

test("Mission Creation", async () => {
  const token = await getSupaAuthCredentials();

  const createResp = await fetch(`${process.env.NEXT_PUBLIC_HOST}/missions`, {
    method: "PUT",
    body: JSON.stringify({
      device: "ONIONSAT_TEST",
      name: "",
      settings: {
        type: "MAX_HITS",
        is_header: true,
        is_okay: false,
        continue_with_full_channel: true,
        duration: 10,
        min_voltage: 128,
        max_voltage: 4095,
        samples: 1,
        resolution: 64,
      },
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  expect(createResp.status, await createResp.text()).toBe(201);
});
