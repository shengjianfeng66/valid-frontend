"use client";

import { Loader2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface InterviewResponse {
    response: {
        id: number;
        created_at: string;
        interview_id: number;
        duration: number | null;
        details: {
            meta: {
                model: string;
                language: string;
                timestamp: string;
                persona_name: string;
                profile_brief: string;
            };
            answers: Array<{
                section_name: string;
                questions: Array<{
                    main: string;
                    answer: string;
                    probes?: Array<{
                        probe: string;
                        answer: string;
                    }>;
                }>;
                reasoning: string;
            }>;
            closing: {
                summary: string;
            };
        };
        interviewee_id: number;
        state: number;
    };
    interviewee: {
        id: number;
        name: string;
        source: number;
        content: any;
    };
}

interface OriginalVoiceTabProps {
    loading: boolean;
    error: string | null;
    data: InterviewResponse[];
    filteredData: InterviewResponse[];
    paginatedData: InterviewResponse[];
    currentPage: number;
    pageSize: number;
    totalPages: number;
    filterSource: string;
    onFilterChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: string) => void;
    onViewDetail: (item: InterviewResponse) => void;
}

export function OriginalVoiceTab({
    loading,
    error,
    data,
    filteredData,
    paginatedData,
    currentPage,
    pageSize,
    totalPages,
    filterSource,
    onFilterChange,
    onPageChange,
    onPageSizeChange,
    onViewDetail
}: OriginalVoiceTabProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-b-lg shadow-sm flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-gray-500">加载数据中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-b-lg shadow-sm flex items-center justify-center py-20">
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
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-b-lg shadow-sm flex items-center justify-center py-20">
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
        );
    }

    if (filteredData.length === 0) {
        return (
            <div className="bg-white rounded-b-lg shadow-sm flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">未找到匹配结果</p>
                    <p className="text-xs text-gray-500">请尝试调整筛选条件</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onFilterChange('all')}
                        className="mt-2"
                    >
                        清除筛选
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-b-lg shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* 筛选区域 - 固定 */}
            <div className="flex-shrink-0 px-6 py-4 border-b bg-gray-50/30">
                <div className="flex items-center gap-4">
                    {/* 类型筛选 */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">类型:</span>
                        <Select value={filterSource} onValueChange={onFilterChange}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">全部</SelectItem>
                                <SelectItem value="0">👤 真人用户</SelectItem>
                                <SelectItem value="1">🤖 模拟用户</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 结果统计 */}
                    {filterSource !== 'all' && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>找到</span>
                            <span className="font-semibold text-primary">{filteredData.length}</span>
                            <span>条记录</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 表头 - 固定 */}
            <div className="flex-shrink-0 border-b-2 border-gray-100">
                <Table className="table-fixed w-full">
                    <colgroup>
                        <col className="w-[80px]" />
                        <col className="w-[200px]" />
                        <col className="w-[380px]" />
                        <col className="w-[110px]" />
                        <col className="w-[110px]" />
                        <col className="w-[140px]" />
                        <col className="w-[100px]" />
                        <col className="w-[100px]" />
                    </colgroup>
                    <TableHeader>
                        <TableRow className="bg-gray-50/80">
                            <TableHead className="py-4 font-semibold text-gray-700">序号</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">受访者</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">用户画像</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">类型</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">状态</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">访谈时间</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700 text-center">问答数</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700 text-center">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            </div>

            {/* 表格内容 - 可滚动 */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <Table className="table-fixed w-full">
                    <colgroup>
                        <col className="w-[80px]" />
                        <col className="w-[200px]" />
                        <col className="w-[380px]" />
                        <col className="w-[110px]" />
                        <col className="w-[110px]" />
                        <col className="w-[140px]" />
                        <col className="w-[100px]" />
                        <col className="w-[100px]" />
                    </colgroup>
                    <TableBody>
                        {paginatedData.map((item, index) => (
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
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-5 align-top">
                                    <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-normal">
                                        {item.response.details.meta.profile_brief}
                                    </p>
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
                                        variant={item.response.state === 3 ? "default" : "secondary"}
                                        className={item.response.state === 3
                                            ? "bg-green-500 hover:bg-green-600 text-white"
                                            : "bg-yellow-500 hover:bg-yellow-600 text-white"}
                                    >
                                        {item.response.state === 3 ? "✓ 已完成" : "⏳ 进行中"}
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
                                        onClick={() => onViewDetail(item)}
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
            </div>

            {/* 分页器 - 固定 */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-sm text-gray-600">每页显示</span>
                        <Select value={pageSize.toString()} onValueChange={onPageSizeChange}>
                            <SelectTrigger className="w-[70px] h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-600">条</span>
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                        显示 {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredData.length)} 条，共 {filteredData.length} 条
                    </span>
                </div>

                <Pagination className="flex-shrink-0">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>

                        {/* 第一页 */}
                        {currentPage > 2 && (
                            <PaginationItem>
                                <PaginationLink size="icon" onClick={() => onPageChange(1)} className="cursor-pointer">
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
                                    onClick={() => onPageChange(currentPage - 1)}
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
                                    onClick={() => onPageChange(currentPage + 1)}
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
                                    onClick={() => onPageChange(totalPages)}
                                    className="cursor-pointer"
                                >
                                    {totalPages}
                                </PaginationLink>
                            </PaginationItem>
                        )}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}

