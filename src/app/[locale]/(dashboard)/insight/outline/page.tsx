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
import { useCopilotAction, useCopilotReadable, useCopilotChatInternal, useCoAgent } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar, useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { useState, useRef, useEffect, useCallback } from "react";
import { FileText, ArrowRight, ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useDraft } from "@/contexts/draft";
import { toast } from "sonner";
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
  interviewTargetUsers: string;
  interviewOutline: InterviewOutline;
}

interface AgentState {
  count: number;
  data: Record<string, any>;
}

// 访谈大纲完整结构体 - 参考 demo.jsonc
interface InterviewOutline {
  closing_script: {
    conclusion: string;
  };
  opening_script: {
    introduction: string;
  };
  sections: InterviewSection[];
}

interface InterviewSection {
  name: string;
  questions: InterviewQuestion[];
  reason: string;
}

interface InterviewQuestion {
  main: string;
  probes: string[];
}


// 用户体验调查问卷组件
interface SurveyFormProps {
  surveyData: SurveyData;
  setSurveyData: React.Dispatch<React.SetStateAction<SurveyData>>;
  syncToAgent?: () => void; // ✅ 添加失焦同步函数
}

// 用户访谈大纲组件
function InterviewForm({ surveyData, setSurveyData, syncToAgent }: SurveyFormProps) {
  const t = useTranslations('outline');

  // 计算总问题数量
  const getTotalQuestionCount = () => {
    if (!surveyData.interviewOutline.sections) return 0;
    return surveyData.interviewOutline.sections.reduce((total, section) => total + section.questions.length, 0);
  };

  const handleIntroductionChange = (value: string) => {
    setSurveyData(prev => ({
      ...prev,
      interviewOutline: {
        ...prev.interviewOutline,
        opening_script: {
          ...prev.interviewOutline.opening_script,
          introduction: value
        }
      }
    }));
  };

  const handleQuestionChange = (sectionIndex: number, questionIndex: number, value: string) => {
    setSurveyData(prev => {
      const newData = { ...prev };
      const newSections = [...newData.interviewOutline.sections];
      const newQuestions = [...newSections[sectionIndex].questions];
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], main: value };
      newSections[sectionIndex] = { ...newSections[sectionIndex], questions: newQuestions };
      newData.interviewOutline = { ...newData.interviewOutline, sections: newSections };
      return newData;
    });
  };

  const addQuestion = (sectionIndex: number) => {
    // 检查总问题数量是否超过20个
    if (getTotalQuestionCount() >= 20) {
      toast.warning(t('interview.questionLimit.warning'));
      return;
    }

    setSurveyData(prev => {
      const newData = { ...prev };
      const newSections = [...newData.interviewOutline.sections];
      const newQuestions = [...newSections[sectionIndex].questions];
      newQuestions.push({ main: "", probes: [] });
      newSections[sectionIndex] = { ...newSections[sectionIndex], questions: newQuestions };
      newData.interviewOutline = { ...newData.interviewOutline, sections: newSections };
      return newData;
    });
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    setSurveyData(prev => {
      const newData = { ...prev };
      const newSections = [...newData.interviewOutline.sections];
      const newQuestions = [...newSections[sectionIndex].questions];
      newQuestions.splice(questionIndex, 1);
      newSections[sectionIndex] = { ...newSections[sectionIndex], questions: newQuestions };
      newData.interviewOutline = { ...newData.interviewOutline, sections: newSections };
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
            value={surveyData.interviewOutline.opening_script.introduction}
            onChange={(e) => handleIntroductionChange(e.target.value)}
            onBlur={syncToAgent}
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
            placeholder="欢迎您参加 Dreamoo 用户访谈。本次访谈的目的是了解您使用 Dreamoo 记录梦境的体验，包括使用习惯、满意的地方以及希望改进的地方，以帮助我们优化产品。访谈预计需要约10分钟，您的信息将被严格保密，仅用于产品优化。没有标准答案，您的真实感受最有价值。如果您准备好了，我们将开始访谈。"
          />
        </div>

        {/* 动态渲染访谈大纲的各个部分 */}
        {surveyData.interviewOutline.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              {sectionIndex + 1}、{section.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{section.reason}</p>
            <div className="space-y-4">
              {section.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={question.main}
                    onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, e.target.value)}
                    onBlur={syncToAgent}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="请输入问题..."
                  />
                  <button
                    onClick={() => removeQuestion(sectionIndex, questionIndex)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => addQuestion(sectionIndex)}
                className={`w-full py-3 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 ${getTotalQuestionCount() >= 20
                  ? 'border-gray-200 text-gray-400 cursor-pointer'
                  : 'border-gray-300 text-gray-500 hover:border-primary hover:text-primary'
                  }`}
              >
                <Plus className="w-4 h-4" />
                添加问题
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CheckPage() {
  const t = useTranslations('outline');
  const router = useRouter();
  const { setHasDraft } = useDraft();
  const [currentStep, setCurrentStep] = useState(2);
  const { name, nodeName, state, running, setState, start, stop, run } = useCoAgent<{
    count: number;
    tool_result?: {
      opening_script?: { introduction?: string };
      closing_script?: { conclusion?: string };
      sections?: any[];
    };
  }>({
    name: "outline_agent",
    initialState: {
      count: 0,
    },
  });

  console.log("start", start);
  console.log("stop", stop);
  console.log("running", running);
  console.log("run", run);
  console.log("agent_state", state);
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

  useEffect(() => {
    if (!running) {

    }
  }, [running])

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
    surveyIntro: "",
    surveyTargetUsers: "",
    surveyQuestions: {
      page1: { q1: "", q2: "" },
      page2: { q1: "", q2: "" },
      page3: { q1: "", q2: "" }
    },
    interviewTargetUsers: "",
    interviewOutline: {
      opening_script: {
        introduction: ""
      },
      closing_script: {
        conclusion: ""
      },
      sections: []
    }
  });


  useEffect(() => {
    try {
      // 检查是否有有效的 tool_result
      if (!state?.tool_result) return;

      const { tool_result } = state;

      // 验证数据完整性
      const hasValidData =
        tool_result.opening_script?.introduction ||
        (tool_result.sections && tool_result.sections.length > 0);

      if (!hasValidData) {
        console.warn('⚠️ Agent 返回数据不完整');
        return;
      }

      // 提取数据
      const newOutline = {
        opening_script: {
          introduction: tool_result.opening_script?.introduction || ""
        },
        closing_script: {
          conclusion: tool_result.closing_script?.conclusion || ""
        },
        sections: tool_result.sections || []
      };

      // 更新表单数据
      setSurveyData((prev: any) => ({
        ...prev,
        interviewOutline: newOutline
      }));
    } catch (error) {
    }
  }, [state?.tool_result]); // 监听 tool_result 变化

  // ✅ 失焦时同步：前端 → Agent
  const syncToAgent = useCallback(() => {
    if (surveyData.interviewOutline) {
      setState(prev => ({
        count: prev?.count || 0,
        tool_result: surveyData.interviewOutline
      }));
    }
  }, [surveyData.interviewOutline, setState]);

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
                <InterviewForm surveyData={surveyData} setSurveyData={setSurveyData} syncToAgent={syncToAgent} />
              </div>
            </div>

            {/* 底部导航 - 吸底显示 */}
            <div className="bg-gray-100 p-4 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('nextPreview')}
                    </h3>
                    <p className="text-gray-600">
                      {t('nextDescription')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleStepNavigation(1)}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t('previous')}
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentStep(3);
                        router.push('/insight/interview');
                      }}
                      className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                    >
                      {t('next')}
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
          imageUploadsEnabled={true}
        />
      </SidebarProvider>
    </div>
  )
}