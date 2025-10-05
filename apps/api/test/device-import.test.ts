import { expect, test, beforeAll } from "vitest";
import fetch from "node-fetch";
import { loadEnvConfig } from "@next/env";

beforeAll(async () => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);
});

test("Device Import", async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HOST}/device-import`,
    {
      method: "POST",
      body: JSON.stringify({
        startDate: new Date("2025-06-22").getTime() / 1000,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  expect(response.status).toBe(201);
});
