import { expect, test, beforeAll, describe } from "vitest";
import fetch from "node-fetch";
import { loadEnvConfig } from "@next/env";
import { getSupaAuthCredentials, initSupaAuth } from "./utils/auth";
import { createClient } from "@supabase/supabase-js";

beforeAll(async () => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir, process.env.NODE_ENV === "development");

  initSupaAuth();
});

describe("Missions", () => {
  let id: number = 0;

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
          max_voltage: 3200,
          samples: 1,
          resolution: 64,
        },
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    let text = await createResp.text();

    expect(createResp.status, text).toBe(201);

    let json = JSON.parse(text) as any;

    id = json.id as number;
  });

  test("Mission Data Edit", async () => {
    const token = await getSupaAuthCredentials();

    const resp = await fetch(`${process.env.NEXT_PUBLIC_HOST}/missions/${id}`, {
      method: "POST",
      body: JSON.stringify({
        device: "BME_HUNITY",
        name: "something",
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    let text = await resp.text();

    expect(resp.status, text).toBe(200);
  });

  test("Mission Settings Edit", async () => {
    const token = await getSupaAuthCredentials();

    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/missions/${id}/settings`,
      {
        method: "POST",
        body: JSON.stringify({
          type: "MAX_TIME",
          is_header: true,
          is_okay: false,
          continue_with_full_channel: true,
          duration: 100,
          min_voltage: 128,
          max_voltage: 3000,
          samples: 1,
          resolution: 64,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    let text = await resp.text();

    expect(resp.status, text).toBe(200);
  });

  test("Mission Schedule", async () => {
    const token = await getSupaAuthCredentials();

    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/missions/${id}/schedule`,
      {
        method: "POST",
        body: JSON.stringify({
          date: Math.floor(Date.now() / 1000) + 10,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    let text = await resp.text();

    expect(resp.status, text).toBe(200);
  });

  test("Mission Publish", async () => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
    );

    const { error: missionUpdateError } = await supabase
      .from("missions")
      .update({
        status: "PROCESSING",
      })
      .eq("id", id);

    if (missionUpdateError) {
      expect(true, JSON.stringify(missionUpdateError)).toBe(false);
    }

    const token = await getSupaAuthCredentials();
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/missions/${id}/publish`,
      {
        method: "POST",
        body: JSON.stringify({
          date: Math.floor(Date.now() / 1000) + 10,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    let text = await resp.text();
    expect(resp.status, text).toBe(200);
  });
});
