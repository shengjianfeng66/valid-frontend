"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { Loader2, Eye } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen">
        <div className="flex flex-1 flex-col bg-gray-100 min-h-0">
          {/* 可滚动区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {/* 顶部标题栏和筛选 */}
            <div className="bg-white rounded-lg shadow-sm px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  <div className="flex flex-col">
                    <h1 className="text-xl font-semibold text-gray-900">访谈数据分析</h1>
                    <span className="text-xs text-gray-500 mt-0.5">访谈 ID: {interviewId}</span>
                  </div>
                  {!loading && data.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      共 {pagination.total} 条记录
                    </Badge>
                  )}
                </div>

                {/* Interview ID 选择器 */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">切换访谈:</label>
                  <input
                    type="number"
                    value={interviewId}
                    onChange={(e) => setInterviewId(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* 数据展示 */}
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
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">序号</TableHead>
                        <TableHead>受访者</TableHead>
                        <TableHead>用户画像</TableHead>
                        <TableHead className="w-[100px]">类型</TableHead>
                        <TableHead className="w-[120px]">状态</TableHead>
                        <TableHead className="w-[180px]">访谈时间</TableHead>
                        <TableHead className="w-[100px]">问答数</TableHead>
                        <TableHead className="w-[100px] text-center">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((item, index) => (
                        <TableRow key={item.response.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium text-primary">
                            #{(currentPage - 1) * pageSize + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">
                                {item.interviewee.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ID: {item.response.id}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[300px]">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {item.response.details.meta.profile_brief}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={item.interviewee.source === 0 ? "default" : "outline"}
                              className={item.interviewee.source === 0 ? "bg-blue-500" : ""}
                            >
                              {item.interviewee.source === 0 ? "真人" : "模拟"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.response.state === 2 ? "default" : "secondary"}>
                              {item.response.state === 2 ? "已完成" : "进行中"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {new Date(item.response.created_at).toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <span className="text-sm font-medium text-gray-900">
                                {item.response.details.answers.reduce(
                                  (total, section) => total + section.questions.length,
                                  0
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">个</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(item)}
                              className="hover:bg-primary/10 hover:text-primary"
                            >
                              <Eye className="w-4 h-4 mr-1" />
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

                {/* 用户详情抽屉 */}
                <UserDetailSheet
                  open={showUserDetailSheet}
                  onOpenChange={setShowUserDetailSheet}
                  selectedUser={selectedUser}
                />
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
