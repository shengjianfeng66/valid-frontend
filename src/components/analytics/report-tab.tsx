"use client";

import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import MdPreview from "./md-preview";
import mockMarkdown from "./md-preview/content.js";
import ArticleNav from "./md-preview/ArticleNav";

interface Report {
    type: number; // 0: 真人用户报告, 1: 模拟用户报告
    report: string; // markdown 格式的报告内容
}

interface ReportTabProps {
    isLoading: boolean;
    error: any;
    reports: Report[];
}

export function ReportTab({ isLoading, error, reports }: ReportTabProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-b-lg shadow-sm flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-gray-500">加载报告中...</p>
                </div>
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="bg-white rounded-b-lg shadow-sm flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="text-base font-medium text-gray-900">暂无分析报告</p>
                    <p className="text-sm text-gray-500">报告生成中，请稍后查看</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-b-lg shadow-sm flex flex-col h-full">
            {/* 嵌套 Tab - 报告类型 */}
            <Tabs defaultValue="simulated" className="flex flex-col h-full">
                <div className="px-6 pt-4 border-b">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger
                            value="simulated"
                            className="data-[state=active]:bg-primary data-[state=active]:text-white"
                            disabled={!reports.some(r => r.type === 1)}
                        >
                            模拟用户报告
                        </TabsTrigger>
                        <TabsTrigger
                            value="real"
                            className="data-[state=active]:bg-primary data-[state=active]:text-white"
                            disabled={!reports.some(r => r.type === 0)}
                        >
                            真人用户报告
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* 模拟用户报告 */}
                <TabsContent value="simulated" className="flex-1 overflow-y-auto scrollbar-hide">
                    {reports.find(r => r.type === 1) ? (
                        <div className="flex gap-6 px-6 py-6">
                            {/* 左侧目录导航 */}
                            <aside className="hidden lg:block w-64 shrink-0">
                                <div className="sticky top-6">
                                    <div className="text-sm font-semibold mb-4 text-gray-900 pb-2 border-b border-gray-200">目录</div>
                                    <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 
                                                    [&::-webkit-scrollbar]:w-1.5
                                                    [&::-webkit-scrollbar-track]:bg-transparent
                                                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                                                    [&::-webkit-scrollbar-thumb]:rounded-full
                                                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                                        <ArticleNav />
                                    </div>
                                </div>
                            </aside>
                            {/* 主内容区 */}
                            <div className="flex-1 min-w-0 prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:text-gray-700">
                                {/* <ReactMarkdown>{reports.find(r => r.type === 1)!.report}</ReactMarkdown> */}
                                <MdPreview
                                    // content={mockMarkdown}
                                    content={reports.find(r => r.type === 1)?.report || ""}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-600">暂无模拟用户报告</p>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* 真人用户报告 */}
                <TabsContent value="real" className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                    {reports.find(r => r.type === 0) ? (
                        <div className="flex gap-6 px-6 py-6">
                            {/* 左侧目录导航 */}
                            <aside className="hidden lg:block w-64 shrink-0">
                                <div className="sticky top-6">
                                    <div className="text-sm font-semibold mb-4 text-gray-900 pb-2 border-b border-gray-200">目录</div>
                                    <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 
                                                    [&::-webkit-scrollbar]:w-1.5
                                                    [&::-webkit-scrollbar-track]:bg-transparent
                                                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                                                    [&::-webkit-scrollbar-thumb]:rounded-full
                                                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                                        <ArticleNav />
                                    </div>
                                </div>
                            </aside>
                            {/* 主内容区 */}
                            <div className="flex-1 min-w-0 prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:text-gray-700">
                                {/* <ReactMarkdown>{reports.find(r => r.type === 1)!.report}</ReactMarkdown> */}
                                <MdPreview
                                    // content={mockMarkdown}
                                    content={reports.find(r => r.type === 0)?.report || ""}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-600">暂无真人用户报告</p>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

