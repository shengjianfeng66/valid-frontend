"use client"

// ==================== CopilotKit ====================
import {
  useCopilotAdditionalInstructions,
  useCopilotChatInternal,
  useCopilotReadable,
  useFrontendTool,
} from "@copilotkit/react-core"
import { type CopilotKitCSSProperties, CopilotSidebar, useCopilotChatSuggestions } from "@copilotkit/react-ui"
import { ArrowLeft, ArrowRight, FileText, Plus, X } from "lucide-react"
// ==================== Next.js 相关 ====================
import { useSearchParams } from "next/navigation"
// ==================== 第三方库 ====================
import { useTranslations } from "next-intl"
// ==================== React 相关 ====================
import { useEffect, useRef } from "react"
import { shallow } from "zustand/shallow"
// ==================== 业务组件 ====================
import { InsightStepper } from "@/components/insight"
// ==================== 布局组件 ====================
import { AppSidebar } from "@/components/sidebar/app-sidebar"
// ==================== UI 基础组件 ====================
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
// ==================== Contexts ====================
import { useDraft } from "@/contexts/draft"
import { useRouterWithLoading as useRouter } from "@/hooks/useRouterWithLoading"
import getAuthHeaders from "@/services/auth"
// ==================== Stores ====================
import { useFormStore } from "@/stores/form-store"
import { useSurveyStore } from "@/stores/survey-store"

interface FormData {
  product_name: string
  business_type: string
  target_users: string
  research_goal: string
  product_solution: {
    name: string
    size: number
    type: string
    file_path: string
  }[]
}

/**
 * 智能操作按钮
 *
 * @param fileInputRef
 */
