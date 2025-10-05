import {
  CopilotRuntime,
  OpenAIAdapter,
  langGraphPlatformEndpoint,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest } from "next/server";

const deploymentUrl = process.env.NEXT_PUBLIC_COPILOTKIT_LANGGRAPH_DEPLOYMENT_URL || "http://127.0.0.1:8000/copilotkit";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_BASE = process.env.OPENAI_API_BASE;
const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY, baseURL: OPENAI_API_BASE });
const llmAdapter = new OpenAIAdapter({ openai, model: OPENAI_API_MODEL } as any);

export const POST = async (req: NextRequest) => {
  // 创建基础运行时，如果没有 LangGraph 部署 URL，则只使用 LLM 适配器
  // const langgraphEndpoint = langGraphPlatformEndpoint({
  //   deploymentUrl: deploymentUrl,
  //   agents: [
  //     { name: "proposal_agent", description: "生成用户访谈配置" },
  //   ]
  // });

  const runtime = new CopilotRuntime({
      remoteEndpoints: [{
        url: deploymentUrl,
      }],
    });
  
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: llmAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
