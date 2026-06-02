// app/api/unsubscribe/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Unsubscribe API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
