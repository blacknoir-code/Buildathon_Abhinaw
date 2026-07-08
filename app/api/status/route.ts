import { NextResponse } from "next/server";
import { isLiveMode, MODEL } from "@/lib/claude";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    live: isLiveMode(),
    model: isLiveMode() ? MODEL : null,
    supabase: isSupabaseConfigured(),
  });
}
