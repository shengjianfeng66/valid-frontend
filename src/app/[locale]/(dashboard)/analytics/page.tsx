"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { Loader2, Eye } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopilotChat, CopilotKitCSSProperties } from "@copilotkit/react-ui"
import { useCopilotReadable } from "@copilotkit/react-core"
import "@copilotkit/react-ui/styles.css"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserDetailSheet } from "@/components/user-detail-sheet"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSearchParams } from "next/navigation"

interface InterviewResponse {
  response: {
    id: number
    created_at: string
    interview_id: number
    duration: number | null
    details: {
      meta: {
        model: string
        language: string
        timestamp: string
        persona_name: string
        profile_brief: string
      }
      answers: Array<{
        section_name: string
        questions: Array<{
          main: string
          answer: string
          probes?: Array<{
            probe: string
            answer: string
          }>
        }>
        reasoning: string
      }>
      closing: {
        summary: string
      }
    }
    interviewee_id: number
    state: number
  }
  interviewee: {
    id: number
    name: string
    source: number
    content: any
  }
}

interface ApiResponse {
  success: boolean
  page: number
  page_size: number
  total: number
  items: InterviewResponse[]
}

export default function Page() {
  const searchParams = useSearchParams()
  const urlInterviewId = searchParams.get('interview_id')

  const [data, setData] = useState<InterviewResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interviewId, setInterviewId] = useState(urlInterviewId ? Number(urlInterviewId) : 20) // 从 URL 获取或默认 20
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  })
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserDetailSheet, setShowUserDetailSheet] = useState(false)
  const [interviewName, setInterviewName] = useState<string>('')

  const handleViewDetail = (item: InterviewResponse) => {
    // 转换数据格式为 UserDetailSheet 期望的格式
    const content = item.interviewee.content;
    const attributes: Record<string, string> = {};

    // 从 user_profile_tags 中提取所有标签
    if (content && content.user_profile_tags) {
      Object.keys(content.user_profile_tags).forEach(categoryKey => {
        const category = content.user_profile_tags[categoryKey];

        if (category && category.subcategories) {
          Object.keys(category.subcategories).forEach(subKey => {
            const subcategory = category.subcategories[subKey];

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
      status: item.response.state === 2 ? "已完成" : "进行中",
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size))
    setCurrentPage(1) // 重置到第一页
  }

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)

  // 让 AI 能够读取访谈数据
  useCopilotReadable({
    description: "当前访谈的所有响应数据，包括受访者信息、问答记录、用户画像等",
    value: {
      interview_id: interviewId,
      total_responses: pagination.total,
      current_page_data: data.map(item => ({
        interviewee_name: item.interviewee.name,
        profile_brief: item.response.details.meta.profile_brief,
        source: item.interviewee.source === 0 ? '真人' : '模拟',
        state: item.response.state === 2 ? '已完成' : '进行中',
        answers_summary: item.response.details.answers.map(section => ({
          section: section.section_name,
          question_count: section.questions.length
        })),
        closing_summary: item.response.details.closing?.summary
      })),
      all_data: data // 完整数据供 AI 深度分析
    }
  })

  // 监听 URL 参数变化
  useEffect(() => {
    if (urlInterviewId) {
      const id = Number(urlInterviewId)
      if (id !== interviewId) {
        setInterviewId(id)
        setCurrentPage(1)
      }
    }
  }, [urlInterviewId, interviewId])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `http://localhost:8000/api/v1/interview/get_responses_and_interviewees?interview_id=${interviewId}&page=${currentPage}&page_size=${pageSize}`
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: ApiResponse = await response.json()
        console.log('API 返回数据:', result)

        if (result.success && result.items) {
          setData(result.items)
          setPagination({
            page: result.page,
            pageSize: result.page_size,
            total: result.total
          })

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
  }, [interviewId, currentPage, pageSize])

  return (
    <div style={{ "--copilot-kit-primary-color": "oklch(0.6 0.2 300)" } as CopilotKitCSSProperties}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen">
          <div className="flex flex-1 flex-col bg-gray-100 min-h-0">
            {/* 可滚动区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {/* Tab 导航 */}
              <Tabs defaultValue="original" className="w-full">
                <div className="bg-white rounded-t-lg shadow-sm overflow-hidden">
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
                <TabsContent value="report" className="mt-0">
                  <div className="bg-white rounded-lg shadow-sm flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-base font-medium text-gray-900">数据报告</p>
                      <p className="text-sm text-gray-500">功能开发中...</p>
                    </div>
                  </div>
                </TabsContent>

                {/* 用户原声 Tab */}
                <TabsContent value="original" className="mt-0">
                  {loading ? (
                    <div className="bg-white rounded-lg shadow-sm flex items-center justify-center py-20">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-gray-500">加载数据中...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="bg-white rounded-lg shadow-sm flex items-center justify-center py-20">
                      <div className="flex flex-col items-center gap-3 max-w-md">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-900">数据加载失败</p>
                        <p className="text-xs text-gray-500 text-center">{error}</p>
                        <button
                          onClick={() => window.location.reload()}
                          className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                        >
                          重新加载
                        </button>
                      </div>
                    </div>
                  ) : data.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm flex items-center justify-center py-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-900">暂无数据</p>
                        <p className="text-xs text-gray-500">当前访谈没有相关数据</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 表格展示 */}
                      <div className="bg-white rounded-b-lg shadow-sm overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/80 border-b-2 border-gray-100">
                              <TableHead className="w-[80px] py-4 font-semibold text-gray-700">序号</TableHead>
                              <TableHead className="py-4 font-semibold text-gray-700 min-w-[180px]">受访者</TableHead>
                              <TableHead className="py-4 font-semibold text-gray-700 min-w-[280px]">用户画像</TableHead>
                              <TableHead className="w-[100px] py-4 font-semibold text-gray-700">类型</TableHead>
                              <TableHead className="w-[110px] py-4 font-semibold text-gray-700">状态</TableHead>
                              <TableHead className="w-[160px] py-4 font-semibold text-gray-700">访谈时间</TableHead>
                              <TableHead className="w-[100px] py-4 font-semibold text-gray-700 text-center">问答数</TableHead>
                              <TableHead className="w-[100px] py-4 font-semibold text-gray-700 text-center">操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.map((item, index) => (
                              <TableRow
                                key={item.response.id}
                                className="border-b border-gray-100 hover:bg-primary/5 transition-colors"
                              >
                                <TableCell className="py-5">
                                  <div className="flex items-center justify-center w-9 h-9 bg-primary/10 rounded-lg text-sm font-semibold text-primary">
                                    {(currentPage - 1) * pageSize + index + 1}
                                  </div>
                                </TableCell>
                                <TableCell className="py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center text-xl shadow-sm">
                                      {(() => {
                                        const gender = item.interviewee.content?.user_profile_tags?.demographics?.subcategories?.basic_identity?.tags?.['性别'];
                                        if (gender === '男性' || gender === '男') return '👨';
                                        if (gender === '女性' || gender === '女') return '👩';
                                        return '😊';
                                      })()}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-semibold text-gray-900 text-base">
                                        {item.interviewee.name}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        ID: {item.response.id}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-5">
                                  <div className="max-w-[350px]">
                                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                                      {item.response.details.meta.profile_brief}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="py-5">
                                  <Badge
                                    variant={item.interviewee.source === 0 ? "default" : "outline"}
                                    className={item.interviewee.source === 0
                                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                                      : "border-primary/40 text-primary bg-primary/5 hover:bg-primary/10"}
                                  >
                                    {item.interviewee.source === 0 ? "👤 真人" : "🤖 模拟用户"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-5">
                                  <Badge
                                    variant={item.response.state === 2 ? "default" : "secondary"}
                                    className={item.response.state === 2
                                      ? "bg-green-500 hover:bg-green-600 text-white"
                                      : "bg-yellow-500 hover:bg-yellow-600 text-white"}
                                  >
                                    {item.response.state === 2 ? "✓ 已完成" : "⏳ 进行中"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-5">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium text-gray-900">
                                      {new Date(item.response.created_at).toLocaleDateString('zh-CN', {
                                        month: '2-digit',
                                        day: '2-digit'
                                      })}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(item.response.created_at).toLocaleTimeString('zh-CN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-5">
                                  <div className="flex items-center justify-center">
                                    <div className="bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-sm font-semibold min-w-[45px] text-center">
                                      {item.response.details.answers.reduce(
                                        (total, section) => total + section.questions.length,
                                        0
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-5 text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDetail(item)}
                                    className="hover:bg-primary/10 hover:text-primary font-medium h-9 px-4"
                                  >
                                    <Eye className="w-4 h-4 mr-1.5" />
                                    详情
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {/* 分页器 */}
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">每页显示</span>
                              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                                <SelectTrigger className="w-[70px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5</SelectItem>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="20">20</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-sm text-muted-foreground">条</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, pagination.total)} 条，
                              共 {pagination.total} 条
                            </span>
                          </div>

                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                              </PaginationItem>

                              {/* 第一页 */}
                              {currentPage > 2 && (
                                <PaginationItem>
                                  <PaginationLink size="icon" onClick={() => handlePageChange(1)} className="cursor-pointer">
                                    1
                                  </PaginationLink>
                                </PaginationItem>
                              )}

                              {/* 省略号 */}
                              {currentPage > 3 && (
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )}

                              {/* 当前页前一页 */}
                              {currentPage > 1 && (
                                <PaginationItem>
                                  <PaginationLink
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="cursor-pointer"
                                  >
                                    {currentPage - 1}
                                  </PaginationLink>
                                </PaginationItem>
                              )}

                              {/* 当前页 */}
                              <PaginationItem>
                                <PaginationLink size="icon" isActive className="cursor-default">
                                  {currentPage}
                                </PaginationLink>
                              </PaginationItem>

                              {/* 当前页后一页 */}
                              {currentPage < totalPages && (
                                <PaginationItem>
                                  <PaginationLink
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="cursor-pointer"
                                  >
                                    {currentPage + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              )}

                              {/* 省略号 */}
                              {currentPage < totalPages - 2 && (
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )}

                              {/* 最后一页 */}
                              {currentPage < totalPages - 1 && (
                                <PaginationItem>
                                  <PaginationLink
                                    size="icon"
                                    onClick={() => handlePageChange(totalPages)}
                                    className="cursor-pointer"
                                  >
                                    {totalPages}
                                  </PaginationLink>
                                </PaginationItem>
                              )}

                              <PaginationItem>
                                <PaginationNext
                                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      </div>

                    </>
                  )}
                </TabsContent>

                {/* 深度洞察 Tab */}
                <TabsContent value="insights" className="mt-0">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
                    <CopilotChat
                      className="h-full"
                      labels={{
                        title: "深度洞察分析",
                        initial: "你好！我是 AI 分析助手。我已经了解了当前访谈的所有数据，包括受访者信息和完整的问答记录。\n\n我可以帮你：\n• 分析用户反馈的共性和差异\n• 提取关键洞察和痛点\n• 生成用户画像总结\n• 提供产品优化建议\n\n请告诉我你想了解什么？"
                      }}
                      instructions="你是一个专业的用户研究分析助手。基于提供的访谈数据，进行深度分析并提供有价值的洞察。请用中文回答，语言要专业且易懂。"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* 用户详情抽屉 */}
              <UserDetailSheet
                open={showUserDetailSheet}
                onOpenChange={setShowUserDetailSheet}
                selectedUser={selectedUser}
              />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
