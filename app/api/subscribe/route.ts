// app/api/subscribe/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint, auth, p256dh, user_agent } = body;

    if (!endpoint || !auth || !p256dh) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          endpoint,
          auth,
          p256dh,
          user_agent: user_agent || null,
          subscribed_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Subscribe API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
