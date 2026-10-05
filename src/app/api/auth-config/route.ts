import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.BOBAKS_SUPABASE_URL ?? "https://zhrfozouzvxhpkylmpwh.supabase.co",
    publishableKey: process.env.BOBAKS_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_m5sYdsVZpWMOVRxyMSwblw_dIesP93F",
  }, { headers: { "cache-control": "public, max-age=3600" } });
}
