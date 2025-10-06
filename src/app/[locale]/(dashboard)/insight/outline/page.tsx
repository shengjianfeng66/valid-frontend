"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
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
import { useCopilotAction, useCopilotReadable, useCopilotChatInternal } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar, useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { useState, useRef, useEffect } from "react";
import { FileText, ArrowRight, ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useDraft } from "@/contexts/draft";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    page1: string[];
    page2: string[];
  };
}


// 用户体验调查问卷组件
interface SurveyFormProps {
  surveyData: SurveyData;
  setSurveyData: React.Dispatch<React.SetStateAction<SurveyData>>;
}

function SurveyForm({ surveyData, setSurveyData }: SurveyFormProps) {
  const t = useTranslations();
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
        <h2 className="text-2xl font-semibold text-gray-900">{t('survey.title')}</h2>
      </div>

      <div className="space-y-6">
        {/* 引言 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('survey.intro.label')}
          </label>
          <textarea
            value={surveyData.surveyIntro}
            onChange={(e) => handleInputChange('surveyIntro', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        {/* 目标用户 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('survey.targetUsers.label')}
          </label>
          <input
            type="text"
            value={surveyData.surveyTargetUsers}
            onChange={(e) => handleInputChange('surveyTargetUsers', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* 第1页：使用动机 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('survey.pages.page1.title')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">1.</label>
              <input
                type="text"
                value={surveyData.surveyQuestions.page1.q1}
                onChange={(e) => handleQuestionChange('page1', 'q1', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">2.</label>
              <input
                type="text"
                value={surveyData.surveyQuestions.page1.q2}
                onChange={(e) => handleQuestionChange('page1', 'q2', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* 第2页：使用频率 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('survey.pages.page2.title')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">1.</label>
              <input
                type="text"
                value={surveyData.surveyQuestions.page2.q1}
                onChange={(e) => handleQuestionChange('page2', 'q1', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">2.</label>
              <input
                type="text"
                value={surveyData.surveyQuestions.page2.q2}
                onChange={(e) => handleQuestionChange('page2', 'q2', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* 第3页：满意度 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('survey.pages.page3.title')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">1.</label>
              <input
                type="text"
                value={surveyData.surveyQuestions.page3.q1}
                onChange={(e) => handleQuestionChange('page3', 'q1', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">2.</label>
              <input
                type="text"
                value={surveyData.surveyQuestions.page3.q2}
                onChange={(e) => handleQuestionChange('page3', 'q2', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
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
  const t = useTranslations();
  const handleInputChange = (field: keyof SurveyData, value: string) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (section: string, questionIndex: number, value: string) => {
    setSurveyData(prev => {
      const newData = { ...prev };
      if (newData.interviewQuestions[section as keyof typeof newData.interviewQuestions]) {
        const questions = [...newData.interviewQuestions[section as keyof typeof newData.interviewQuestions]];
        questions[questionIndex] = value;
        newData.interviewQuestions[section as keyof typeof newData.interviewQuestions] = questions;
      }
      return newData;
    });
  };

  const addQuestion = (section: string) => {
    setSurveyData(prev => {
      const newData = { ...prev };
      if (newData.interviewQuestions[section as keyof typeof newData.interviewQuestions]) {
        const questions = [...newData.interviewQuestions[section as keyof typeof newData.interviewQuestions]];
        questions.push("");
        newData.interviewQuestions[section as keyof typeof newData.interviewQuestions] = questions;
      }
      return newData;
    });
  };

  const removeQuestion = (section: string, questionIndex: number) => {
    setSurveyData(prev => {
      const newData = { ...prev };
      if (newData.interviewQuestions[section as keyof typeof newData.interviewQuestions]) {
        const questions = [...newData.interviewQuestions[section as keyof typeof newData.interviewQuestions]];
        questions.splice(questionIndex, 1);
        newData.interviewQuestions[section as keyof typeof newData.interviewQuestions] = questions;
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
        <h2 className="text-2xl font-semibold text-gray-900">{t('interview.title')}</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-blue-600 hover:text-blue-700 text-sm font-medium underline cursor-pointer">
                个性化追问
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                AI 用户研究专家会基于用户的回答进行个性化追问，<br />
                发掘用户行为背后的真实需求，<br />
                提供更深入的洞察分析
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-8">
        {/* 引言 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            引言
          </label>
          <textarea
            value={surveyData.interviewIntro}
            onChange={(e) => handleInputChange('interviewIntro', e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
            placeholder="欢迎您参加 Dreamoo 用户访谈。本次访谈的目的是了解您使用 Dreamoo 记录梦境的体验，包括使用习惯、满意的地方以及希望改进的地方，以帮助我们优化产品。访谈预计需要约10分钟，您的信息将被严格保密，仅用于产品优化。没有标准答案，您的真实感受最有价值。如果您准备好了，我们将开始访谈。"
          />
        </div>

        {/* 一、用户基础画像层 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">一、用户基础画像层：了解"谁"在使用产品</h3>
          <div className="space-y-4">
            {surveyData.interviewQuestions.page1.map((question, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => handleQuestionChange('page1', index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder={index === 0 ? "你希望我怎么称呼你?你今年多大了?" :
                    index === 1 ? "你目前在哪个城市?从事什么工作?月收入大概在什么区间?" :
                      index === 2 ? "你的最高学历是?" :
                        index === 3 ? "你平时睡眠质量怎么样?一般几点睡觉,睡多久?" :
                          index === 4 ? "你平时会记录什么生活内容?(比如日记、笔记、工作记录等)" :
                            index === 5 ? "你用过AI相关的产品吗?比如AI绘画、AI写作这类工具?" : "请输入问题..."}
                />
                <button
                  onClick={() => removeQuestion('page1', index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => addQuestion('page1')}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加问题
            </button>
          </div>
        </div>

        {/* 二、用户行为习惯层 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">二、用户行为习惯层：了解用户"在什么情况下、如何做某件事"</h3>
          <div className="space-y-4">
            {surveyData.interviewQuestions.page2.map((question, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => handleQuestionChange('page2', index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder={index === 0 ? "你多久会做一次让你印象深刻的梦?醒来后通常会做什么?" :
                    index === 1 ? "你现在有记录梦境的习惯吗?如果有,用什么方式记录?(备忘录/日记本/语音/不记录)" :
                      index === 2 ? "你一般在什么时候会回想或谈论自己的梦?(早上醒来/和朋友聊天/睡前)" : "请输入问题..."}
                />
                <button
                  onClick={() => removeQuestion('page2', index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => addQuestion('page2')}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加问题
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckPage() {
  const t = useTranslations();
  const router = useRouter();
  const { setHasDraft } = useDraft();
  const [currentStep, setCurrentStep] = useState(2);

  // 直接使用 CopilotKit 的内部聊天 hook，以便能够在页面加载时
  // 主动向右侧 CopilotSidebar 发送一条用户消息。
  const { sendMessage, messages } = useCopilotChatInternal();
  const hasSentInitialRef = useRef(false);

  // 检测是否有草稿数据
  useEffect(() => {
    // 检查是否有调研信息（从 goal 页面传递过来的）
    const hasSurveyInfo = () => {
      try {
        const surveyInfo = sessionStorage.getItem('vf_surveyInfo');
        return surveyInfo && surveyInfo.trim() !== '';
      } catch {
        return false;
      }
    };

    // 检查是否有访谈数据
    const hasInterviewData = () => {
      try {
        const interviewData = sessionStorage.getItem('vf_interviewData');
        return interviewData && interviewData.trim() !== '';
      } catch {
        return false;
      }
    };

    const hasDraft = hasSurveyInfo() || hasInterviewData();
    setHasDraft(!!hasDraft);
  }, [setHasDraft]);

  // 从 sessionStorage 读取调研信息并发送给 copilot
  useEffect(() => {
    if (hasSentInitialRef.current) return;

    const sendSurveyInfo = (surveyInfo: any) => {
      // 等待CopilotKit完全初始化
      const checkAndSend = () => {
        // 检查CopilotKit是否已经准备好
        if (typeof sendMessage === 'function') {
          hasSentInitialRef.current = true;

          // 构建发送给 copilot 的消息
          const message = `基于以下调研信息，请帮我生成访谈大纲：

产品名称：${surveyInfo.productName}
业务类型：${surveyInfo.businessType}
目标用户群体：${surveyInfo.targetUsers}
用户关心的方面：${surveyInfo.userConcerns}
核心功能模块：${surveyInfo.coreFeatures}
${surveyInfo.hasProductSolution ? `产品方案文件：${surveyInfo.productSolutionName}` : ''}

请根据这些信息，生成专业的用户访谈大纲，包括：
1. 访谈引言
2. 用户基础画像层问题
3. 用户行为习惯层问题

请确保问题设计能够深度发掘用户需求，帮助优化产品。`;

          void sendMessage({ id: `survey-${Date.now()}`, role: 'user', content: message });
        } else {
          // 如果还没准备好，继续等待
          setTimeout(checkAndSend, 100);
        }
      };

      // 延迟一点时间再开始检查
      setTimeout(checkAndSend, 500);
    };

    // 从 sessionStorage 读取调研信息
    try {
      const surveyInfoStr = sessionStorage.getItem('vf_surveyInfo');
      if (surveyInfoStr && surveyInfoStr.trim()) {
        const surveyInfo = JSON.parse(surveyInfoStr);
        // 不删除调研信息，保留数据供用户返回时使用
        sendSurveyInfo(surveyInfo);
      }
    } catch (e) {
      console.warn('无法读取调研信息:', e);
    }
  }, [sendMessage]);

  // 处理步骤导航 - 只能返回不能往前跳
  const handleStepNavigation = (targetStep: number) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      // 根据步骤导航到对应页面
      if (targetStep === 1) {
        router.push('/insight/goal');
      }
    }
  };

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
    interviewIntro: "欢迎您参加 Dreamoo 用户访谈。本次访谈的目的是了解您使用 Dreamoo 记录梦境的体验，包括使用习惯、满意的地方以及希望改进的地方，以帮助我们优化产品。访谈预计需要约10分钟，您的信息将被严格保密，仅用于产品优化。没有标准答案，您的真实感受最有价值。如果您准备好了，我们将开始访谈。",
    interviewTargetUsers: "热爱表达与二次创作的青少年/年轻用户",
    interviewQuestions: {
      page1: [
        "你希望我怎么称呼你?你今年多大了?",
        "你目前在哪个城市?从事什么工作?月收入大概在什么区间?",
        "你的最高学历是?",
        "你平时睡眠质量怎么样?一般几点睡觉,睡多久?",
        "你平时会记录什么生活内容?(比如日记、笔记、工作记录等)",
        "你用过AI相关的产品吗?比如AI绘画、AI写作这类工具?"
      ],
      page2: [
        "你多久会做一次让你印象深刻的梦?醒来后通常会做什么?",
        "你现在有记录梦境的习惯吗?如果有,用什么方式记录?(备忘录/日记本/语音/不记录)",
        "你一般在什么时候会回想或谈论自己的梦?(早上醒来/和朋友聊天/睡前)"
      ]
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
    description: t('actions.updateSurveyIntro'),
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
    description: t('actions.updateInterviewIntro'),
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
    description: t('actions.updateTargetUsers'),
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
    description: t('actions.updateQuestions'),
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
          const questions = [...newData.interviewQuestions[page as keyof typeof newData.interviewQuestions]];
          const questionIndex = questionNumber === 'q1' ? 0 : 1;
          if (questionIndex < questions.length) {
            questions[questionIndex] = content;
            newData.interviewQuestions[page as keyof typeof newData.interviewQuestions] = questions;
          }
        }
        return newData;
      });
    },
  });

  // 清空所有表单
  useCopilotAction({
    name: "clearAllForms",
    description: t('actions.clearAllForms'),
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
          page1: [],
          page2: []
        }
      });
    },
  });

  // 填充示例数据
  useCopilotAction({
    name: "fillSampleData",
    description: t('actions.fillSampleData'),
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
          page1: [
            "你希望我怎么称呼你?你今年多大了?",
            "你目前在哪个城市?从事什么工作?月收入大概在什么区间?",
            "你的最高学历是?",
            "你平时睡眠质量怎么样?一般几点睡觉,睡多久?",
            "你平时会记录什么生活内容?(比如日记、笔记、工作记录等)",
            "你用过AI相关的产品吗?比如AI绘画、AI写作这类工具?"
          ],
          page2: [
            "你多久会做一次让你印象深刻的梦?醒来后通常会做什么?",
            "你现在有记录梦境的习惯吗?如果有,用什么方式记录?(备忘录/日记本/语音/不记录)",
            "你一般在什么时候会回想或谈论自己的梦?(早上醒来/和朋友聊天/睡前)"
          ]
        }
      });
    },
  });

  // 智能建议
  useCopilotChatSuggestions({
    instructions: t('copilot.suggestions'),
    minSuggestions: 3,
    maxSuggestions: 4,
  });

  return (
    <div style={{ "--copilot-kit-primary-color": "oklch(0.6 0.2 300)" } as CopilotKitCSSProperties}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen">
          <div className="flex flex-1 flex-col bg-gray-100 min-h-0">
            {/* 可滚动区域 - 包含顶部和中间内容 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {/* 顶部 - 流程状态栏 */}
              <div className="bg-white rounded-lg shadow-sm px-6 py-6">
                <Stepper value={currentStep} className="w-full">
                  <StepperNav className="flex justify-between items-center">
                    <StepperItem step={1} completed={currentStep > 1}>
                      <StepperTrigger
                        className="flex flex-col items-center gap-3"
                        canNavigate={1 < currentStep}
                        onClick={() => handleStepNavigation(1)}
                      >
                        <StepperIndicator className="w-10 h-10 text-sm font-medium bg-primary text-white">
                          <Check className="w-5 h-5" />
                        </StepperIndicator>
                        <div className="text-center">
                          <StepperTitle className="text-sm font-medium text-primary">{t('steps.step1.title')}</StepperTitle>
                          <StepperDescription className="text-xs text-gray-500 mt-1">{t('steps.step1.description')}</StepperDescription>
                        </div>
                      </StepperTrigger>
                      <StepperSeparator className="mx-4 flex-1 bg-primary h-0.5" />
                    </StepperItem>

                    <StepperItem step={2} completed={currentStep > 2}>
                      <StepperTrigger
                        className="flex flex-col items-center gap-3"
                        canNavigate={2 < currentStep}
                        onClick={() => handleStepNavigation(2)}
                      >
                        <StepperIndicator className="w-10 h-10 text-sm font-medium bg-gray-200 text-gray-700 border-2 border-dashed border-primary">
                          2
                        </StepperIndicator>
                        <div className="text-center">
                          <StepperTitle className="text-sm font-medium text-primary">{t('steps.step2.title')}</StepperTitle>
                          <StepperDescription className="text-xs text-gray-500 mt-1">{t('steps.step2.description')}</StepperDescription>
                        </div>
                      </StepperTrigger>
                      <StepperSeparator className="mx-4 flex-1 bg-gray-200 h-0.5" />
                    </StepperItem>

                    <StepperItem step={3} completed={currentStep > 3}>
                      <StepperTrigger
                        className="flex flex-col items-center gap-3"
                        canNavigate={3 < currentStep}
                        onClick={() => handleStepNavigation(3)}
                      >
                        <StepperIndicator className="w-10 h-10 text-sm font-medium bg-gray-200 text-gray-500">
                          3
                        </StepperIndicator>
                        <div className="text-center">
                          <StepperTitle className="text-sm font-medium text-gray-500">{t('steps.step3.title')}</StepperTitle>
                          <StepperDescription className="text-xs text-gray-500 mt-1">{t('steps.step3.description')}</StepperDescription>
                        </div>
                      </StepperTrigger>
                    </StepperItem>
                  </StepperNav>
                </Stepper>
              </div>

              {/* 中间内容区 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <InterviewForm surveyData={surveyData} setSurveyData={setSurveyData} />
              </div>
            </div>

            {/* 底部导航 - 吸底显示 */}
            <div className="bg-gray-100 p-4 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('navigation.nextPreview')}
                    </h3>
                    <p className="text-gray-600">
                      {t('navigation.nextDescription')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleStepNavigation(1)}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t('navigation.previous')}
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentStep(3);
                        router.push('/insight/interview');
                      }}
                      className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                    >
                      {t('navigation.next')}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
        <CopilotSidebar
          clickOutsideToClose={false}
          defaultOpen={true}
          labels={{
            title: t('copilot.title'),
            initial: t('copilot.initial')
          }}
        />
      </SidebarProvider>
    </div>
  )
}