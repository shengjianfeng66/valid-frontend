import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  // 先更新 Supabase Session (自动刷新 Token)
  const { response } = await updateSession(request)

  // 然后处理国际化
  const intlResponse = intlMiddleware(request)

  // 合并 Supabase 的 Cookie 设置到国际化响应
  if (response.cookies.getAll().length > 0) {
    const mergedResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // 复制所有 Cookie
    response.cookies.getAll().forEach((cookie) => {
      mergedResponse.cookies.set(cookie)
    })

    // 复制国际化的其他设置
    if (intlResponse.headers.has("x-middleware-rewrite")) {
      mergedResponse.headers.set("x-middleware-rewrite", intlResponse.headers.get("x-middleware-rewrite")!)
    }

    return mergedResponse
  }

  return intlResponse
}

export const config = {
  matcher: [
    "/",
    "/(en|en-US|zh|zh-CN|zh-TW|zh-HK|zh-MO|ja|ko|ru|fr|de|ar|es|it)/:path*",
    "/((?!privacy-policy|terms-of-service|api/|_next|_vercel|.*\\..*).*)",
  ],
}
