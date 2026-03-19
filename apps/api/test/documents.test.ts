import { expect, test, beforeAll, describe } from "vitest";
import fetch from "node-fetch";
import { loadEnvConfig } from "@next/env";
import { getSupaAuthCredentials, initSupaAuth } from "./utils/auth";

beforeAll(async () => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir, process.env.NODE_ENV === "development");

  initSupaAuth();
});

describe("Document Lifecycle", () => {
  let id: string;

  test("Document Creation", async () => {
    const token = await getSupaAuthCredentials();

    const createResp = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/documents`,
      {
        method: "PUT",
        body: JSON.stringify({
          path: "https://celeritas-board.hu",
          title: "Celeritas Board - Our homepage",
          authors: ["The Team"],
          date: Date.now(),
          type: "url",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    let text = await createResp.text();
    expect(createResp.status, text).toBe(201);
    const { id: createdId } = JSON.parse(text) as any;
    id = createdId;
  });

  test("Document Update", async () => {
    const token = await getSupaAuthCredentials();

    const updateResp = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/documents/${id}`,
      {
        method: "POST",
        body: JSON.stringify({
          title: "Celeritas Board - A főoldalunk",
          authors: ["The Team", "A csapat"],
          date: Date.now(),
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    let text = await updateResp.text();
    expect(updateResp.status, text).toBe(204);
  });

  test("Document Deletion", async () => {
    const token = await getSupaAuthCredentials();

    const deleteResp = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/documents/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    let text = await deleteResp.text();
    expect(deleteResp.status, text).toBe(204);
  });
});
