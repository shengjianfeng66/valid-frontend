"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Eye, User, Bot } from "lucide-react";
import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getStatusConfig } from "@/utils/interview";

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
    onViewDetail: (item: InterviewResponse) => void;
}

export function OriginalVoiceTab({
    loading,
    error,
    data,
    onViewDetail
}: OriginalVoiceTabProps) {
    // 定义列配置
    const columns = useMemo<ColumnDef<InterviewResponse>[]>(
        () => [
            {
                id: "name",
                accessorFn: (row) => row.interviewee.name,
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="受访者" />
                ),
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900 text-base">
                                {item.interviewee.name}
                            </span>
                        </div>
                    );
                },
                enableColumnFilter: false,
            },
            {
                id: "profile",
                accessorFn: (row) => row.response.details.meta.profile_brief,
                header: "用户画像",
                cell: ({ row }) => (
                    <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-normal">
                        {row.original.response.details.meta.profile_brief}
                    </p>
                ),
                enableColumnFilter: false,
            },
            {
                id: "source",
                accessorFn: (row) => row.interviewee.source,
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="类型" />
                ),
                cell: ({ row }) => {
                    const source = row.original.interviewee.source;
                    return (
                        <Badge
                            variant={source === 0 ? "default" : "outline"}
                            className={source === 0
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : "border-primary/40 text-primary bg-primary/5 hover:bg-primary/10"}
                        >
                            {source === 0 ? "真人" : "模拟用户"}
                        </Badge>
                    );
                },
                meta: {
                    label: "类型",
                    variant: "select",
                    options: [
                        { label: "真人用户", value: "0", icon: User },
                        { label: "模拟用户", value: "1", icon: Bot },
                    ],
                },
                enableColumnFilter: true,
                filterFn: (row, id, value) => {
                    return value.includes(row.original.interviewee.source.toString());
                },
            },
            {
                id: "state",
                accessorFn: (row) => row.response.state,
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="状态" />
                ),
                cell: ({ row }) => {
                    const state = row.original.response.state;
                    return (
                        <Badge
                            className={getStatusConfig(state, true).containerClassName}
                        >
                            {getStatusConfig(state, true).label}
                        </Badge>
                    );
                },
                enableColumnFilter: false,
            },
            {
                id: "created_at",
                accessorFn: (row) => row.response.created_at,
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="访谈时间" />
                ),
                cell: ({ row }) => {
                    const date = new Date(row.original.response.created_at);
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-gray-900">
                                {date.toLocaleDateString('zh-CN', {
                                    month: '2-digit',
                                    day: '2-digit'
                                })}
                            </span>
                            <span className="text-xs text-gray-500">
                                {date.toLocaleTimeString('zh-CN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    );
                },
                enableSorting: true,
            },
            {
                id: "questions",
                accessorFn: (row) => row.response.details.answers.reduce(
                    (total, section) => total + section.questions.length,
                    0
                ),
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="问答数" />
                ),
                cell: ({ row }) => {
                    const count = row.original.response.details.answers.reduce(
                        (total, section) => total + section.questions.length,
                        0
                    );
                    return (
                        <div className="flex items-center justify-center">
                            <div className="rounded-lg px-3 py-1.5 text-sm font-semibold min-w-[45px] text-center">
                                {count}
                            </div>
                        </div>
                    );
                },
                enableSorting: true,
            },
            {
                id: "actions",
                cell: ({ row }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(row.original)}
                        className="hover:bg-primary/10 hover:text-primary font-medium h-9 px-4"
                    >
                        <Eye className="w-4 h-4 mr-1.5" />
                        详情
                    </Button>
                ),
                size: 100,
                enableSorting: false,
                enableHiding: false,
            },
        ],
        [onViewDetail]
    );

    const { table } = useDataTable({
        data,
        columns,
        pageCount: Math.ceil(data.length / 10),
        initialState: {
            sorting: [{ id: "created_at", desc: true }] as any,
            pagination: {
                pageSize: 10,
                pageIndex: 0,
            },
        },
        getRowId: (row) => row.response.id.toString(),
    });

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

    return (
        <div className="bg-white rounded-b-lg shadow-sm">
            <DataTable table={table}>
                <DataTableToolbar table={table} />
            </DataTable>
        </div>
    );
}

