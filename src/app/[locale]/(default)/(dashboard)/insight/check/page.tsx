"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ProcessSteps from "@/components/blocks/process-steps";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar, useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { useState } from "react";
import { FileText, Users, Clock } from "lucide-react";

interface SurveyData {
  surveyIntro: string;
  surveyTargetUsers: string;
  surveyQuestions: {
    page1: { q1: string; q2: string };
    page2: { q1: string; q2: string };
    page3: { q1: string; q2: string };
  };
  interviewIntro: string;
  interviewTargetUsers: string;
  interviewQuestions: {
    page1: { q1: string; q2: string };
  };
}

// 访谈样本量统计卡片
function InterviewStatsCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-gray-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">访谈样本量</h2>
      </div>
      
      <div className="space-y-3">
        <p className="text-gray-700">
          我们将为您邀请 <span className="text-blue-600 font-semibold">159</span> 位模拟用户，真实度约 <span className="text-blue-600 font-semibold">87%</span>，销后您也可以将 <span className="text-blue-600">访谈链接</span> 发送给真人用户，真人用户和模拟用户的访谈结果将会综合分析
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>约耗时 <span className="text-blue-600">15,900</span> 秒</span>
        </div>
      </div>
    </div>
  );
}

// 用户体验调查问卷组件
interface SurveyFormProps {
  surveyData: SurveyData;
  setSurveyData: React.Dispatch<React.SetStateAction<SurveyData>>;
}

