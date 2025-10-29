"use client"

import type { CopilotKitCSSProperties } from "@copilotkit/react-ui"

// ==================== CopilotKit ====================
import {
  useCopilotAction,
  useCopilotAdditionalInstructions,
  useCopilotChat,
  useCopilotReadable,
} from "@copilotkit/react-core"
import { CopilotSidebar, useCopilotChatSuggestions } from "@copilotkit/react-ui"
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql"

// ==================== 第三方库 ====================
import { ArrowLeft, ArrowRight, FileText, Plus, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { useSearchParams } from "next/navigation"
// ==================== React 相关 ====================
import { useEffect, useRef } from "react"

// ==================== 业务组件 ====================
import { InsightStepper } from "@/components/insight"
// ==================== 布局组件 ====================
import { AppSidebar } from "@/components/sidebar/app-sidebar"

// ==================== UI 基础组件 ====================
import { Button } from "@/components/ui/button"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

// ==================== Contexts ====================
import { useDraft } from "@/contexts/draft"

// ==================== Next.js 相关 ====================
import { useRouterWithLoading as useRouter } from "@/hooks/useRouterWithLoading"
// ==================== Stores ====================
import { useFormStore } from "@/stores/form-store"
import { useSurveyStore } from "@/stores/survey-store"

interface FormData {
  product_name: string
  business_type: string
  target_users: string
  research_goal: string
  product_solution: (File & { _content?: string })[]
}

export default function Page() {
  const t = useTranslations("goal")
  const { setHasDraft } = useDraft()

  const { formData, updateField, hasData, setFormData, clearForm, attachments, setInitialMessage } = useFormStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // 检测表单数据变化，更新草稿状态
  useEffect(() => {
    setHasDraft(hasData())
  }, [formData, setHasDraft, hasData])

  // 同步 dashboard 上传的附件到产品方案文件（只在初始加载时同步一次）
  const hasSyncedAttachmentsRef = useRef(false)

  useEffect(() => {
    // 只在初始加载时同步一次，之后不再重新同步
    if (hasSyncedAttachmentsRef.current) return
    if (!attachments || attachments.length === 0) return
    if (formData.product_solution && formData.product_solution.length > 0) return // 已有文件，不覆盖

    // 将附件转换为产品方案文件
    const convertAttachmentsToFiles = async () => {
      const filePromises = attachments.map(async (item: any) => {
        try {
          let file: File

          // 优先使用原始文件对象
          if (item.originFileObj) {
            file = item.originFileObj
          } else if (item.url) {
            // 备用方案：从 URL 获取文件
            const response = await fetch(item.url)
            const blob = await response.blob()
            file = new File([blob], item.name, { type: item.type })
          } else {
            return null
          }

          // 读取文件内容为 base64
          return new Promise<File & { _content?: string }>((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              const content = e.target?.result as string
              const fileWithContent = Object.assign(file, { _content: content })
              resolve(fileWithContent)
            }
            reader.readAsDataURL(file)
          })
        } catch (error) {
          console.warn("无法转换附件：", item.name, error)
          return null
        }
      })

      const files = await Promise.all(filePromises)
      const validFiles = files.filter((f): f is File & { _content?: string } => f !== null)

      if (validFiles.length > 0) {
        // 只有在成功转换文件后才标记为已同步
        hasSyncedAttachmentsRef.current = true
        updateField("product_solution", validFiles)
      }
    }

    convertAttachmentsToFiles()
  }, [attachments, formData.product_solution, updateField])

  // 表单验证函数
  const validateForm = () => {
    const requiredFields = [
      { key: "product_name", label: t("validation.fields.productName") },
      { key: "business_type", label: t("validation.fields.businessType") },
      { key: "target_users", label: t("validation.fields.targetUsers") },
      { key: "research_goal", label: t("validation.fields.researchGoals") },
    ]

    const missingFields = requiredFields.filter((field) => {
      const value = formData[field.key as keyof FormData]
      return !value || (typeof value === "string" && value.trim() === "")
    })

    return missingFields
  }

  // 检查表单是否有效
  const isFormValid = () => {
    return validateForm().length === 0
  }

  // 处理下一步点击
  const handleNext = () => {
    const missingFields = validateForm()
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map((field) => field.label).join("、")
      alert(t("validation.required", { fields: fieldNames }))
      return
    }

    // ✅ 将调研信息存储到 Zustand store，供 outline 页面使用
    const surveyInfo = {
      product_name: formData.product_name,
      business_type: formData.business_type,
      target_users: formData.target_users,
      userConcerns: formData.research_goal || "",
      coreFeatures: "",
      hasProductSolution: formData.product_solution && formData.product_solution.length > 0,
      productSolutionName: formData.product_solution?.map((file) => file.name).join(", ") || "",
    }

    useSurveyStore.getState().setSurveyInfo(surveyInfo)

    router.push("/insight/outline")
  }

  const { appendMessage } = useCopilotChat()

  // 从 Zustand store（优先）或 query 中读取 initialMessage，并自动发送到右侧 Chat
  useEffect(() => {
    const sendInitialMessageToChat = async (message: string, attachmentsData?: any[]) => {
      console.info("------ send initial messages ------")
      // 如果有附件，将附件信息附加到消息中
      let fullMessage = message

      if (attachmentsData && attachmentsData.length > 0) {
        const attachmentInfo = attachmentsData
          .map((item: any) => `\n\n📎 附件：${item.name} (${(item.size / 1024).toFixed(2)} KB, ${item.type})`)
          .join("")

        fullMessage = `${message + attachmentInfo}\n\n请基于以上信息和附件内容，帮我分析并填写表单。`
      }

      // await appendMessage({ id: `init-${Date.now()}`, role: "user", content: fullMessage })

      await appendMessage(
        new TextMessage({
          role: MessageRole.User,
          content: fullMessage,
        }),
      )
    }

    const initialMessage = useFormStore.getState().initialMessage
    if (initialMessage) {
      sendInitialMessageToChat(initialMessage, attachments).finally(() => {
        useFormStore.getState().setInitialMessage("")
      })
    }
  }, [appendMessage, attachments, setInitialMessage])

  useCopilotAdditionalInstructions({ instructions: "使用中文回答" })

  // 让 AI 能够读取表单数据
  useCopilotReadable({
    description: "当前表单的所有数据，包括产品名称、业务类型、目标用户画像、调研目标、产品方案文件和用户上传的附件信息",
    value: {
      product_name: formData.product_name,
      business_type: formData.business_type,
      target_users: formData.target_users,
      research_goal: formData.research_goal,
      hasProductSolution: formData.product_solution && formData.product_solution.length > 0,
      productSolutionFiles:
        formData.product_solution && formData.product_solution.length > 0
          ? formData.product_solution.map((file) => ({
              name: file.name,
              size: file.size,
              type: file.type,
              sizeInKB: (file.size / 1024).toFixed(2),
            }))
          : null,
      productSolutionCount: formData.product_solution?.length || 0,
      attachments:
        attachments.length > 0
          ? attachments.map((item: any) => ({
              name: item.name,
              size: item.size,
              type: item.type,
              sizeInKB: (item.size / 1024).toFixed(2),
            }))
          : null,
      hasAttachments: attachments.length > 0,
      attachmentCount: attachments.length,
    },
  })

  // 更新产品名称
  useCopilotAction({
    name: "updateProductName",
    description: t("actions.updateProductName"),
    parameters: [
      {
        name: "product_name",
        type: "string",
        description: "新的产品名称",
        required: true,
      },
    ],
    handler: ({ product_name }) => {
      updateField("product_name", product_name)
    },
  })

  // 更新业务类型
  useCopilotAction({
    name: "updateBusinessType",
    description: t("actions.updateBusinessType"),
    parameters: [
      {
        name: "business_type",
        type: "string",
        description: "新的业务类型，如：笔记 APP、工具类、社交类等",
        required: true,
      },
    ],
    handler: ({ business_type }) => {
      updateField("business_type", business_type)
    },
  })

  // 更新目标用户群体
  useCopilotAction({
    name: "updateTargetUsers",
    description: t("actions.updateTargetUsers"),
    parameters: [
      {
        name: "target_users",
        type: "string",
        description: "目标用户群体描述，如：年轻女性用户、下沉市场用户、重度购物用户等",
        required: true,
      },
    ],
    handler: ({ target_users }) => {
      updateField("target_users", target_users)
    },
  })

  // 更新调研目标
  useCopilotAction({
    name: "updateResearchGoals",
    description: t("actions.updateResearchGoals"),
    parameters: [
      {
        name: "research_goal",
        type: "string",
        description: "调研目标，如：了解用户使用习惯、验证产品功能需求、分析用户痛点等",
        required: true,
      },
    ],
    handler: ({ research_goal }) => {
      updateField("research_goal", research_goal)
    },
  })

  // 清空表单
  useCopilotAction({
    name: "clearForm",
    description: t("actions.clearForm"),
    parameters: [],
    handler: () => {
      clearForm()
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
  })

  // // 填充示例数据
  useCopilotAction({
    name: "fillSampleData",
    description: t("actions.fillSampleData"),
    parameters: [],
    handler: () => {
      setFormData({
        product_name: "Dreamoo",
        business_type: "笔记 APP、工具类、社交类",
        target_users: "年轻女性用户、下沉市场用户、重度购物用户等\n\n请详细描述您的目标用户群体特征",
        research_goal: "了解用户使用习惯、验证产品功能需求、分析用户痛点等\n\n请描述您希望通过调研了解什么",
        // 不清空现有的产品方案文件
        product_solution: formData.product_solution,
      })
    },
  })

  // 智能建议
  useCopilotChatSuggestions({
    instructions: t("copilot.suggestions"),
    minSuggestions: 3,
    maxSuggestions: 3,
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
              <InsightStepper currentStep={1} translationNamespace="goal" />

              {/* 中间内容区 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <SurveyForm fileInputRef={fileInputRef} />
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
                      onClick={() => router.push("/dashboard")}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t("previous")}
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!isFormValid()}
                      className={`flex items-center gap-2 transition-all duration-200 ${
                        isFormValid()
                          ? "bg-primary hover:bg-primary/90 text-white"
                          : "bg-primary/80 text-white cursor-not-allowed hover:bg-primary/70"
                      }`}
                    >
                      {t("next")}
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
            title: t("copilot.title"),
            initial: t("copilot.initial"),
          }}
          imageUploadsEnabled={true}
        />
      </SidebarProvider>
    </div>
  )
}

interface SurveyFormProps {
  fileInputRef: React.RefObject<HTMLInputElement>
}

function SurveyForm({ fileInputRef }: SurveyFormProps) {
  const t = useTranslations("goal")
  const { formData, updateField } = useFormStore()

  const handleInputChange = (field: keyof FormData, value: string) => {
    updateField(field, value)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
    const maxSize = 100 * 1024 * 1024 // 100MB

    const validFiles: File[] = []
    const currentFiles = formData.product_solution || []

    // 验证所有文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // 检查文件类型
      if (!allowedTypes.includes(file.type)) {
        alert(`${t("fileUpload.invalidType")}: ${file.name}`)
        continue
      }

      // 检查文件大小
      if (file.size > maxSize) {
        alert(`${t("fileUpload.tooLarge")}: ${file.name}`)
        continue
      }

      validFiles.push(file)
    }

    // 批量读取文件内容
    if (validFiles.length > 0) {
      const filePromises = validFiles.map((file) => {
        return new Promise<File & { _content?: string }>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const content = e.target?.result as string
            const fileWithContent = Object.assign(file, { _content: content })
            resolve(fileWithContent)
          }
          reader.readAsDataURL(file)
        })
      })

      Promise.all(filePromises).then((filesWithContent) => {
        // 添加到现有文件列表
        updateField("product_solution", [...currentFiles, ...filesWithContent])
      })
    }

    // 清空 input，允许重复上传相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFile = (index: number) => {
    console.log("删除文件：", index, "当前文件数：", formData.product_solution?.length)
    const currentFiles = formData.product_solution || []
    const newFiles = currentFiles.filter((_, i) => i !== index)
    console.log("删除后文件数：", newFiles.length)

    // 删除文件

    updateField("product_solution", newFiles.length > 0 ? newFiles : [])
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      {/* 表单标题 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
      </div>

      <div className="space-y-6">
        {/* 产品名称和业务类型 - 并排布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("form.productName.label")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.product_name}
              onChange={(e) => handleInputChange("product_name", e.target.value)}
              placeholder={t("form.productName.placeholder")}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">{t("form.productName.help")}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("form.businessType.label")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.business_type}
              onChange={(e) => handleInputChange("business_type", e.target.value)}
              placeholder={t("form.businessType.placeholder")}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">{t("form.businessType.help")}</p>
          </div>
        </div>

        {/* 目标用户画像 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("form.targetUsers.label")} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.target_users}
            onChange={(e) => handleInputChange("target_users", e.target.value)}
            placeholder={t("form.targetUsers.placeholder")}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{t("form.targetUsers.help")}</p>
        </div>

        {/* 调研目标 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("form.researchGoals.label")} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.research_goal}
            onChange={(e) => handleInputChange("research_goal", e.target.value)}
            placeholder={t("form.researchGoals.placeholder")}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{t("form.researchGoals.help")}</p>
        </div>

        {/* 产品方案文件上传 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("form.productSolution.label")}
            {formData.product_solution && formData.product_solution.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">({formData.product_solution.length} 个文件)</span>
            )}
          </label>

          {/* 已上传文件列表 */}
          {formData.product_solution && formData.product_solution.length > 0 && (
            <div className="mb-3 space-y-2">
              {formData.product_solution.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRemoveFile(index)
                    }}
                    className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors group"
                    title="删除文件"
                  >
                    <X className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 上传区域 */}
          <div
            onClick={handleUploadClick}
            className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {formData.product_solution && formData.product_solution.length > 0
                    ? "继续添加文件"
                    : t("form.productSolution.uploadText")}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t("form.productSolution.uploadHelp")} • 支持批量上传</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
