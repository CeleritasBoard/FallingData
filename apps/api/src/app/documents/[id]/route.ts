import { createClient } from "../../../lib/supabase/server";
import { check_json_header, check_param } from "@/lib/checks";
import * as z from "zod";

const DocumentEditSchema = z.object({
  title: z.string(),
  authors: z.string().array(),
  date: z.number(),
});

type JSON_INPUT = z.infer<typeof DocumentEditSchema>;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  let { id: raw_id } = await params;
  let id: number;

  try {
    id = parseInt(raw_id);
  } catch (error) {
    return new Response("Invalid ID", { status: 400 });
  }

  let param_res = await check_param(id, supabase, "missions");
  if (param_res !== null) return param_res;

  let header_res = await check_json_header(request);
  if (header_res !== null) return header_res;

  let json: JSON_INPUT | undefined | null = await request.json();

  if (!json) return new Response("Bad request", { status: 400 });

  const parseResult = DocumentEditSchema.safeParse(json);

  if (!parseResult.success)
    return new Response(JSON.stringify(parseResult.error), {
      status: 400,
      statusText: "Bad Request",
    });

  json = parseResult.data;

  const { error } = await supabase
    .from("documents")
    .update({
      title: json.title,
      authors: json.authors,
      date: new Date(json.date).toISOString(),
    })
    .eq("id", id);
  if (error) return new Response(JSON.stringify(error), { status: 500 });

  return new Response(null, { status: 204 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  let { id: raw_id } = await params;
  let id: number;

  try {
    id = parseInt(raw_id);
  } catch (error) {
    return new Response("Invalid ID", { status: 400 });
  }

  let param_res = await check_param(id, supabase, "missions");
  if (param_res !== null) return param_res;

  const { data, error: selectError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();
  if (selectError)
    return new Response(JSON.stringify(selectError), { status: 500 });

  if (data.type === "file") {
    const { error: deleteError } = await supabase.storage
      .from("documents")
      .remove([data.path]);
    if (deleteError)
      return new Response(JSON.stringify(deleteError), { status: 500 });
  }

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return new Response(JSON.stringify(error), { status: 500 });

  return new Response(null, { status: 204 });
}
