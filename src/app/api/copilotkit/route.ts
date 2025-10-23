import { createServerClient } from "@/lib/supabase"
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  GraphQLContext,
  OpenAIAdapter,
} from "@copilotkit/runtime"
import { NextRequest } from "next/server"
import OpenAI from "openai"

const deploymentUrl = process.env.NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL || ""
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_BASE = process.env.OPENAI_API_BASE
const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL

const openai = new OpenAI({ apiKey: OPENAI_API_KEY, baseURL: OPENAI_API_BASE })
const llmAdapter = new OpenAIAdapter({
  openai,
  model: OPENAI_API_MODEL,
} as any)

export const POST = async (req: NextRequest) => {
  // 创建基础运行时，如果没有 LangGraph 部署 URL，则只使用 LLM 适配器
  // const langgraphEndpoint = langGraphPlatformEndpoint({
  //   deploymentUrl: deploymentUrl,
  //   agents: [
  //     { name: "proposal_agent", description: "生成用户访谈配置" },
  //   ]
  // });

  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const supabaseBearer = session?.access_token ? `Bearer ${session.access_token}` : ""
  const authHeader = req.headers.get("authorization") || supabaseBearer

  const runtime = new CopilotRuntime({
    remoteEndpoints: [
      {
        url: deploymentUrl,
        onBeforeRequest: ({ ctx }: { ctx: GraphQLContext }) => {
          return {
            headers: {
              Authorization: authHeader,
            },
          }
        },
      },
    ],
  })

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: llmAdapter,
    endpoint: deploymentUrl,
  })

  return handleRequest(req)
}
