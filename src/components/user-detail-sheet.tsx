"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedUser: any;
}

export function UserDetailSheet({ open, onOpenChange, selectedUser }: UserDetailSheetProps) {
    // 模拟数据 - 基本标签
    const basicTags = [
        "李梦瑶", "女", "28岁", "身高165cm", "52kg", "新一线城市",
        "月薪8500", "互联网运营专员", "本科", "白领", "黄种人/亚洲人",
        "已婚", "无子女", "有(贷款购房)", "无车"
    ];

    // 模拟数据 - 性格喜好
    const personalityTags = [
        "ENFP-A(活动家)", "摄影", "烘焙", "瑜伽", "追剧",
        "阅读", "旅游", "美食探店", "宠物养护"
    ];

    // 模拟数据 - 业务属性
    const businessTags = [
        "种草达人型", "品质导向型", "冲动消费型", "社交影响型",
        "淘宝", "小红书商城", "京东", "美妆", "服装", "家居用品",
        "零食", "数码配件", "宠物用品", "周均下单3次", "周均浏览15次"
    ];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
                <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">
                            {selectedUser?.avatar}
                        </div>
                        <div>
                            <div className="text-lg font-semibold">{selectedUser?.name} 模拟用户</div>
                        </div>
                    </SheetTitle>
                    <SheetDescription className="text-sm text-gray-600">
                        查看用户详细信息和访谈状态
                    </SheetDescription>
                </SheetHeader>

                {selectedUser && (
                    <div className="space-y-6 px-4">
                        {/* 状态和调研时间卡片 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-1">状态</div>
                                <div className="text-lg font-semibold text-gray-900">
                                    {selectedUser.status === "视频通话中" ? "进行中" :
                                        selectedUser.status === "准备中" ? "未开始" :
                                            selectedUser.status === "已完成" ? "已完成" : "未开始"}
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-1">调研时间</div>
                                <div className="text-lg font-semibold text-gray-900">-</div>
                            </div>
                        </div>

                        {/* 标签页 */}
                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">基本标签</TabsTrigger>
                                <TabsTrigger value="personality">性格喜好</TabsTrigger>
                                <TabsTrigger value="business">业务属性</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">基本标签</h3>
                                    <span className="text-sm text-gray-500">{basicTags.length}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {basicTags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="personality" className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">性格喜好</h3>
                                    <span className="text-sm text-gray-500">{personalityTags.length}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {personalityTags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="business" className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">业务属性</h3>
                                    <span className="text-sm text-gray-500">{businessTags.length}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {businessTags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* 问答记录 */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">问答记录</h3>
                            <div className="text-center py-12 text-gray-500">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-sm">暂无问答记录</p>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
