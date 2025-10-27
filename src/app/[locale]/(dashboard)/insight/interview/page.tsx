"use client"

import { notionists } from "@dicebear/collection"
import { createAvatar } from "@dicebear/core"
import { ArrowUp } from "lucide-react"
// ==================== 第三方库 ====================
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { InsightStepper } from "@/components/insight"
// ==================== 业务组件 ====================
import {
  InterviewHeader,
  InviteRealUsersModal,
  LoadingModal,
  RealUsersSection,
  RemoveUserDialog,
  SimulatedUserPoolModal,
  SimulatedUsersSection,
} from "@/components/interview"
// ==================== 布局组件 ====================
import { AppSidebar } from "@/components/sidebar/app-sidebar"

// ==================== UI 基础组件 ====================
import { Button } from "@/components/ui/button"
import { LoadingAnimation } from "@/components/ui/loading-animation"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { UserDetailSheet } from "@/components/user-detail-sheet"

// ==================== Contexts ====================
import { useDraft } from "@/contexts/draft"

// ==================== 自定义 Hooks ====================
import { useInterviewDetail, useInterviewResponses, useRecommendedPersonas } from "@/hooks/useInterview"

import { useRouterWithLoading as useRouter } from "@/hooks/useRouterWithLoading"

// ==================== Services/API ====================
import { fetchSimulatedUserPool, finishInterview, startInterview } from "@/services/interview"
// ==================== Utils/工具函数 ====================
import { extractNumericId, transformPersonaToUser } from "@/utils/interview"

