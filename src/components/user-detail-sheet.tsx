"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRunningElapsed } from "@/hooks/useRunningElapsed"
import { formatDurationMinutes, getStatusConfig } from "@/utils/interview"

interface UserDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUser: any
}

export function UserDetailSheet({ open, onOpenChange, selectedUser }: UserDetailSheetProps) {
  const runningElapsed = useRunningElapsed(selectedUser?.created_at, selectedUser?.status === 1, 1000)
  // 动态提取所有分类
  const getCategories = () => {
    const content = (selectedUser as any)?.rawContent
    if (!content?.user_profile_tags) return []

    return Object.keys(content.user_profile_tags).map((categoryKey) => {
      const category = content.user_profile_tags[categoryKey]
      const tags: Array<{ key: string; value: string }> = []

      // 提取该分类下的所有标签
      if (category.subcategories) {
        Object.keys(category.subcategories).forEach((subKey) => {
          const subcategory = category.subcategories[subKey]
          if (subcategory?.tags) {
            Object.entries(subcategory.tags).forEach(([key, value]) => {
              tags.push({ key, value: String(value) })
            })
          }
        })
      }

      return {
        key: categoryKey,
        name: category.name || categoryKey,
        description: category.description,
        tags,
      }
    })
  }

  const categories = getCategories()
  const hasInterview = selectedUser?.hasInterviewData

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[65vw] min-w-[800px] max-w-[95vw] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-3 text-xl">
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedUser?.avatar} alt={selectedUser?.name} />
              <AvatarFallback className="text-xl">{selectedUser?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-semibold">{selectedUser?.name} 模拟用户</div>
            </div>
          </SheetTitle>
          <SheetDescription className="text-sm text-gray-600">查看用户详细信息和访谈状态</SheetDescription>
        </SheetHeader>

        {selectedUser && (
          <div className="space-y-6 px-4">
            {/* 状态和调研时间卡片 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">状态</div>
                <div className="text-lg font-semibold text-gray-900">
                  {getStatusConfig(selectedUser.status, true)?.label || "-"}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">调研时间</div>
                <div className="text-lg font-semibold text-gray-900">
                  {selectedUser.status === 2 && formatDurationMinutes(selectedUser.duration)}
                  {selectedUser.status === 1 && (runningElapsed || "0分0秒")}
                  {selectedUser.status !== 1 && selectedUser.status !== 2 && "-"}
                </div>
              </div>
            </div>

            {/* 标签页：用户画像 vs 问答记录 */}
            <Tabs defaultValue={hasInterview ? "interview" : "profile"} className="w-full">
              <TabsList className={`grid w-full ${hasInterview ? "grid-cols-2" : "grid-cols-1"}`}>
                <TabsTrigger value="profile">用户画像</TabsTrigger>
                {hasInterview && <TabsTrigger value="interview">问答记录</TabsTrigger>}
              </TabsList>

              {/* 用户画像 Tab - 使用 Accordion 整合所有分类 */}
              <TabsContent value="profile" className="mt-4">
                <ScrollArea className="h-[calc(100vh-350px)] pr-4">
                  {categories.length > 0 ? (
                    <Accordion type="multiple" defaultValue={categories.map((c) => c.key)} className="w-full">
                      {categories.map((category, catIndex) => {
                        // 为不同的分类设置不同的颜色
                        const colors = [
                          { bg: "bg-gray-100", text: "text-gray-600", textDark: "text-gray-900" },
                          { bg: "bg-blue-50", text: "text-blue-600", textDark: "text-blue-900" },
                          { bg: "bg-green-50", text: "text-green-600", textDark: "text-green-900" },
                          { bg: "bg-purple-50", text: "text-purple-600", textDark: "text-purple-900" },
                          { bg: "bg-orange-50", text: "text-orange-600", textDark: "text-orange-900" },
                        ]
                        const color = colors[catIndex % colors.length]

                        return (
                          <AccordionItem key={category.key} value={category.key}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex flex-col items-start">
                                  <span className="text-base font-semibold text-gray-900">{category.name}</span>
                                  {category.description && (
                                    <span className="text-xs text-gray-500 mt-0.5">{category.description}</span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {category.tags.length} 个
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              {category.tags.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
                                  {category.tags.map((tag, index) => (
                                    <div key={index} className={`px-3 py-2 ${color.bg} rounded-lg`}>
                                      <div className={`text-xs ${color.text}`}>{tag.key}</div>
                                      <div className={`text-sm font-medium ${color.textDark}`}>{tag.value}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  <p className="text-sm">暂无标签</p>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        )
                      })}
                    </Accordion>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-sm">暂无标签数据</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* 问答记录 Tab */}
              {hasInterview && selectedUser?.responseDetails?.answers && (
                <TabsContent value="interview" className="mt-4">
                  <ScrollArea className="h-[calc(100vh-350px)] pr-4">
                    {selectedUser.responseDetails.answers.map((section: any, sectionIndex: number) => (
                      <div key={sectionIndex} className="mb-6 last:mb-0">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-8 w-1 bg-primary rounded-full" />
                          <h4 className="text-base font-semibold text-gray-900">{section.section_name}</h4>
                        </div>

                        {section.questions.map((question: any, qIndex: number) => (
                          <div key={qIndex} className="ml-4 mb-5 last:mb-0">
                            {/* 主要问题 */}
                            <div className="mb-3">
                              <div className="flex items-start gap-2 mb-2">
                                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                                  Q
                                </span>
                                <p className="text-sm font-medium text-gray-900 flex-1">{question.main}</p>
                              </div>
                              <div className="flex items-start gap-2 ml-8">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium">
                                  A
                                </span>
                                <p className="text-sm text-gray-700 flex-1 leading-relaxed">{question.answer}</p>
                              </div>
                            </div>

                            {/* 追问 */}
                            {question.probes && question.probes.length > 0 && (
                              <div className="ml-8 space-y-2 border-l-2 border-gray-200 pl-4">
                                {question.probes.map((probe: any, pIndex: number) => (
                                  <div key={pIndex}>
                                    <div className="flex items-start gap-2 mb-1">
                                      <span className="flex-shrink-0 w-5 h-5 bg-primary/5 text-primary rounded-full flex items-center justify-center text-xs">
                                        {pIndex + 1}
                                      </span>
                                      <p className="text-xs font-medium text-gray-600 flex-1">{probe.probe}</p>
                                    </div>
                                    <p className="text-xs text-gray-600 ml-7 leading-relaxed">{probe.answer}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* 推理说明 */}
                        {section.reasoning && (
                          <div className="ml-4 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-800">
                              <span className="font-semibold">💡 推理：</span>
                              {section.reasoning}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* 总结 */}
                    {selectedUser.responseDetails.closing?.summary && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                        <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          访谈总结
                        </h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {selectedUser.responseDetails.closing.summary}
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
