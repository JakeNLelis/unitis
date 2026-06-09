import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("candidates")
    .select("photo")
    .eq("candidate_id", id)
    .single();

  if (error || !data || !data.photo) {
    // Return a transparent 1x1 pixel or a 404
    return new Response("Not found", { status: 404 });
  }

  // Handle Base64 Data URL
  const match = data.photo.match(/^data:(image\/\w+);base64,(.+)$/);
  if (match) {
    const buffer = Buffer.from(match[2], "base64");
    return new Response(buffer, {
      headers: {
        "Content-Type": match[1],
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  }

  // Fallback: If it's a regular URL, validate it to prevent open redirects
  if (data.photo.startsWith('http')) {
    try {
      const url = new URL(data.photo);
      const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co");
      if ((url.protocol === 'http:' || url.protocol === 'https:') && url.hostname === supabaseUrl.hostname) {
        return Response.redirect(data.photo);
      }
    } catch (e) {
      // Invalid URL
    }
    return new Response("Invalid image URL", { status: 400 });
  }

  return new Response("Invalid image format", { status: 400 });
}
