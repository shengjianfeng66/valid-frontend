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
    // 动态提取所有分类
    const getCategories = () => {
        const content = (selectedUser as any)?.rawContent;
        if (!content?.user_profile_tags) return [];

        return Object.keys(content.user_profile_tags).map(categoryKey => {
            const category = content.user_profile_tags[categoryKey];
            const tags: Array<{ key: string; value: string }> = [];

            // 提取该分类下的所有标签
            if (category.subcategories) {
                Object.keys(category.subcategories).forEach(subKey => {
                    const subcategory = category.subcategories[subKey];
                    if (subcategory?.tags) {
                        Object.entries(subcategory.tags).forEach(([key, value]) => {
                            tags.push({ key, value: String(value) });
                        });
                    }
                });
            }

            return {
                key: categoryKey,
                name: category.name || categoryKey,
                description: category.description,
                tags
            };
        });
    };

    const categories = getCategories();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[65vw] min-w-[800px] max-w-[95vw] overflow-y-auto">
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
                        {categories.length > 0 ? (
                            <Tabs defaultValue={categories[0]?.key} className="w-full">
                                <TabsList
                                    className="grid w-full"
                                    style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 5)}, minmax(0, 1fr))` }}
                                >
                                    {categories.map(category => (
                                        <TabsTrigger key={category.key} value={category.key}>
                                            {category.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {categories.map((category, catIndex) => {
                                    // 为不同的分类设置不同的颜色
                                    const colors = [
                                        { bg: 'bg-gray-100', text: 'text-gray-600', textDark: 'text-gray-900' },
                                        { bg: 'bg-blue-50', text: 'text-blue-600', textDark: 'text-blue-900' },
                                        { bg: 'bg-green-50', text: 'text-green-600', textDark: 'text-green-900' },
                                        { bg: 'bg-purple-50', text: 'text-purple-600', textDark: 'text-purple-900' },
                                        { bg: 'bg-orange-50', text: 'text-orange-600', textDark: 'text-orange-900' }
                                    ];
                                    const color = colors[catIndex % colors.length];

                                    return (
                                        <TabsContent key={category.key} value={category.key} className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                                                    {category.description && (
                                                        <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-500">{category.tags.length}</span>
                                            </div>
                                            {category.tags.length > 0 ? (
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                    {category.tags.map((tag, index) => (
                                                        <div
                                                            key={index}
                                                            className={`px-3 py-2 ${color.bg} rounded-lg`}
                                                        >
                                                            <div className={`text-xs ${color.text}`}>{tag.key}</div>
                                                            <div className={`text-sm font-medium ${color.textDark}`}>{tag.value}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <p className="text-sm">暂无{category.name}</p>
                                                </div>
                                            )}
                                        </TabsContent>
                                    );
                                })}
                            </Tabs>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-sm">暂无标签数据</p>
                            </div>
                        )}

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
