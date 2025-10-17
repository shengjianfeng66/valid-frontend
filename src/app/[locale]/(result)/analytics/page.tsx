"use client";

// ==================== React 相关 ====================
import { useEffect, useState } from "react";

// ==================== Supabase ====================
import { createClient } from "@/lib/supabase/client";

// ==================== Next.js 相关 ====================
import { useSearchParams } from "next/navigation";

// ==================== 第三方库 ====================
import { toast } from "sonner";
import useSWR from 'swr';

// ==================== CopilotKit ====================
import { CopilotKitCSSProperties } from "@copilotkit/react-ui";
import { useCopilotReadable, useCoAgent } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

// ==================== UI 基础组件 ====================
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ==================== 布局组件 ====================
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { UserDetailSheet } from "@/components/user-detail-sheet";

// ==================== 业务组件 ====================
import { ReportTab, OriginalVoiceTab, InsightsTab } from "@/components/analytics";

// ==================== 服务层 ====================
import { fetchInterviewResponses, fetchInterviewDetail } from "@/services/interview";
import type { InterviewResponseWithInterviewee, InterviewResponsesData } from "@/types/interview";

// 使用导入的 InterviewResponseWithInterviewee 类型，不再需要本地定义

// 使用导入的 InterviewDetail 类型
import type { InterviewDetail as ImportedInterviewDetail } from "@/types/interview";

interface Report {
  type: number // 0: 真人用户报告, 1: 模拟用户报告
  report: string // markdown 格式的报告内容
}

// 扩展 InterviewDetail 类型以包含分析报告
interface InterviewDetailWithAnalysis extends ImportedInterviewDetail {
  analysis?: {
    reports: Report[]
  }
}

