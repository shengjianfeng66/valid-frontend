"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Bot, Eye, Loader2, User } from "lucide-react"
import { useMemo } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { Button } from "@/components/ui/button"
import { useDataTable } from "@/hooks/use-data-table"
import type { InterviewResponseWithInterviewee } from "@/types/interview"
import { formatDate, formatDurationMinutes, getStatusConfig } from "@/utils/interview"

interface OriginalVoiceTabProps {
  loading: boolean
  error: string | null
  data: InterviewResponseWithInterviewee[]
  onViewDetail: (item: InterviewResponseWithInterviewee) => void
}

export function OriginalVoiceTab({ loading, error, data, onViewDetail }: OriginalVoiceTabProps) {
  // 定义列配置
  const columns = useMemo<ColumnDef<InterviewResponseWithInterviewee>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.interviewee.name,
        header: () => <div className="pl-4 font-semibold text-sm">受访者</div>,
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex items-center gap-3 pl-4">
              <span className="text-sm text-gray-900">{item.interviewee.name}</span>
            </div>
          )
        },
        enableColumnFilter: false,
      },
      {
        id: "profile",
        accessorFn: (row) => row.response?.details?.meta?.profile_brief,
        accessorKey: "profile_brief",
        header: () => <div className="font-semibold text-sm">用户画像</div>,
        cell: ({ row }) => (
          <p className="text-sm text-gray-900 leading-relaxed break-words whitespace-normal">
            {row.original?.response?.details?.meta?.profile_brief}
          </p>
        ),
        enableColumnFilter: false,
      },
      {
        id: "age",
        accessorFn: (row) =>
          row.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.basic_identity?.tags?.["年龄"],
        header: () => <div className="font-semibold text-sm">年龄</div>,
        cell: ({ row }) => {
          const age =
            row.original.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.basic_identity?.tags?.[
              "年龄"
            ]
          return <span className="text-sm text-gray-900">{age ? `${age}岁` : "-"}</span>
        },
        enableColumnFilter: false,
      },
      {
        id: "gender",
        accessorFn: (row) =>
          row.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.basic_identity?.tags?.["性别"],
        header: () => <div className="font-semibold text-sm">性别</div>,
        cell: ({ row }) => {
          const gender =
            row.original.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.basic_identity?.tags?.[
              "性别"
            ]
          return <span className="text-sm text-gray-900">{gender || "-"}</span>
        },
        enableColumnFilter: false,
      },
      {
        id: "birth_year",
        accessorFn: (row) =>
          row.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.basic_identity?.tags?.["出生年代"],
        header: () => <div className="font-semibold text-sm">出生年代</div>,
        cell: ({ row }) => {
          const birthYear =
            row.original.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.basic_identity?.tags?.[
              "出生年代"
            ]
          return <span className="text-sm text-gray-900">{birthYear ? `${birthYear}年` : "-"}</span>
        },
        enableColumnFilter: false,
      },
      {
        id: "marital_status",
        accessorFn: (row) =>
          row.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.family_structure?.tags?.[
            "婚恋状态"
          ],
        header: () => <div className="font-semibold text-sm">婚恋状态</div>,
        cell: ({ row }) => {
          const status =
            row.original.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.family_structure?.tags?.[
              "婚恋状态"
            ]
          return <span className="text-sm text-gray-900">{status || "-"}</span>
        },
        enableColumnFilter: false,
      },
      {
        id: "children_count",
        accessorFn: (row) =>
          row.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.family_structure?.tags?.[
            "子女数量"
          ],
        header: () => <div className="font-semibold text-sm">子女数量</div>,
        cell: ({ row }) => {
          const count =
            row.original.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.family_structure?.tags?.[
              "子女数量"
            ]
          return <span className="text-sm text-gray-900">{count !== undefined && count !== null ? count : "-"}</span>
        },
        enableColumnFilter: false,
      },
      {
        id: "nationality",
        accessorFn: (row) =>
          row.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.cultural_background?.tags?.["国籍"],
        header: () => <div className="font-semibold text-sm">国籍</div>,
        cell: ({ row }) => {
          const nationality =
            row.original.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.cultural_background
              ?.tags?.["国籍"]
          return <span className="text-sm text-gray-900">{nationality || "-"}</span>
        },
        enableColumnFilter: false,
      },
      {
        id: "religion",
        accessorFn: (row) =>
          row.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.cultural_background?.tags?.[
            "宗教信仰"
          ],
        header: () => <div className="font-semibold text-sm">宗教信仰</div>,
        cell: ({ row }) => {
          const religion =
            row.original.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.cultural_background
              ?.tags?.["宗教信仰"]
          return <span className="text-sm text-gray-900">{religion || "-"}</span>
        },
        enableColumnFilter: false,
      },
      {
        id: "occupation",
        accessorFn: (row) =>
          row.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.socioeconomic_status?.tags?.[
            "职业"
          ],
        header: () => <div className="font-semibold text-sm">职业</div>,
        cell: ({ row }) => {
          const occupation =
            row.original.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.socioeconomic_status
              ?.tags?.["职业"]
          return <span className="text-sm text-gray-900">{occupation || "-"}</span>
        },
        enableColumnFilter: false,
      },
      {
        id: "industry",
        accessorFn: (row) =>
          row.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.socioeconomic_status?.tags?.[
            "行业"
          ],
        header: () => <div className="font-semibold text-sm">行业</div>,
        cell: ({ row }) => {
          const industry =
            row.original.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.socioeconomic_status
              ?.tags?.["行业"]
          return <span className="text-sm text-gray-900">{industry || "-"}</span>
        },
        enableColumnFilter: false,
      },
      {
        id: "annual_income",
        accessorFn: (row) =>
          row.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.socioeconomic_status?.tags?.[
            "年收入"
          ],
        header: () => <div className="font-semibold text-sm">年收入</div>,
        cell: ({ row }) => {
          const income =
            row.original.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.socioeconomic_status
              ?.tags?.["年收入"]
          return (
            <span className="text-sm text-gray-900">
              {income !== undefined && income !== null && income !== "" && income !== "0" ? `${income}` : "-"}
            </span>
          )
        },
        enableColumnFilter: false,
      },
      {
        id: "monthly_income",
        accessorFn: (row) =>
          row.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.socioeconomic_status?.tags?.[
            "月收入"
          ],
        header: () => <div className="font-semibold text-sm">月收入</div>,
        cell: ({ row }) => {
          const income =
            row.original.interviewee?.content?.user_profile_tags?.demographics?.subcategories?.socioeconomic_status
              ?.tags?.["月收入"]
          return (
            <span className="text-sm text-gray-900">
              {income !== undefined && income !== null && income !== "" && income !== "0" ? `${income}` : "-"}
            </span>
          )
        },
        enableColumnFilter: false,
      },
      {
        id: "source",
        accessorFn: (row) => row.interviewee.source,
        header: () => <div className="font-semibold text-sm">类型</div>,
        cell: ({ row }) => {
          const source = row.original.interviewee.source
          return <span className="text-sm text-gray-900">{source === 0 ? "真人" : "模拟用户"}</span>
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
          return value.includes(row.original.interviewee.source.toString())
        },
      },
      {
        id: "state",
        accessorFn: (row) => row.response.state,
        header: () => <div className="font-semibold text-sm">状态</div>,
        cell: ({ row }) => {
          const state = row.original.response.state
          return <span className="text-sm text-gray-900">{getStatusConfig(state, true)?.label}</span>
        },
        enableColumnFilter: false,
      },
      {
        id: "created_at",
        accessorFn: (row) => row.response.created_at,
        header: () => <div className="font-semibold text-sm">访谈开始时间</div>,
        cell: ({ row }) => {
          return <span className="text-sm text-gray-900">{formatDate(row.original.response.created_at)}</span>
        },
        enableSorting: true,
      },
      {
        id: "questions",
        accessorFn: (row) =>
          row.response.details.answers.reduce((total: number, section: any) => total + section.questions.length, 0),
        header: () => <div className="font-semibold text-sm">问答数</div>,
        cell: ({ row }) => {
          const count =
            row.original.response?.details?.answers?.reduce(
              (total: number, section: any) => total + section.questions.length,
              0
            ) ?? 0

          return <span className="text-sm text-gray-900">{count}</span>
        },
        enableSorting: true,
      },
      {
        id: "duration",
        accessorFn: (row) => row.response.duration,
        header: () => <div className="font-semibold text-sm">访谈时长</div>,
        cell: ({ row }) => {
          const duration = row.original.response.duration
          return (
            <span className="text-sm text-gray-900">{duration != null ? formatDurationMinutes(duration) : "-"}</span>
          )
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
  )

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
  })

  if (loading) {
    return (
      <div className="bg-white rounded-b-lg shadow-sm flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">加载数据中...</p>
        </div>
      </div>
    )
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
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-b-lg shadow-sm flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">暂无数据</p>
          <p className="text-xs text-gray-500">当前访谈没有相关数据</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-b-lg shadow-sm">
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  )
}
