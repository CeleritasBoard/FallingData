import { headers } from "next/headers";

export async function check_json_header(request: Request) {
  const headerList = await headers();
  if (
    !(
      headerList.has("Content-Type") &&
      headerList.get("Content-Type") === "application/json"
    )
  )
    return new Response("Unsupported media", { status: 415 });
  return null;
}