function SurveyForm({ surveyData, setSurveyData }: SurveyFormProps) {
  const handleInputChange = (field: keyof SurveyData, value: string) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (page: string, questionNumber: string, value: string) => {
    setSurveyData(prev => {
      const newData = { ...prev };
      if (newData.surveyQuestions[page as keyof typeof newData.surveyQuestions]) {
        newData.surveyQuestions[page as keyof typeof newData.surveyQuestions][questionNumber as 'q1' | 'q2'] = value;
      }
      return newData;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Dreamoo 用户体验调查问卷</h2>
      </div>

      <div className="space-y-6">
        {/* 引言 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            引言
          </label>
          <textarea
            value={surveyData.surveyIntro}
            onChange={(e) => handleInputChange('surveyIntro', e.target.value)}
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
            value={surveyData.surveyTargetUsers}
            onChange={(e) => handleInputChange('surveyTargetUsers', e.target.value)}
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
                value={surveyData.surveyQuestions.page1.q1}
                onChange={(e) => handleQuestionChange('page1', 'q1', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">2.</label>
              <input
                type="text"
                value={surveyData.surveyQuestions.page1.q2}
                onChange={(e) => handleQuestionChange('page1', 'q2', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* 第2页：使用频率 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">第2页：使用频率</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">1.</label>
              <input
                type="text"
                value={surveyData.surveyQuestions.page2.q1}
                onChange={(e) => handleQuestionChange('page2', 'q1', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">2.</label>
              <input
                type="text"
                value={surveyData.surveyQuestions.page2.q2}
                onChange={(e) => handleQuestionChange('page2', 'q2', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* 第3页：满意度 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">第3页：满意度</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">1.</label>
              <input
                type="text"
                value={surveyData.surveyQuestions.page3.q1}
                onChange={(e) => handleQuestionChange('page3', 'q1', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">2.</label>
              <input
                type="text"
                value={surveyData.surveyQuestions.page3.q2}
                onChange={(e) => handleQuestionChange('page3', 'q2', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 用户访谈大纲组件
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

export default function CheckPage() {
  const [surveyData, setSurveyData] = useState<SurveyData>({
    surveyIntro: "您好！感谢您参与本次调研。本问卷旨在了解您在 Dreamoo 记录梦境的动机、使用频率单次满意度，以便我们优化内容创作、互动与留存功能。问卷采用匿名方式，大约需要10分钟完成。所有数据仅用于内部优化，请您根据实际情况填写。",
    surveyTargetUsers: "热爱表达与二次创作的青少年/年轻用户",
    surveyQuestions: {
      page1: {
        q1: "您记录梦境的主要动机是什么？【必答】",
        q2: "请根据您的真实感受，在1（非常不同意）到5（非常同意）之间评分："
      },
      page2: {
        q1: "您多久记录一次梦境？【必答】",
        q2: "请根据实际情况，在1（从不）到5（每天）之间评分："
      },
      page3: {
        q1: "您对 Dreamoo 记录梦境的功能满意吗？【必答】",
        q2: "请根据使用体验，在1（非常不满意）到5（非常满意）之间评分："
      }
    },
    interviewIntro: "您好！感谢您参与本次调研。本问卷旨在了解您在 Dreamoo 记录梦境的动机、使用频率单次满意度，以便我们优化内容创作、互动与留存功能。问卷采用匿名方式，大约需要10分钟完成。所有数据仅用于内部优化，请您根据实际情况填写。",
    interviewTargetUsers: "热爱表达与二次创作的青少年/年轻用户",
    interviewQuestions: {
      page1: {
        q1: "您记录梦境的主要动机是什么？【必答】",
        q2: "请根据您的真实感受，在1（非常不同意）到5（非常同意）之间评分："
      }
    }
  });

  // 让AI能够读取所有表单数据
  useCopilotReadable({
    description: "当前用户体验调查问卷和访谈大纲的所有数据，包括引言、目标用户、各页面问题内容",
    value: {
      surveyIntro: surveyData.surveyIntro,
      surveyTargetUsers: surveyData.surveyTargetUsers,
      surveyQuestions: surveyData.surveyQuestions,
      interviewIntro: surveyData.interviewIntro,
      interviewTargetUsers: surveyData.interviewTargetUsers,
      interviewQuestions: surveyData.interviewQuestions,
    },
  });

  // 更新调查问卷引言
  useCopilotAction({
    name: "updateSurveyIntro",
    description: "更新用户体验调查问卷的引言内容",
    parameters: [{
      name: "intro",
      type: "string",
      description: "新的调查问卷引言内容",
      required: true,
    }],
    handler: ({ intro }) => {
      setSurveyData(prev => ({ ...prev, surveyIntro: intro }));
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
    name: "updateTargetUsers",
    description: "更新目标用户/核心用户群体",
    parameters: [{
      name: "targetUsers",
      type: "string",
      description: "新的目标用户群体描述",
      required: true,
    }, {
      name: "type",
      type: "string",
      description: "更新类型：survey（调查问卷）或 interview（访谈大纲）",
      required: true,
    }],
    handler: ({ targetUsers, type }) => {
      if (type === "survey") {
        setSurveyData(prev => ({ ...prev, surveyTargetUsers: targetUsers }));
      } else if (type === "interview") {
        setSurveyData(prev => ({ ...prev, interviewTargetUsers: targetUsers }));
      }
    },
  });

  // 更新问题内容
  useCopilotAction({
    name: "updateQuestions",
    description: "更新调查问卷或访谈大纲的问题内容",
    parameters: [{
      name: "type",
      type: "string",
      description: "更新类型：survey（调查问卷）或 interview（访谈大纲）",
      required: true,
    }, {
      name: "page",
      type: "string",
      description: "页面编号：page1, page2, page3",
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
    handler: ({ type, page, questionNumber, content }) => {
      setSurveyData(prev => {
        const newData = { ...prev };
        if (type === "survey" && newData.surveyQuestions[page as keyof typeof newData.surveyQuestions]) {
          newData.surveyQuestions[page as keyof typeof newData.surveyQuestions][questionNumber as 'q1' | 'q2'] = content;
        } else if (type === "interview" && newData.interviewQuestions[page as keyof typeof newData.interviewQuestions]) {
          newData.interviewQuestions[page as keyof typeof newData.interviewQuestions][questionNumber as 'q1' | 'q2'] = content;
        }
        return newData;
      });
    },
  });

  // 清空所有表单
  useCopilotAction({
    name: "clearAllForms",
    description: "清空所有表单内容",
    parameters: [],
    handler: () => {
      setSurveyData({
        surveyIntro: "",
        surveyTargetUsers: "",
        surveyQuestions: {
          page1: { q1: "", q2: "" },
          page2: { q1: "", q2: "" },
          page3: { q1: "", q2: "" }
        },
        interviewIntro: "",
        interviewTargetUsers: "",
        interviewQuestions: {
          page1: { q1: "", q2: "" }
        }
      });
    },
  });

  // 填充示例数据
  useCopilotAction({
    name: "fillSampleData",
    description: "填充示例调研数据",
    parameters: [],
    handler: () => {
      setSurveyData({
        surveyIntro: "您好！感谢您参与本次调研。本问卷旨在了解您在 Dreamoo 记录梦境的动机、使用频率单次满意度，以便我们优化内容创作、互动与留存功能。问卷采用匿名方式，大约需要10分钟完成。所有数据仅用于内部优化，请您根据实际情况填写。",
        surveyTargetUsers: "热爱表达与二次创作的青少年/年轻用户",
        surveyQuestions: {
          page1: {
            q1: "您记录梦境的主要动机是什么？【必答】",
            q2: "请根据您的真实感受，在1（非常不同意）到5（非常同意）之间评分："
          },
          page2: {
            q1: "您多久记录一次梦境？【必答】",
            q2: "请根据实际情况，在1（从不）到5（每天）之间评分："
          },
          page3: {
            q1: "您对 Dreamoo 记录梦境的功能满意吗？【必答】",
            q2: "请根据使用体验，在1（非常不满意）到5（非常满意）之间评分："
          }
        },
        interviewIntro: "您好！感谢您参与本次调研。本问卷旨在了解您在 Dreamoo 记录梦境的动机、使用频率单次满意度，以便我们优化内容创作、互动与留存功能。问卷采用匿名方式，大约需要10分钟完成。所有数据仅用于内部优化，请您根据实际情况填写。",
        interviewTargetUsers: "热爱表达与二次创作的青少年/年轻用户",
        interviewQuestions: {
          page1: {
            q1: "您记录梦境的主要动机是什么？【必答】",
            q2: "请根据您的真实感受，在1（非常不同意）到5（非常同意）之间评分："
          }
        }
      });
    },
  });

  // 智能建议
  useCopilotChatSuggestions({
    instructions: "为用户提供以下建议：1. 帮我优化调查问卷的问题设计 2. 清空所有表单内容 3. 根据产品特性自动生成访谈问题 4. 填充示例数据",
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
            <ProcessSteps currentStep={3} />
            
            {/* 访谈样本量统计 */}
            <InterviewStatsCard />
            
            {/* 用户体验调查问卷 */}
            <SurveyForm surveyData={surveyData} setSurveyData={setSurveyData} />
            
            {/* 用户访谈大纲 */}
            <InterviewForm surveyData={surveyData} setSurveyData={setSurveyData} />
          </div>
        </SidebarInset>
        <CopilotSidebar
          clickOutsideToClose={false}
          defaultOpen={true}
          labels={{
            title: "AI 调研助手",
            initial: "👋 你好！我是你的AI调研助手。\n\n我可以帮助你：\n\n• 📝 优化调查问卷和访谈问题\n• 🔄 清空或重置所有表单\n• 💡 根据产品特性生成专业问题\n• 📋 提供调研方法建议\n\n请告诉我你需要什么帮助！"
          }}
        />
      </SidebarProvider>
    </div>
  )
}