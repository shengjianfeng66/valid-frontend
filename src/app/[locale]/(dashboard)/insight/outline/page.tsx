"use client"

// ==================== CopilotKit ====================
import { useCoAgent, useCopilotAction, useCopilotChatInternal, useCopilotReadable } from "@copilotkit/react-core"
import { type CopilotKitCSSProperties, CopilotSidebar, useCopilotChatSuggestions } from "@copilotkit/react-ui"
import { ArrowLeft, ArrowRight, FileText, Plus } from "lucide-react"
// ==================== 第三方库 ====================
import { useTranslations } from "next-intl"
// ==================== React 相关 ====================
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
// ==================== 业务组件 ====================
import { InsightStepper } from "@/components/insight"
// ==================== 布局组件 ====================
import { AppSidebar } from "@/components/sidebar/app-sidebar"
// ==================== UI 基础组件 ====================
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAppContext } from "@/contexts/app"

// ==================== Contexts ====================
import { useDraft } from "@/contexts/draft"
// ==================== Next.js 相关 ====================
import { useRouterWithLoading as useRouter } from "@/hooks/useRouterWithLoading"
// ==================== Services ====================
import { createInterview } from "@/services/interview"
// ==================== Stores ====================
import { useSurveyStore } from "@/stores/survey-store"

interface SurveyData {
  surveyIntro: string
  surveyTargetUsers: string
  surveyQuestions: {
    page1: { q1: string; q2: string }
    page2: { q1: string; q2: string }
    page3: { q1: string; q2: string }
  }
  interviewTargetUsers: string
  interviewOutline: InterviewOutline
}

// 创建访谈的响应类型
interface CreateInterviewResponse {
  id: number
  name: string
  description: string
  proposal: any
  outline: any
  questionnaire: any
  duration: number
  organization_id: number
  user_id: number
  project_id: number
  state: number
  created_at: string
}

interface AgentState {
  count: number
  data: Record<string, any>
}

// 访谈大纲完整结构体 - 参考 demo.jsonc
interface InterviewOutline {
  product_alignment?: {
    intro_paragraph: string
  }
  closing_script?: {
    thank_you: string
  }
  opening_script: {
    greeting: string
  }
  sections: InterviewSection[]
}

interface InterviewSection {
  name: string
  questions: InterviewQuestion[]
  reason: string
}

interface InterviewQuestion {
  main: string
  probes: string[]
}

// 用户体验调查问卷组件
interface SurveyFormProps {
  surveyData: SurveyData
  setSurveyData: React.Dispatch<React.SetStateAction<SurveyData>>
  syncToAgent?: () => void // ✅ 添加失焦同步函数
}

