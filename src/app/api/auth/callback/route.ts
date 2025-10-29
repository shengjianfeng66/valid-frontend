import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  console.log("request url: ", request.url)

  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/"

  // 获取正确的域名和协议
  const getBaseUrl = () => {
    // 优先检查开发调试 header（Proxyman 场景）
    // 当 API 在远端运行但前端在本地时使用
    const devRedirectBase = request.headers.get("x-dev-redirect-base")
    if (devRedirectBase) {
      return devRedirectBase
    }

    // 优先使用环境变量
    if (process.env.NEXT_PUBLIC_WEB_URL) {
      return process.env.NEXT_PUBLIC_WEB_URL
    }

    // 从请求头获取正确的域名
    const forwardedHost = request.headers.get("x-forwarded-host")
    const forwardedProto = request.headers.get("x-forwarded-proto")
    const host = request.headers.get("host")

    // 优先使用转发的 host（代理场景）
    if (forwardedHost) {
      const protocol = forwardedProto || "https"
      return `${protocol}://${forwardedHost}`
    }

    // 其他生产环境域名
    if (host) {
      const protocol = host.includes("localhost") ? "http" : "https"
      return `${protocol}://${host}`
    }

    // 兜底方案
    return "https://validflow.airelief.cn"
  }

  const baseUrl = getBaseUrl()
  console.log("🔄 OAuth callback received:", {
    code: !!code,
    next,
    baseUrl,
    headers: {
      host: request.headers.get("host"),
      forwardedHost: request.headers.get("x-forwarded-host"),
      forwardedProto: request.headers.get("x-forwarded-proto"),
    },
  })

  if (code) {
    try {
      const supabase = await createClient()
      console.log("✅ Supabase server client created for callback")

      // 交换 code 获取 session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("❌ Failed to exchange code for session:", error)
        // 重定向到首页并带上错误信息
        return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error.message)}`, baseUrl))
      }

      if (data.session) {
        console.log("✅ Session created successfully for user:", data.session.user.id)
        console.log("👤 User info:", {
          id: data.session.user.id,
          email: data.session.user.email,
          metadata: data.session.user.user_metadata,
        })

        // 重定向到目标页面，使用正确的 baseUrl
        const redirectUrl = new URL(next, baseUrl)
        console.log("🔄 Redirecting to:", redirectUrl.toString())
        return NextResponse.redirect(redirectUrl)
      } else {
        console.warn("⚠️ No session created despite successful code exchange")
        return NextResponse.redirect(new URL("/?auth_error=no_session", baseUrl))
      }
    } catch (error) {
      console.error("❌ Unexpected error in OAuth callback:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(errorMessage)}`, baseUrl))
    }
  } else {
    console.warn("⚠️ No authorization code received in callback")
    return NextResponse.redirect(new URL("/?auth_error=no_code", baseUrl))
  }
}
