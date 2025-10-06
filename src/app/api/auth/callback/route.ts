import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();

    // 交换 code 获取 session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 重定向到目标页面
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // 如果出错，重定向到首页
  return NextResponse.redirect(new URL("/", request.url));
}