// 用户访谈大纲组件
function InterviewForm({ surveyData, setSurveyData, syncToAgent }: SurveyFormProps) {
  const t = useTranslations("outline")

  // 计算总问题数量
  const getTotalQuestionCount = () => {
    if (!surveyData.interviewOutline.sections) return 0
    return surveyData.interviewOutline.sections.reduce((total, section) => total + section.questions.length, 0)
  }

  const handleIntroParagraphChange = (value: string) => {
    setSurveyData((prev) => ({
      ...prev,
      interviewOutline: {
        ...prev.interviewOutline,
        product_alignment: {
          intro_paragraph: value,
        },
      },
    }))
  }

  const handleGreetingChange = (value: string) => {
    setSurveyData((prev) => ({
      ...prev,
      interviewOutline: {
        ...prev.interviewOutline,
        opening_script: {
          greeting: value,
        },
      },
    }))
  }

  const handleQuestionChange = (sectionIndex: number, questionIndex: number, value: string) => {
    setSurveyData((prev) => {
      const newData = { ...prev }
      const newSections = [...newData.interviewOutline.sections]
      const newQuestions = [...newSections[sectionIndex].questions]
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], main: value }
      newSections[sectionIndex] = { ...newSections[sectionIndex], questions: newQuestions }
      newData.interviewOutline = { ...newData.interviewOutline, sections: newSections }
      return newData
    })
  }

  const handleProbeChange = (sectionIndex: number, questionIndex: number, probeIndex: number, value: string) => {
    setSurveyData((prev) => {
      const newData = { ...prev }
      const newSections = [...newData.interviewOutline.sections]
      const newQuestions = [...newSections[sectionIndex].questions]
      const newProbes = [...newQuestions[questionIndex].probes]
      newProbes[probeIndex] = value
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], probes: newProbes }
      newSections[sectionIndex] = { ...newSections[sectionIndex], questions: newQuestions }
      newData.interviewOutline = { ...newData.interviewOutline, sections: newSections }
      return newData
    })
  }

  const addProbe = (sectionIndex: number, questionIndex: number) => {
    setSurveyData((prev) => {
      const newData = { ...prev }
      const newSections = [...newData.interviewOutline.sections]
      const newQuestions = [...newSections[sectionIndex].questions]
      const newProbes = [...newQuestions[questionIndex].probes]
      newProbes.push("")
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], probes: newProbes }
      newSections[sectionIndex] = { ...newSections[sectionIndex], questions: newQuestions }
      newData.interviewOutline = { ...newData.interviewOutline, sections: newSections }
      return newData
    })
  }

  const removeProbe = (sectionIndex: number, questionIndex: number, probeIndex: number) => {
    setSurveyData((prev) => {
      const newData = { ...prev }
      const newSections = [...newData.interviewOutline.sections]
      const newQuestions = [...newSections[sectionIndex].questions]
      const newProbes = [...newQuestions[questionIndex].probes]
      newProbes.splice(probeIndex, 1)
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], probes: newProbes }
      newSections[sectionIndex] = { ...newSections[sectionIndex], questions: newQuestions }
      newData.interviewOutline = { ...newData.interviewOutline, sections: newSections }
      return newData
    })
  }

  const addQuestion = (sectionIndex: number) => {
    // 检查总问题数量是否超过 20 个
    if (getTotalQuestionCount() >= 20) {
      toast.warning(t("interview.questionLimit.warning"))
      return
    }

    setSurveyData((prev) => {
      const newData = { ...prev }
      const newSections = [...newData.interviewOutline.sections]
      const newQuestions = [...newSections[sectionIndex].questions]
      newQuestions.push({ main: "", probes: [] })
      newSections[sectionIndex] = { ...newSections[sectionIndex], questions: newQuestions }
      newData.interviewOutline = { ...newData.interviewOutline, sections: newSections }
      return newData
    })
  }

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    setSurveyData((prev) => {
      const newData = { ...prev }
      const newSections = [...newData.interviewOutline.sections]
      const newQuestions = [...newSections[sectionIndex].questions]
      newQuestions.splice(questionIndex, 1)
      newSections[sectionIndex] = { ...newSections[sectionIndex], questions: newQuestions }
      newData.interviewOutline = { ...newData.interviewOutline, sections: newSections }
      return newData
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">{t("interview.title")}</h2>
      </div>

      <div className="space-y-8">
        {/* 引言 - intro_paragraph */}
        {surveyData.interviewOutline.product_alignment?.intro_paragraph && (
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              引言
            </label>
            <textarea
              value={surveyData.interviewOutline.product_alignment.intro_paragraph}
              onChange={(e) => handleIntroParagraphChange(e.target.value)}
              onBlur={syncToAgent}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              placeholder="介绍产品和访谈目的..."
            />
          </div>
        )}

        {/* 欢迎语 - greeting */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            欢迎语
          </label>
          <textarea
            value={surveyData.interviewOutline.opening_script.greeting}
            onChange={(e) => handleGreetingChange(e.target.value)}
            onBlur={syncToAgent}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
            placeholder="欢迎您参加本次访谈..."
          />
        </div>

        {/* 动态渲染访谈大纲的各个部分 */}
        {surveyData.interviewOutline.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {sectionIndex + 1}、{section.name}
            </h3>
            <p className="text-sm text-gray-600 mb-6">{section.reason}</p>
            <div className="space-y-6">
              {section.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="space-y-3">
                  {/* 主问题 */}
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={question.main}
                      onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, e.target.value)}
                      onBlur={syncToAgent}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="请输入主问题..."
                    />
                    <button
                      onClick={() => removeQuestion(sectionIndex, questionIndex)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* 追问列表 - probes */}
                  {question.probes && question.probes.length > 0 && (
                    <div className="ml-8 space-y-2">
                      <div className="text-base font-medium text-gray-500 mb-2">追问：</div>
                      {question.probes.map((probe, probeIndex) => (
                        <div key={probeIndex} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <input
                            type="text"
                            value={probe}
                            onChange={(e) => handleProbeChange(sectionIndex, questionIndex, probeIndex, e.target.value)}
                            onBlur={syncToAgent}
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="请输入追问..."
                          />
                          <button
                            onClick={() => removeProbe(sectionIndex, questionIndex, probeIndex)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addProbe(sectionIndex, questionIndex)}
                        className="ml-4 text-base text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        添加追问
                      </button>
                    </div>
                  )}

                  {/* 如果没有追问，显示添加追问按钮 */}
                  {(!question.probes || question.probes.length === 0) && (
                    <div className="ml-8">
                      <button
                        onClick={() => addProbe(sectionIndex, questionIndex)}
                        className="text-base text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        添加追问
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => addQuestion(sectionIndex)}
                className={`w-full py-3 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 ${getTotalQuestionCount() >= 20
                  ? "border-gray-200 text-gray-400 cursor-pointer"
                  : "border-gray-300 text-gray-500 hover:border-primary hover:text-primary"
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
  )
}
export interface FileData {
  name: string
  size: number
  type: string
  path: string // 文件路径，替代原来的 base64 content
}

export default function CheckPage() {
  const t = useTranslations("outline")
  const router = useRouter()
  const { setHasDraft } = useDraft()
  const { user, setShowSignModal } = useAppContext()
  const [currentStep, setCurrentStep] = useState(2)
  const [isCreatingInterview, setIsCreatingInterview] = useState(false)
  const { name, nodeName, state, running, setState, start, stop, run } = useCoAgent<{
    count: number
    surveyInfo?: any
    productSolutionFiles?: FileData[]
    tool_result?: {
      product_alignment?: { intro_paragraph?: string }
      opening_script?: { greeting?: string }
      closing_script?: { thank_you?: string }
      sections?: any[]
    }
  }>({
    name: "outline_agent",
    initialState: {
      count: 0,
      surveyInfo: null,
      productSolutionFiles: [],
    },
  })

  console.log("start", start)
  console.log("stop", stop)
  console.log("running", running)
  console.log("run", run)
  console.log("agent_state", state)
  // 直接使用 CopilotKit 的内部聊天 hook，以便能够在页面加载时
  // 主动向右侧 CopilotSidebar 发送一条用户消息。
  const { sendMessage, messages } = useCopilotChatInternal()
  const hasSentInitialRef = useRef(false)

  // ✅ 检测是否有草稿数据（使用 Zustand）
  const surveyInfo = useSurveyStore((state) => state.surveyInfo)
  const interviewData = useSurveyStore((state) => state.interviewData)

  // 同步数据到 Agent state
  useEffect(() => {
    if (surveyInfo) {
      setState((prevState) => ({
        ...prevState,
        count: prevState?.count || 0,
        // surveyInfo: surveyInfo,
        productSolutionFiles: surveyInfo.productSolutionFiles || [],
      }))
    }
  }, [surveyInfo]) // 移除 setState 依赖，避免无限循环

  useEffect(() => {
    // 如果用户未登录，跳过草稿状态检查
    if (user === null) {
      console.log("用户未登录，跳过草稿状态检查")
      return
    }

    const hasDraft = !!surveyInfo || !!interviewData
    setHasDraft(hasDraft)
  }, [surveyInfo, interviewData, setHasDraft, user])

  useEffect(() => {
    // 如果用户未登录，跳过运行状态检查
    if (user === null) {
      console.log("用户未登录，跳过运行状态检查")
      return
    }

    if (!running) {
    }
  }, [running, user])

  // 从 sessionStorage 读取调研信息并发送给 copilot
  useEffect(() => {
    // 如果用户未登录，跳过数据加载
    if (user === null) {
      console.log("用户未登录，跳过调研信息加载")
      return
    }

    if (hasSentInitialRef.current) return

    const sendSurveyInfo = (surveyInfo: any) => {
      // 等待 CopilotKit 完全初始化
      const checkAndSend = () => {
        // 检查 CopilotKit 是否已经准备好
        if (typeof sendMessage === "function") {
          hasSentInitialRef.current = true

          // 构建基础文本消息 - 文件信息通过 Agent state 传递
          const textMessage = `基于以下调研信息，请帮我生成访谈大纲：

产品名称：${surveyInfo.product_name}
业务类型：${surveyInfo.business_type}
目标用户群体：${surveyInfo.target_users}
用户关心的方面：${surveyInfo.userConcerns}
核心功能模块：${surveyInfo.coreFeatures}

${surveyInfo.productSolutionFiles && surveyInfo.productSolutionFiles.length > 0
              ? `\n注意：我已上传了 ${surveyInfo.productSolutionFiles.length} 个产品方案文件`
              : ""
            }

请确保问题设计能够深度发掘用户需求，帮助优化产品。`

          // 发送消息 - 只使用字符串格式的 content
          void sendMessage({
            id: `survey-${Date.now()}`,
            role: "user",
            content: textMessage,
          })
        } else {
          // 如果还没准备好，继续等待
          setTimeout(checkAndSend, 100)
        }
      }

      // 延迟一点时间再开始检查
      setTimeout(checkAndSend, 500)
    }

    // ✅ 从 Zustand store 读取调研信息
    const currentSurveyInfo = useSurveyStore.getState().surveyInfo
    if (currentSurveyInfo) {
      sendSurveyInfo(currentSurveyInfo)
    }
  }, [sendMessage, user])

  // 处理步骤导航 - 只能返回不能往前跳
  const handleStepNavigation = (targetStep: number) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep)
      // 根据步骤导航到对应页面
      if (targetStep === 1) {
        router.push("/insight/goal")
      }
    }
  }

  const [surveyData, setSurveyData] = useState<SurveyData>({
    surveyIntro: "",
    surveyTargetUsers: "",
    surveyQuestions: {
      page1: { q1: "", q2: "" },
      page2: { q1: "", q2: "" },
      page3: { q1: "", q2: "" },
    },
    interviewTargetUsers: "",
    interviewOutline: {
      product_alignment: {
        intro_paragraph: "",
      },
      opening_script: {
        greeting: "",
      },
      closing_script: {
        thank_you: "",
      },
      sections: [],
    },
  })

  useEffect(() => {
    // 如果用户未登录，跳过 Agent 状态同步
    if (user === null) {
      console.log("用户未登录，跳过 Agent 状态同步")
      return
    }

    try {
      // 检查是否有有效的 tool_result
      if (!state?.tool_result) return

      const { tool_result } = state
      // const tool_result = {
      //   "product_alignment": {
      //     "intro_paragraph": "Note-Taking App是一款专为年轻专业人士和学生设计的笔记应用。本次访谈旨在深入了解用户的使用习惯，并验证产品功能需求，以帮助优化产品体验。"
      //   },
      //   "opening_script": {
      //     "greeting": "您好，感谢您参加我们的访谈。本次访谈将帮助我们更好地理解您对Note-Taking App的使用体验和需求。访谈内容将被录音，仅用于研究分析，您的隐私将得到严格保护。您可以随时选择退出。"
      //   },
      //   "sections": [
      //     {
      //       "name": "热身与背景",
      //       "reason": "了解用户的基本背景和使用场景，以便后续问题更具针对性。",
      //       "questions": [
      //         {
      //           "main": "请您介绍一下自己在学习或工作中通常如何使用Note-Taking App？",
      //           "probes": [
      //             "您通常在哪些场景下使用这款笔记应用？",
      //             "您使用Note-Taking App的频率如何？"
      //           ]
      //         }
      //       ]
      //     },
      //     {
      //       "name": "现状与痛点",
      //       "reason": "识别用户在使用过程中遇到的困难和未被满足的需求。",
      //       "questions": [
      //         {
      //           "main": "在使用Note-Taking App记录笔记时，您遇到过哪些困难或不便？",
      //           "probes": [
      //             "能否分享一次因为功能限制而影响使用的经历？",
      //             "哪些功能或环节让您觉得最费力或容易出错？"
      //           ]
      //         }
      //       ]
      //     },
      //     {
      //       "name": "动机与优先级",
      //       "reason": "理解用户使用产品的动机及其优先考虑的功能需求。",
      //       "questions": [
      //         {
      //           "main": "如果Note-Taking App只能解决一个问题，您希望是哪一个？为什么？",
      //           "probes": [
      //             "您认为哪些功能对您的学习或工作最重要？",
      //             "在选择笔记应用时，您最看重哪些方面？"
      //           ]
      //         }
      //       ]
      //     },
      //     {
      //       "name": "期望与理想",
      //       "reason": "探索用户对产品的理想状态和期望的功能表现。",
      //       "questions": [
      //         {
      //           "main": "在理想情况下，您希望Note-Taking App如何帮助您更好地记录和管理笔记？",
      //           "probes": [
      //             "您认为怎样的功能或体验能让您更满意？",
      //             "如果可以添加一个新功能，您希望是什么？"
      //           ]
      //         }
      //       ]
      //     },
      //     {
      //       "name": "收束与补充",
      //       "reason": "总结访谈内容并提供补充机会。",
      //       "questions": [
      //         {
      //           "main": "您还有什么关于Note-Taking App的使用体验或建议希望补充的？",
      //           "probes": [
      //             "您认为还有哪些方面可以进一步优化？",
      //             "您是否有其他笔记应用的使用经验可以分享？"
      //           ]
      //         }
      //       ]
      //     }
      //   ],
      //   "closing_script": {
      //     "thank_you": "感谢您的参与和分享。您的反馈对我们非常重要，将帮助我们优化Note-Taking App。后续如有任何问题或补充，欢迎随时联系。祝您生活愉快！"
      //   }
      // }

      console.log("tool_result", tool_result)
      // 验证数据完整性
      const hasValidData =
        tool_result.opening_script?.greeting || (tool_result.sections && tool_result.sections.length > 0)

      if (!hasValidData) {
        console.warn("⚠️ Agent 返回数据不完整")
        return
      }

      // 提取数据
      const newOutline = {
        product_alignment: tool_result.product_alignment?.intro_paragraph
          ? {
            intro_paragraph: tool_result.product_alignment.intro_paragraph,
          }
          : undefined,
        opening_script: {
          greeting: tool_result.opening_script?.greeting || "",
        },
        closing_script: tool_result.closing_script?.thank_you
          ? {
            thank_you: tool_result.closing_script.thank_you,
          }
          : undefined,
        sections: tool_result.sections || [],
      }

      // 更新表单数据
      setSurveyData((prev: any) => ({
        ...prev,
        interviewOutline: newOutline,
      }))
    } catch (error) { }
  }, [state?.tool_result, user]) // 监听 tool_result 变化和用户状态

  // ✅ 失焦时同步：前端 → Agent
  const syncToAgent = useCallback(() => {
    if (surveyData.interviewOutline) {
      setState((prev) => ({
        count: prev?.count || 0,
        tool_result: surveyData.interviewOutline,
      }))
    }
  }, [surveyData.interviewOutline, setState])

  // 创建访谈
  const handleCreateInterview = async () => {
    setIsCreatingInterview(true)

    try {
      // TODO: 从认证系统获取真实的 user_id
      const userId = 1 // 临时硬编码，后续需要从 session 或 context 中获取

      // 从 Zustand store 获取调研信息
      const currentSurveyInfo = useSurveyStore.getState().surveyInfo

      // 构建 goal 参数
      const goal = currentSurveyInfo
        ? {
          product_name: currentSurveyInfo.product_name || "",
          business_type: currentSurveyInfo.business_type || "",
          target_users: currentSurveyInfo.target_users || "",
          research_goal: currentSurveyInfo.userConcerns || "",
        }
        : undefined

      // 构建 outline 参数 - 只要有 opening_script 或 sections 就发送
      const hasOutlineData =
        surveyData.interviewOutline.opening_script.greeting?.trim() ||
        surveyData.interviewOutline.sections.length > 0

      const outline = hasOutlineData
        ? {
          product_alignment: surveyData.interviewOutline.product_alignment?.intro_paragraph
            ? {
              intro_paragraph: surveyData.interviewOutline.product_alignment.intro_paragraph,
            }
            : undefined,
          opening_script: {
            greeting: surveyData.interviewOutline.opening_script.greeting || "",
          },
          closing_script: surveyData.interviewOutline.closing_script?.thank_you
            ? {
              thank_you: surveyData.interviewOutline.closing_script.thank_you,
            }
            : undefined,
          sections: surveyData.interviewOutline.sections.map((section) => ({
            name: section.name,
            reason: section.reason,
            questions: section.questions.map((q) => ({
              main: q.main,
              probes: q.probes,
            })),
          })),
        }
        : undefined

      // 使用 services/interview.ts 中的 createInterview 函数，包含认证 header
      const data: CreateInterviewResponse = await createInterview({
        user_id: userId,
        goal: goal,
        outline: outline,
      })

      console.log("访谈创建成功：", data)

      toast.success("访谈创建成功", {
        description: `访谈 ID: ${data.id}`,
      })

      // 跳转到访谈页面，并带上访谈 id
      setCurrentStep(3)
      router.push(`/insight/interview?id=${data.id}`)
    } catch (error) {
      console.error("创建访谈失败：", error)
      toast.error("创建访谈失败", {
        description: "请检查后端服务是否正常运行",
      })
    } finally {
      setIsCreatingInterview(false)
    }
  }

  // 智能建议
  useCopilotChatSuggestions({
    instructions: t("copilot.suggestions"),
    minSuggestions: 3,
    maxSuggestions: 4,
  })

  return (
    <div style={{ "--copilot-kit-primary-color": "oklch(0.6 0.2 300)" } as CopilotKitCSSProperties}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen">
          <div className="flex flex-1 flex-col bg-gray-100 min-h-0">
            {/* 可滚动区域 - 包含顶部和中间内容 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {/* 顶部 - 流程状态栏 */}
              <InsightStepper
                currentStep={currentStep}
                onStepClick={handleStepNavigation}
                translationNamespace="outline"
              />

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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("nextPreview")}</h3>
                    <p className="text-gray-600">{t("nextDescription")}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleStepNavigation(1)}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t("previous")}
                    </Button>
                    <Button
                      onClick={handleCreateInterview}
                      disabled={isCreatingInterview}
                      className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                    >
                      {isCreatingInterview ? "创建中..." : t("next")}
                      {!isCreatingInterview && <ArrowRight className="w-4 h-4" />}
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
            title: t("copilot.title"),
            initial: t("copilot.initial"),
          }}
          imageUploadsEnabled={true}
        />
      </SidebarProvider>

      {/* 登录模态框 */}
    </div>
  )
}
