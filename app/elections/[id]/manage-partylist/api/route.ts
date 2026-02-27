import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const partylist_id = searchParams.get("partylist_id");

  if (!partylist_id) {
    return NextResponse.json(
      { error: "partylist_id is required" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data: candidates, error } = await supabase
    .from("candidates")
    .select(
      `
      candidate_id,
      full_name,
      student_id,
      email,
      affiliation_status,
      positions(title),
      courses(name, acronym)
    `,
    )
    .eq("partylist_id", partylist_id)
    .order("full_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ candidates: candidates || [] });
}
