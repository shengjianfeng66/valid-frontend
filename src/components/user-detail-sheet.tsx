"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

interface UserDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedUser: any;
}

export function UserDetailSheet({ open, onOpenChange, selectedUser }: UserDetailSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                            {selectedUser?.avatar}
                        </div>
                        {selectedUser?.name} 模拟用户
                    </SheetTitle>
                    <SheetDescription>
                        查看用户详细信息和访谈状态
                    </SheetDescription>
                </SheetHeader>

                {selectedUser && (
                    <div className="mt-6 space-y-6">
                        {/* 基本信息 */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">基本信息</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">姓名:</span>
                                    <span className="font-medium">{selectedUser.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">年龄:</span>
                                    <span className="font-medium">{selectedUser.age}岁</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">性别:</span>
                                    <span className="font-medium">男</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">地区:</span>
                                    <span className="font-medium">{selectedUser.location}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">状态:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedUser.status === "视频通话中" ? "text-green-600 bg-green-50" :
                                        selectedUser.status === "准备中" ? "text-blue-600 bg-blue-50" :
                                            selectedUser.status === "已完成" ? "text-gray-600 bg-gray-50" :
                                                "text-orange-600 bg-orange-50"
                                        }`}>
                                        {selectedUser.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 属性标签 */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">用户属性</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(selectedUser.attributes).map(([key, value], index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg px-3 py-2">
                                        <div className="text-xs text-gray-600">{key}</div>
                                        <div className="text-sm font-medium">{String(value)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 访谈记录 */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">访谈记录</h3>
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p>暂无访谈记录</p>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
