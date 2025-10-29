import type { NextRequest } from "next/server"
import { CopilotRuntime, copilotRuntimeNextJSAppRouterEndpoint, OpenAIAdapter } from "@copilotkit/runtime"

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const serviceAdapter = new OpenAIAdapter({ openai })

const runtime = new CopilotRuntime({
  remoteEndpoints: [
    {
      url: process.env.COPILOTKIT_REMOTE_ENDPOINT_URL || "http://127.0.0.1:8000/copilotkit",
    },
  ],
})

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  })

  return handleRequest(req)
}
