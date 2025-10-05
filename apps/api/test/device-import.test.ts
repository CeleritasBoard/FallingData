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
    },
  );
  expect(response.status).toBe(201);
});