export default function InterviewPage() {
  // ==================== Hooks/工具 ====================
  const t = useTranslations("interview")
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setHasDraft } = useDraft()
  const interviewId = searchParams.get("id")

  // ==================== Refs ====================
  const realUsersRef = useRef<HTMLDivElement>(null)
  const simulatedUsersRef = useRef<HTMLDivElement>(null)

  // ==================== UI 状态 ====================
  const [showScrollTop, setShowScrollTop] = useState(false)

  // ==================== 弹窗状态 ====================
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showSimulatedUserPool, setShowSimulatedUserPool] = useState(false)
  const [showUserDetailSheet, setShowUserDetailSheet] = useState(false)
  const [showRemoveConfirmDialog, setShowRemoveConfirmDialog] = useState(false)
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [loadingModalType, setLoadingModalType] = useState<"start" | "finish">("start")

  // ==================== 用户选择/操作状态 ====================
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [removedUserIds, setRemovedUserIds] = useState<string[]>([])

  // ==================== 用户数据状态 ====================
  const [addedSimulatedUsers, setAddedSimulatedUsers] = useState<any[]>([])
  const [simulatedUserPoolData, setSimulatedUserPoolData] = useState<any[]>([])

  // ==================== 加载状态 ====================
  const [isLoadingUserPool, setIsLoadingUserPool] = useState(false)

  // 使用自定义 hooks 获取访谈详情
  const {
    data: interviewData,
    error: interviewError,
    isLoading: isLoadingInterview,
    mutate: mutateInterview,
  } = useInterviewDetail(interviewId)

  // 从访谈详情中获取推荐人数
  const recommendedCount = interviewData?.participants?.recommended_total || 0
  const interviewState = interviewData?.state

  // 根据访谈状态决定调用哪个接口
  // state === 0: 调用推荐接口
  // state !== 0: 调用 originalsound 接口获取已访谈的模拟用户
  const shouldUseRecommend = interviewState === 0

  // 使用自定义 hooks 获取推荐用户 - 只在 state === 0 时调用
  const {
    data: personasData,
    error: recommendError,
    isLoading: isLoadingRecommended,
  } = useRecommendedPersonas(recommendedCount, !!interviewData && shouldUseRecommend)

  // 使用自定义 hooks 获取已访谈的模拟用户 - 一次性加载100条
  const {
    data: responsesData,
    error: responsesError,
    isLoading: isLoadingResponses,
  } = useInterviewResponses(
    interviewData?.id || null,
    1, // 固定第一页
    !!interviewData && !shouldUseRecommend,
  )

  // 转换推荐用户数据，并过滤掉已删除的
  const recommendedUsers = personasData?.personas
    ? personasData.personas.map(transformPersonaToUser).filter((user) => !removedUserIds.includes(user.id))
    : []

  // 转换已访谈用户数据
  const interviewedUsers =
    responsesData?.success && responsesData.items
      ? responsesData.items
          .filter((item: any) => item.interviewee.source === 1)
          .map((item: any) => {
            const content = item.interviewee.content
            const attributes: Record<string, string> = {}

            // 从 user_profile_tags 中提取所有标签
            if (content && content.user_profile_tags) {
              Object.keys(content.user_profile_tags).forEach((categoryKey) => {
                const category = content.user_profile_tags[categoryKey]

                if (category && category.subcategories) {
                  Object.keys(category.subcategories).forEach((subKey) => {
                    const subcategory = category.subcategories[subKey]

                    if (subcategory && subcategory.tags) {
                      Object.keys(subcategory.tags).forEach((tagKey) => {
                        attributes[tagKey] = subcategory.tags[tagKey]
                      })
                    }
                  })
                }
              })
            }

            // 使用 intervieweeId 生成唯一的头像
            const avatarSvg = createAvatar(notionists, {
              seed: `${item.interviewee.id}`,
            }).toDataUri()

            return {
              id: `response-${item.response.id}`,
              name: item.interviewee.name,
              avatar: avatarSvg,
              status: item.response.state,
              isReal: false,
              attributes,
              rawContent: content,
              source: item.interviewee.source,
              created_at: item.response.created_at,
              duration: item.response.duration,
              responseId: item.response.id,
              intervieweeId: item.interviewee.id,
              responseDetails: item.response.details,
              hasInterviewData: true,
            }
          })
      : []

  // 根据状态选择显示的用户列表
  const displayedUsers = shouldUseRecommend ? recommendedUsers : interviewedUsers

  // 处理错误
  const error = recommendError || responsesError
  useEffect(() => {
    if (error) {
      console.error("获取用户数据失败:", error)
      toast.error("获取用户数据失败", {
        description: "请检查后端服务是否正常运行",
      })
    }
  }, [error])

    // 处理访谈详情错误
    useEffect(() => {
        if (interviewError) {
            console.error('❌ 获取访谈详情失败:', interviewError);
            toast.error('获取访谈详情失败', {
                description: '请检查后端服务是否正常运行'
            });
        }
    }, [interviewError]);

  // 清除草稿状态（interview 页面不需要草稿提示）
  useEffect(() => {
    setHasDraft(false)
    return () => {
      // 组件卸载时保持清除状态
      setHasDraft(false)
    }
  }, [setHasDraft])

  const realUsers: any[] = [] // 真人用户列表（暂时为空）
  // 使用显示的用户和添加的用户，过滤掉已删除的
  const simulatedUsers = [...displayedUsers, ...addedSimulatedUsers.filter((user) => !removedUserIds.includes(user.id))]

  // 合并加载状态
  const isLoadingUsers = isLoadingRecommended || isLoadingResponses

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  // 获取模拟用户池数据
  const handleFetchSimulatedUserPool = async () => {
    setIsLoadingUserPool(true)
    try {
      const personasArray = await fetchSimulatedUserPool()

      if (personasArray.length > 0) {
        const transformedUsers = personasArray.map(transformPersonaToUser)
        setSimulatedUserPoolData(transformedUsers)
      }
    } catch (error) {
      console.error("获取模拟用户池失败:", error)
      toast.error("获取模拟用户池失败", {
        description: "请检查后端服务是否正常运行",
      })
    } finally {
      setIsLoadingUserPool(false)
    }
  }

  // 打开模拟用户池弹窗
  const handleOpenSimulatedUserPool = () => {
    setShowSimulatedUserPool(true)
    handleFetchSimulatedUserPool()
  }

  const handleConfirmAdd = () => {
    // 从用户池中获取选中的用户
    const usersToAdd = simulatedUserPoolData.filter((user) => selectedUsers.includes(user.id))
    setAddedSimulatedUsers((prev) => [...prev, ...usersToAdd])

    toast.success(t("toast.addSimulatedUsersSuccess", { count: selectedUsers.length }), {
      description: t("toast.addSimulatedUsersDescription"),
    })
    setShowSimulatedUserPool(false)
    setSelectedUsers([])
  }

  // 开始访谈
  const handleStartInterview = async () => {
    if (!interviewData) {
      toast.error("无法开始访谈", {
        description: "访谈数据未加载",
      })
      return
    }

    const intervieweeIds = simulatedUsers
      .map((user) => extractNumericId(user.id))
      .filter((id): id is number => id !== null)

    if (intervieweeIds.length === 0) {
      toast.error("无法开始访谈", {
        description: "请至少添加一个模拟用户",
      })
      return
    }

    try {
      await startInterview({
        interview_id: interviewData.id,
        interviewee_ids: intervieweeIds,
      })

      toast.success("访谈已开始", {
        description: `正在访谈 ${intervieweeIds.length} 位用户`,
      })

      // 显示加载弹窗
      setLoadingModalType("start")
      setShowLoadingModal(true)

      // 等待一小段时间让后端处理，然后刷新访谈详情
      setTimeout(async () => {
        await mutateInterview()

        // 自动隐藏弹窗
        setShowLoadingModal(false)
        // 刷新后，状态会变成 1，shouldUseRecommend 会变成 false
        // 自动触发已访谈用户数据的获取
      }, 1000) // 等待 1 秒
    } catch (error) {
      console.error("开始访谈失败:", error)
      toast.error("开始访谈失败", {
        description: "请检查后端服务是否正常运行",
      })
    }
  }

  // 结束访谈
  const handleFinishInterview = async () => {
    if (!interviewData) {
      toast.error("无法结束访谈", {
        description: "访谈数据未加载",
      })
      return
    }

    try {
      // TODO: 从认证系统获取真实的 user_id
      const userId = 1 // 临时硬编码，后续需要从 session 或 context 中获取

      await finishInterview({
        interview_id: interviewData.id,
        user_id: userId,
      })

      toast.success("访谈已结束", {
        description: "访谈状态已更新为已完成",
      })

      // 显示加载弹窗（用于等待AI分析）
      setLoadingModalType("finish")
      setShowLoadingModal(true)

      // 等待一小段时间让后端处理，然后刷新访谈详情
      setTimeout(async () => {
        await mutateInterview()

        // 关闭加载弹窗
        setShowLoadingModal(false)
      }, 1000) // 等待 1 秒
    } catch (error) {
      console.error("结束访谈失败:", error)
      toast.error("结束访谈失败", {
        description: error instanceof Error ? error.message : "请检查后端服务是否正常运行",
      })
      setShowLoadingModal(false) // 出错时也要关闭弹窗
    }
  }

  // 处理用户菜单点击
  const handleViewDetails = (userId: string) => {
    const user = [...displayedUsers, ...addedSimulatedUsers, ...simulatedUserPoolData].find((u) => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setShowUserDetailSheet(true)
    }
  }

  // 跳转到分析页面
  const handleViewAnalytics = () => {
    if (interviewId) {
      router.push(`/analytics?interview_id=${interviewId}`)
    }
  }

  const handleRemoveUser = (userId: string) => {
    // 只在推荐模式下允许移除用户
    if (!shouldUseRecommend) {
      toast.error("无法移除", {
        description: "访谈进行中或已结束，无法移除用户",
      })
      return
    }

    const user = [...displayedUsers, ...addedSimulatedUsers].find((u) => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setShowRemoveConfirmDialog(true)
    }
  }

  const confirmRemoveUser = () => {
    if (selectedUser) {
      // 将用户ID添加到已删除列表
      setRemovedUserIds((prev) => [...prev, selectedUser.id])
      toast.success(t("toast.removeUserSuccess"), {
        description: t("toast.removeUserDescription", {
          name: selectedUser.name,
        }),
      })
    }
    setShowRemoveConfirmDialog(false)
    setSelectedUser(null)
  }

  // 监听滚动显示回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col bg-gray-100 p-4 gap-4">
          {/* 顶部 - 流程状态栏 */}
          <InsightStepper currentStep={3} />
          {/* 用户访谈区域 */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* 顶部标题和开始访谈按钮 */}
            <div className="px-6 py-6 border-b border-gray-200">
              {isLoadingInterview ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingAnimation width={100} height={100} />
                </div>
              ) : interviewData ? (
                <InterviewHeader
                  interviewData={interviewData}
                  onStartInterview={handleStartInterview}
                  onFinishInterview={handleFinishInterview}
                  onViewAnalytics={handleViewAnalytics}
                />
              ) : (
                <div className="text-center py-4 text-gray-500">{t("interview.noData")}</div>
              )}
            </div>

            {/* 真人用户区域 */}
            <div ref={realUsersRef}>
              <RealUsersSection
                realUsers={realUsers}
                shouldUseRecommend={shouldUseRecommend}
                onInviteClick={() => setShowInviteModal(true)}
                onViewDetails={handleViewDetails}
                onRemoveUser={handleRemoveUser}
              />
            </div>

            {/* 分隔线 */}
            <div className="border-t border-gray-200"></div>

            {/* 模拟用户区域 */}
            <div ref={simulatedUsersRef}>
              <SimulatedUsersSection
                simulatedUsers={simulatedUsers}
                isLoadingUsers={isLoadingUsers}
                shouldUseRecommend={shouldUseRecommend}
                responsesTotal={responsesData?.total}
                onAddClick={handleOpenSimulatedUserPool}
                onViewDetails={handleViewDetails}
                onRemoveUser={handleRemoveUser}
              />
            </div>
          </div>

          {/* 回到顶部按钮 */}
          {showScrollTop && (
            <Button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg z-50"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* 邀请真人用户弹窗 */}
        <InviteRealUsersModal open={showInviteModal} onOpenChange={setShowInviteModal} />

        {/* 模拟用户池弹窗 */}
        <SimulatedUserPoolModal
          open={showSimulatedUserPool}
          onOpenChange={(open) => {
            setShowSimulatedUserPool(open)
            if (!open) setSelectedUsers([])
          }}
          selectedUsers={selectedUsers}
          simulatedUserPoolData={simulatedUserPoolData}
          isLoadingUserPool={isLoadingUserPool}
          onToggleUserSelection={toggleUserSelection}
          onViewDetails={handleViewDetails}
          onConfirmAdd={handleConfirmAdd}
        />

        {/* Loading Modal */}
        <LoadingModal open={showLoadingModal} onOpenChange={setShowLoadingModal} type={loadingModalType} />

        {/* 用户详情抽屉 */}
        <UserDetailSheet open={showUserDetailSheet} onOpenChange={setShowUserDetailSheet} selectedUser={selectedUser} />

        {/* 移除用户确认弹窗 */}
        <RemoveUserDialog
          open={showRemoveConfirmDialog}
          onOpenChange={setShowRemoveConfirmDialog}
          userName={selectedUser?.name}
          onConfirm={confirmRemoveUser}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
