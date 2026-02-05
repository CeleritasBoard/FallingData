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

export async function check_param(param: number, supa: any, table: string) {
  const { count, error } = await supa
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("id", param);

  if (error) {
    console.error(error);
    return new Response("Bad Gateway", { status: 502 });
  }

  if (count == 0) return new Response("Not found", { status: 404 });
  return null;
}
