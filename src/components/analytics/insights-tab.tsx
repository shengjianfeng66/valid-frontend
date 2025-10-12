"use client";

import { CopilotChat } from "@copilotkit/react-ui";

export function InsightsTab() {
    return (
        <div className="bg-white rounded-b-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
            <CopilotChat
                className="h-full"
                labels={{
                    title: "深度洞察分析",
                    initial: "你好！我是 AI 分析助手。我已经了解了当前访谈的所有数据，包括受访者信息和完整的问答记录。\n\n我可以帮你：\n• 分析用户反馈的共性和差异\n• 提取关键洞察和痛点\n• 生成用户画像总结\n• 提供产品优化建议\n\n请告诉我你想了解什么？"
                }}
                imageUploadsEnabled={true}
                instructions="你是一个专业的用户研究分析助手。基于提供的访谈数据，进行深度分析并提供有价值的洞察。请用中文回答，语言要专业且易懂。"
            />
        </div>
    );
}

