import { createServerClient } from "@/lib/supabase"
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  GraphQLContext,
  OpenAIAdapter,
} from "@copilotkit/runtime"
import { NextRequest } from "next/server"
import OpenAI from "openai"
const deploymentUrl = process.env.NEXT_PUBLIC_COPILOTKIT_LANGGRAPH_DEPLOYMENT_URL || "http://127.0.0.1:8000/copilotkit";

const endpointUrl = process.env.NEXT_PUBLIC_COPILOTKIT_LANGGRAPH_ENDPOINT_URL || "/copilotkit";


const runtimeUrl = process.env.NEXT_PUBLIC_COPILOTKIT_ENDPOINT_RUNTIME_URL || "http://127.0.0.1:8000/copilotkit"
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_BASE = process.env.OPENAI_API_BASE
const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL

const openai = new OpenAI({ apiKey: OPENAI_API_KEY, baseURL: OPENAI_API_BASE })
const llmAdapter = new OpenAIAdapter({
  openai,
  model: OPENAI_API_MODEL,
} as any)

export const POST = async (req: NextRequest) => {
  
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const supabaseBearer = session?.access_token ? `Bearer ${session.access_token}` : ""
    const authHeader = req.headers.get("authorization") || supabaseBearer

  const runtime = new CopilotRuntime({
    remoteEndpoints: [
      {
        url: runtimeUrl,
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
      endpoint: endpointUrl,
    })

    return handleRequest(req)
  } catch (error) {
    console.error("CopilotKit API error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
