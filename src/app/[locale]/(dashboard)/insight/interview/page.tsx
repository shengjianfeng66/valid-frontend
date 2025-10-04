"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    Stepper,
    StepperItem,
    StepperTrigger,
    StepperIndicator,
    StepperSeparator,
    StepperTitle,
    StepperDescription,
    StepperNav
} from "@/components/stepper";
import { Check } from "lucide-react";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar, useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { useState } from "react";
import { FileText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SurveyData {
    interviewIntro: string;
    interviewTargetUsers: string;
    interviewQuestions: {
        page1: { q1: string; q2: string };
    };
}

// 用户访谈大纲组件
interface SurveyFormProps {
    surveyData: SurveyData;
    setSurveyData: React.Dispatch<React.SetStateAction<SurveyData>>;
}

function InterviewForm({ surveyData, setSurveyData }: SurveyFormProps) {
    const handleInputChange = (field: keyof SurveyData, value: string) => {
        setSurveyData(prev => ({ ...prev, [field]: value }));
    };

    const handleQuestionChange = (page: string, questionNumber: string, value: string) => {
        setSurveyData(prev => {
            const newData = { ...prev };
            if (newData.interviewQuestions[page as keyof typeof newData.interviewQuestions]) {
                newData.interviewQuestions[page as keyof typeof newData.interviewQuestions][questionNumber as 'q1' | 'q2'] = value;
            }
            return newData;
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-8">
            {/* 标题 */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900">Dreamoo 用户访谈大纲</h2>
                </div>
                <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    关于个性化追问
                </a>
            </div>

            <div className="space-y-6">
                {/* 引言 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        引言
                    </label>
                    <textarea
                        value={surveyData.interviewIntro}
                        onChange={(e) => handleInputChange('interviewIntro', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                </div>

                {/* 目标用户 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        目标用户/核心用户群体？
                    </label>
                    <input
                        type="text"
                        value={surveyData.interviewTargetUsers}
                        onChange={(e) => handleInputChange('interviewTargetUsers', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* 第1页：使用动机 */}
                <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">第1页：使用动机</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">1.</label>
                            <input
                                type="text"
                                value={surveyData.interviewQuestions.page1.q1}
                                onChange={(e) => handleQuestionChange('page1', 'q1', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">2.</label>
                            <input
                                type="text"
                                value={surveyData.interviewQuestions.page1.q2}
                                onChange={(e) => handleQuestionChange('page1', 'q2', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function InterviewPage() {
    const router = useRouter();
    const [surveyData, setSurveyData] = useState<SurveyData>({
        interviewIntro: "您好！感谢您参与本次调研。本问卷旨在了解您在 Dreamoo 记录梦境的动机、使用频率单次满意度，以便我们优化内容创作、互动与留存功能。问卷采用匿名方式，大约需要10分钟完成。所有数据仅用于内部优化，请您根据实际情况填写。",
        interviewTargetUsers: "热爱表达与二次创作的青少年/年轻用户",
        interviewQuestions: {
            page1: {
                q1: "您记录梦境的主要动机是什么？【必答】",
                q2: "请根据您的真实感受，在1（非常不同意）到5（非常同意）之间评分："
            }
        }
    });

    // 让AI能够读取访谈大纲数据
    useCopilotReadable({
        description: "当前用户访谈大纲的数据，包括引言、目标用户、各页面问题内容",
        value: {
            interviewIntro: surveyData.interviewIntro,
            interviewTargetUsers: surveyData.interviewTargetUsers,
            interviewQuestions: surveyData.interviewQuestions,
        },
    });

    // 更新访谈大纲引言
    useCopilotAction({
        name: "updateInterviewIntro",
        description: "更新用户访谈大纲的引言内容",
        parameters: [{
            name: "intro",
            type: "string",
            description: "新的访谈大纲引言内容",
            required: true,
        }],
        handler: ({ intro }) => {
            setSurveyData(prev => ({ ...prev, interviewIntro: intro }));
        },
    });

    // 更新目标用户
    useCopilotAction({
        name: "updateInterviewTargetUsers",
        description: "更新访谈大纲的目标用户/核心用户群体",
        parameters: [{
            name: "targetUsers",
            type: "string",
            description: "新的目标用户群体描述",
            required: true,
        }],
        handler: ({ targetUsers }) => {
            setSurveyData(prev => ({ ...prev, interviewTargetUsers: targetUsers }));
        },
    });

    // 更新问题内容
    useCopilotAction({
        name: "updateInterviewQuestions",
        description: "更新访谈大纲的问题内容",
        parameters: [{
            name: "page",
            type: "string",
            description: "页面编号：page1",
            required: true,
        }, {
            name: "questionNumber",
            type: "string",
            description: "问题编号：q1 或 q2",
            required: true,
        }, {
            name: "content",
            type: "string",
            description: "新的问题内容",
            required: true,
        }],
        handler: ({ page, questionNumber, content }) => {
            setSurveyData(prev => {
                const newData = { ...prev };
                if (newData.interviewQuestions[page as keyof typeof newData.interviewQuestions]) {
                    newData.interviewQuestions[page as keyof typeof newData.interviewQuestions][questionNumber as 'q1' | 'q2'] = content;
                }
                return newData;
            });
        },
    });

    // 智能建议
    useCopilotChatSuggestions({
        instructions: "为用户提供以下建议：1. 优化访谈大纲问题 2. 根据产品特性生成访谈问题 3. 调整引言和目标用户",
        minSuggestions: 3,
        maxSuggestions: 4,
    });

    return (
        <div style={{ "--copilot-kit-primary-color": "oklch(0.705 0.213 47.604)" } as CopilotKitCSSProperties}>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center gap-2">
                        <div className="flex flex-1 items-center gap-2 px-3">
                            <SidebarTrigger />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-8 p-4">
                        {/* 流程状态栏 */}
                        <div className="bg-white rounded-lg shadow-sm px-0 py-6 mb-6">
                            <div className="px-6">
                                <Stepper value={3} className="w-full">
                                    <StepperNav className="flex justify-between items-center">
                                        <StepperItem step={1} completed={3 > 1}>
                                            <StepperTrigger className="flex flex-col items-center gap-3">
                                                <StepperIndicator className="w-10 h-10 text-sm font-medium bg-[oklch(0.705_0.213_47.604)] text-white">
                                                    <Check className="w-5 h-5" />
                                                </StepperIndicator>
                                                <div className="text-center">
                                                    <StepperTitle className="text-sm font-medium text-[oklch(0.705_0.213_47.604)]">制定目标</StepperTitle>
                                                    <StepperDescription className="text-xs text-gray-500 mt-1">了解你的产品和用户</StepperDescription>
                                                </div>
                                            </StepperTrigger>
                                            <StepperSeparator className="mx-4 flex-1 bg-[oklch(0.705_0.213_47.604)] h-0.5" />
                                        </StepperItem>

                                        <StepperItem step={2} completed={3 > 2}>
                                            <StepperTrigger className="flex flex-col items-center gap-3">
                                                <StepperIndicator className="w-10 h-10 text-sm font-medium bg-[oklch(0.705_0.213_47.604)] text-white">
                                                    <Check className="w-5 h-5" />
                                                </StepperIndicator>
                                                <div className="text-center">
                                                    <StepperTitle className="text-sm font-medium text-[oklch(0.705_0.213_47.604)]">访谈大纲</StepperTitle>
                                                    <StepperDescription className="text-xs text-gray-500 mt-1">深度发掘用户需求</StepperDescription>
                                                </div>
                                            </StepperTrigger>
                                            <StepperSeparator className="mx-4 flex-1 bg-[oklch(0.705_0.213_47.604)] h-0.5" />
                                        </StepperItem>

                                        <StepperItem step={3} completed={3 > 3}>
                                            <StepperTrigger className="flex flex-col items-center gap-3">
                                                <StepperIndicator className="w-10 h-10 text-sm font-medium bg-gray-200 text-gray-700 border-2 border-dashed border-[oklch(0.705_0.213_47.604)]">
                                                    3
                                                </StepperIndicator>
                                                <div className="text-center">
                                                    <StepperTitle className="text-sm font-medium text-[oklch(0.705_0.213_47.604)]">寻找参与者</StepperTitle>
                                                    <StepperDescription className="text-xs text-gray-500 mt-1">邀请真人和模拟用户访谈</StepperDescription>
                                                </div>
                                            </StepperTrigger>
                                        </StepperItem>
                                    </StepperNav>
                                </Stepper>
                            </div>
                        </div>

                        {/* 用户访谈大纲（第4步） */}
                        <InterviewForm surveyData={surveyData} setSurveyData={setSurveyData} />

                        {/* 下一步按钮 */}
                        <div className="flex justify-end mt-8">
                            <button
                                onClick={() => router.push('/insight/static')}
                                className="flex items-center gap-2 px-6 py-3 bg-[oklch(0.705_0.213_47.604)] text-white rounded-lg hover:bg-[oklch(0.685_0.213_47.604)] transition-colors font-medium"
                            >
                                下一步
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </SidebarInset>
                <CopilotSidebar
                    clickOutsideToClose={false}
                    defaultOpen={true}
                    labels={{
                        title: "AI 调研助手",
                        initial: "👋 我可以帮助你完善访谈大纲：优化问题、调整引言、明确目标用户等。"
                    }}
                />
            </SidebarProvider>
        </div>
    )
}