function useFrontendTools(fileInputRef: React.RefObject<HTMLInputElement | null>) {
  const t = useTranslations("goal")

  const { formData, updateField, setFormData, clearForm } = useFormStore()

  // 更新产品名称
  useFrontendTool({
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
  useFrontendTool({
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
  useFrontendTool({
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
  useFrontendTool({
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
  useFrontendTool({
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
  useFrontendTool({
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
}

export default function Page() {
  const t = useTranslations("goal")
  const searchParams = useSearchParams()
  const { setHasDraft } = useDraft()
  const { formData, updateField, attachments, initialMessage, setInitialMessage } = useFormStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    // 监听表单数据变化，更新草稿状态
    return useFormStore.subscribe(({ formData: currentFormData, hasData }, { formData: prevFormData }) => {
      if (!shallow(currentFormData, prevFormData)) {
        setHasDraft(hasData())
      }
    })
  }, [setHasDraft])

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
          // 如果附件已经有 file_path，直接使用
          if (item.file_path) {
            return {
              name: item.name,
              size: item.size,
              type: item.type,
              file_path: item.file_path,
            }
          }

          // 否则需要上传到后端
          let file: File
          if (item.originFileObj) {
            file = item.originFileObj
          } else if (item.url) {
            const response = await fetch(item.url)
            const blob = await response.blob()
            file = new File([blob], item.name, { type: item.type })
          } else {
            return null
          }

          // 上传文件到后端
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/attachments/upload`, {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`上传失败：${response.statusText}`)
          }

          const result = await response.json()
          if (result.success) {
            return {
              name: result.data.filename,
              size: result.data.file_size,
              type: result.data.content_type,
              file_path: result.data.file_path,
            }
          } else {
            throw new Error(result.message || "上传失败")
          }
        } catch (error) {
          return null
        }
      })

      const files = await Promise.all(filePromises)
      const validFiles = files.filter((f): f is NonNullable<typeof f> => f !== null)

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
      productSolutionFiles:
        formData.product_solution?.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          path: file.file_path,
        })) || [],
    }

    useSurveyStore.getState().setSurveyInfo(surveyInfo)

    router.push("/insight/outline")
  }
  // 直接使用 CopilotKit 的内部聊天 hook，以便能够在页面加载时
  // 主动向右侧 CopilotSidebar 发送一条用户消息。
  const { sendMessage } = useCopilotChatInternal()
  const hasSentInitialRef = useRef(false)

  // 从 Zustand store（优先）或 query 中读取 initialMessage，并自动发送到右侧 Chat
  useEffect(() => {
    if (hasSentInitialRef.current) return

    const sendInitialMessageToChat = (message: string, attachmentsData?: any[]) => {
      // 等待 CopilotKit 完全初始化
      const checkAndSend = () => {
        // 检查 CopilotKit 是否已经准备好
        if (typeof sendMessage === "function") {
          hasSentInitialRef.current = true

          // 如果有附件，将附件信息附加到消息中
          let fullMessage = message
          if (attachmentsData && attachmentsData.length > 0) {
            const attachmentInfo = attachmentsData
              .map((item: any) => `\n\n📎 附件：${item.name} (${(item.size / 1024).toFixed(2)} KB, ${item.type})`)
              .join("")
            fullMessage = `${message + attachmentInfo}\n\n请基于以上信息和附件内容，帮我分析并填写表单。`
          }

          void sendMessage({ id: `init-${Date.now()}`, role: "user", content: fullMessage })

          // 发送后清理 store 中的 initialMessage（但保留 attachments）
          setInitialMessage("")
        } else {
          // 如果还没准备好，继续等待
          setTimeout(checkAndSend, 100)
        }
      }

      // 延迟一点时间再开始检查
      setTimeout(checkAndSend, 500)
    }

    // 1) 优先从 Zustand store 读取
    if (initialMessage?.trim()) {
      sendInitialMessageToChat(initialMessage.trim(), attachments)
      return
    }

    // 2) 兜底：从 URL query 读取（兼容历史行为）
    const q = searchParams?.get("initialMessage")?.trim()
    if (q && !hasSentInitialRef.current) {
      sendInitialMessageToChat(q)
    }
  }, [searchParams, sendMessage, initialMessage, attachments, setInitialMessage])

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

  useFrontendTools(fileInputRef)

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
        <SidebarInset className="flex flex-col h-screen bg-muted">
          <div className="flex flex-1 flex-col  min-h-0">
            {/* 可滚动区域 - 包含顶部和中间内容 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {/* 顶部 - 流程状态栏 */}
              <InsightStepper currentStep={1} translationNamespace="goal" />

              {/* 中间内容区 */}
              <div className="bg-background rounded-lg shadow-sm p-6">
                <SurveyForm fileInputRef={fileInputRef} />
              </div>
            </div>

            {/* 底部导航 - 吸底显示 */}
            <div className="p-4 flex-shrink-0">
              <div className="bg-background rounded-lg shadow-sm px-6 py-6">
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
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

function SurveyForm({ fileInputRef }: SurveyFormProps) {
  const t = useTranslations("goal")
  const { formData, updateField } = useFormStore()

  const handleInputChange = (field: keyof FormData, value: string) => {
    updateField(field, value)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // 批量上传文件到后端
    if (validFiles.length > 0) {
      const uploadPromises = validFiles.map(async (file) => {
        try {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("folder", "product-solutions")
          const authHeaders = await getAuthHeaders()
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/attachments/upload`, {
            method: "POST",
            headers: {
              ...authHeaders,
            },
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`上传失败：${response.statusText}`)
          }

          const result = await response.json()
          if (result.success) {
            return {
              name: result.data.filename,
              size: result.data.file_size,
              type: result.data.content_type,
              file_path: result.data.file_path,
            }
          } else {
            throw new Error(result.message || "上传失败")
          }
        } catch (error) {
          alert(`文件 ${file.name} 上传失败：${error instanceof Error ? error.message : "未知错误"}`)
          return null
        }
      })

      const uploadResults = await Promise.all(uploadPromises)
      const successfulUploads = uploadResults.filter((result): result is NonNullable<typeof result> => result !== null)

      if (successfulUploads.length > 0) {
        // 添加到现有文件列表
        updateField("product_solution", [...currentFiles, ...successfulUploads])
      }
    }

    // 清空 input，允许重复上传相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFile = async (index: number) => {
    const currentFiles = formData.product_solution || []
    const fileToDelete = currentFiles[index]

    if (!fileToDelete) return

    try {
      // 调用后端 API 删除文件
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL +
          `/api/v1/product/attachments/delete?file_path=${encodeURIComponent(fileToDelete.file_path)}`,
        {
          method: "DELETE",
          headers: {
            ...(await getAuthHeaders()),
          },
        }
      )

      if (!response.ok) {
        throw new Error(`删除失败：${response.statusText}`)
      }

      const result = await response.json()
      if (result.success) {
        // 从列表中移除文件
        const newFiles = currentFiles.filter((_, i) => i !== index)
        updateField("product_solution", newFiles.length > 0 ? newFiles : [])
      } else {
        throw new Error(result.message || "删除失败")
      }
    } catch (error) {
      alert(`文件 ${fileToDelete.name} 删除失败：${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="rounded-lg shadow-sm p-8">
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
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => handleInputChange("product_name", e.target.value)}
                placeholder={t("form.productName.placeholder")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">{t("form.productName.help")}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("form.businessType.label")} <span className="text-red-500">*</span>
              <input
                type="text"
                value={formData.business_type}
                onChange={(e) => handleInputChange("business_type", e.target.value)}
                placeholder={t("form.businessType.placeholder")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">{t("form.businessType.help")}</p>
          </div>
        </div>

        {/* 目标用户画像 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("form.targetUsers.label")} <span className="text-red-500">*</span>
            <textarea
              value={formData.target_users}
              onChange={(e) => handleInputChange("target_users", e.target.value)}
              placeholder={t("form.targetUsers.placeholder")}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">{t("form.targetUsers.help")}</p>
        </div>

        {/* 调研目标 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("form.researchGoals.label")} <span className="text-red-500">*</span>
            <textarea
              value={formData.research_goal}
              onChange={(e) => handleInputChange("research_goal", e.target.value)}
              placeholder={t("form.researchGoals.placeholder")}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">{t("form.researchGoals.help")}</p>
        </div>

        {/* 产品方案文件上传 */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            {t("form.productSolution.label")}
            {formData.product_solution && formData.product_solution.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">({formData.product_solution.length} 个文件)</span>
            )}
          </span>

          {/* 已上传文件列表 */}
          {formData.product_solution && formData.product_solution.length > 0 && (
            <div className="mb-3 space-y-2">
              {formData.product_solution.map((file, index) => (
                <div
                  key={file.file_path}
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
                    type="button"
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
