import { check_json_header } from "@/lib/checks";
import { createClient, getUser } from "@/lib/supabase/server";
import { headers } from "next/headers";
import * as z from "zod";

const NewDocumentSchema = z.object({
  path: z.string(),
  title: z.string(),
  authors: z.string().array(),
  date: z.number(),
  type: z.enum(["file", "url"]),
});

type JSON_INPUT = z.infer<typeof NewDocumentSchema>;

export async function PUT(request: Request) {
  try {
    const supa = await createClient();
    const user = await getUser(supa, (await headers()) as Headers);

    let res = await check_json_header(request);
    if (res !== null) return res;
    let json: JSON_INPUT | undefined | null = await request.json();
    if (!json) return new Response("Bad request", { status: 400 });

    const parseResult = NewDocumentSchema.safeParse(json);

    if (!parseResult.success)
      return new Response(JSON.stringify(parseResult.error), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    json = parseResult.data;

    const { data, error } = await supa
      .from("documents")
      .insert({
        path: json.path!,
        title: json.title!,
        authors: json.authors!,
        date: new Date(json.date!).toISOString(),
        type: json.type!,
        uploader: user.id,
      })
      .select()
      .single();
    if (error) throw error;
    return new Response(JSON.stringify(data), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