export default function Page() {
  const searchParams = useSearchParams()
  const urlInterviewId = searchParams.get('interview_id')

  const [data, setData] = useState<InterviewResponseWithInterviewee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interviewId, setInterviewId] = useState(urlInterviewId ? Number(urlInterviewId) : 20) // 从 URL 获取或默认 20
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserDetailSheet, setShowUserDetailSheet] = useState(false)
  const [isAuthReady, setIsAuthReady] = useState(false) // 认证是否准备好
  const { setState: setAgentState } = useCoAgent<{
    interview_id: number;
    interview_name?: string;
    total_responses?: number;
    current_page?: number;
    page_size?: number;
    filtered_data_count?: number;
    has_reports?: boolean;
  }>({
    name: "user_agent",
    initialState: {
      interview_id: interviewId,
      interview_name: '',
      total_responses: 0,
      current_page: 1,
      page_size: 10,
      filtered_data_count: 0,
      has_reports: false,
    },
  });
  // 检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        console.log("🔐 认证状态检查:", session ? "已登录" : "未登录");
        setIsAuthReady(true);
      } catch (error) {
        console.error("认证检查失败:", error);
        setIsAuthReady(true); // 即使失败也继续，让后续请求处理错误
      }
    };
    checkAuth();
  }, []);

  // 使用 SWR 获取访谈详情（包含分析报告），使用带 Authorization 的请求
  // 只有在认证准备好后才启用
  const { data: interviewDetail, error: detailError, isLoading: isLoadingDetail } = useSWR<InterviewDetailWithAnalysis>(
    interviewId && isAuthReady ? `interview-detail-${interviewId}` : null,
    async () => {
      const detail = await fetchInterviewDetail(String(interviewId));
      return detail as InterviewDetailWithAnalysis;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // 获取可用的报告
  const availableReports = interviewDetail?.analysis?.reports || [];

  const handleViewDetail = (item: InterviewResponseWithInterviewee) => {
    // 转换数据格式为 UserDetailSheet 期望的格式
    const content = item.interviewee.content;
    const attributes: Record<string, string> = {};

    // 从 user_profile_tags 中提取所有标签
    if (content && content.user_profile_tags) {
      Object.keys(content.user_profile_tags).forEach(categoryKey => {
        const category = content.user_profile_tags?.[categoryKey];

        if (category && category.subcategories) {
          Object.keys(category.subcategories).forEach(subKey => {
            const subcategory = category.subcategories?.[subKey];

            if (subcategory && subcategory.tags) {
              Object.keys(subcategory.tags).forEach(tagKey => {
                attributes[tagKey] = subcategory.tags[tagKey];
              });
            }
          });
        }
      });
    }

    const userForSheet = {
      id: `response-${item.response.id}`,
      name: item.interviewee.name,
      avatar: (() => {
        const gender = content?.user_profile_tags?.demographics?.subcategories?.basic_identity?.tags?.['性别'];
        if (gender === '男性' || gender === '男') return '👨';
        if (gender === '女性' || gender === '女') return '👩';
        return '😊';
      })(),
      status: item.response.state === 3 ? "已完成" : "进行中",
      isReal: false,
      attributes: attributes,
      rawContent: content,
      source: item.interviewee.source,
      created_at: item.response.created_at,
      responseId: item.response.id,
      intervieweeId: item.interviewee.id,
      responseDetails: item.response.details,
      hasInterviewData: true
    };

    setSelectedUser(userForSheet)
    setShowUserDetailSheet(true)
  }

  // 让 AI 能够读取访谈数据
  // useCopilotReadable({
  //   description: "当前访谈的所有响应数据，包括受访者信息、问答记录、用户画像等",
  //   value: {
  //     interview_id: interviewId,
  //     total_responses: data.length,
  //     current_page_data: data.map(item => ({
  //       interviewee_name: item.interviewee.name,
  //       profile_brief: item.response.details.meta.profile_brief,
  //       source: item.interviewee.source === 0 ? '真人' : '模拟',
  //       state: item.response.state === 3 ? '已完成' : '进行中',
  //       answers_summary: item.response.details.answers.map(section => ({
  //         section: section.section_name,
  //         question_count: section.questions.length
  //       })),
  //       closing_summary: item.response.details.closing?.summary
  //     })),
  //     all_data: data // 完整数据供 AI 深度分析
  //   }
  // })

  // 监听 URL 参数变化
  useEffect(() => {
    if (urlInterviewId) {
      const id = Number(urlInterviewId)
      if (id !== interviewId) {
        setInterviewId(id)
      }
    }
    setAgentState(prev => ({
      ...prev,
      interview_id: interviewId, // 使用当前的 interviewId 而不是 interviewDetail.id
      interview_name: interviewDetail?.name || ''
    }));
  }, [urlInterviewId, interviewId])

  // 获取访谈数据
  // 只有在认证准备好后才发起请求
  useEffect(() => {
    if (!isAuthReady) {
      console.log("⏳ 等待认证完成...");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 一次性加载100条数据，使用带 Authorization 的请求
        const result: InterviewResponsesData = await fetchInterviewResponses(
          Number(interviewId),
          1,
          100
        )
        console.log("🚀 ~ fetchData ~ result:", result)

        if (result.success && result.items) {
          setData(result.items)

          toast.success('数据加载成功', {
            description: `已加载 ${result.items.length} 条记录，共 ${result.total} 条`
          })
        } else {
          throw new Error('数据格式错误')
        }
      } catch (err) {
        console.error('获取数据失败:', err)
        setError(err instanceof Error ? err.message : '未知错误')
        toast.error('数据加载失败', {
          description: '请检查后端服务是否正常运行'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()


  }, [interviewId, isAuthReady])

  return (
    <div style={{ "--copilot-kit-primary-color": "oklch(0.6 0.2 300)" } as CopilotKitCSSProperties}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen">
          <div className="flex flex-1 flex-col bg-gray-100 min-h-0">
            {/* Tab 导航 - 吸顶 */}
            <Tabs defaultValue="original" className="w-full flex flex-col flex-1 min-h-0">
              <div className="sticky top-0 z-10 bg-white shadow-sm mx-4 mt-4 rounded-t-lg overflow-hidden">
                <TabsList className="w-full h-auto p-0 bg-white border-b-2 border-gray-100 rounded-none grid grid-cols-3">
                  <TabsTrigger
                    value="report"
                    className="relative rounded-none border-b-3 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none py-4 px-6 text-base font-medium text-gray-600 data-[state=active]:text-primary transition-all hover:bg-gray-50 data-[state=active]:hover:bg-primary/5"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      数据报告
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 data-[state=active]:scale-x-100 transition-transform origin-center" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="original"
                    className="relative rounded-none border-b-3 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none py-4 px-6 text-base font-medium text-gray-600 data-[state=active]:text-primary transition-all hover:bg-gray-50 data-[state=active]:hover:bg-primary/5"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      用户原声
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 data-[state=active]:scale-x-100 transition-transform origin-center" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="insights"
                    className="relative rounded-none border-b-3 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none py-4 px-6 text-base font-medium text-gray-600 data-[state=active]:text-primary transition-all hover:bg-gray-50 data-[state=active]:hover:bg-primary/5"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      深度洞察
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 data-[state=active]:scale-x-100 transition-transform origin-center" />
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* 数据报告 Tab */}
              <TabsContent value="report" className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                <ReportTab
                  isLoading={isLoadingDetail}
                  error={detailError}
                  reports={availableReports}
                />
              </TabsContent>

              {/* 用户原声 Tab */}
              <TabsContent value="original" className="flex-1 flex flex-col px-4 pb-4 min-h-0">
                <OriginalVoiceTab
                  loading={loading}
                  error={error}
                  data={data}
                  onViewDetail={handleViewDetail}
                />
              </TabsContent>

              {/* 深度洞察 Tab */}
              <TabsContent value="insights" className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                <InsightsTab />
              </TabsContent>
            </Tabs>
          </div>

          {/* 用户详情抽屉 */}
          <UserDetailSheet
            open={showUserDetailSheet}
            onOpenChange={setShowUserDetailSheet}
            selectedUser={selectedUser}
          />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
