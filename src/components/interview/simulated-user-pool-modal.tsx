"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Bot, Check, Eye } from "lucide-react";
import { useTranslations } from "next-intl";

interface SimulatedUserPoolModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedUsers: string[];
    simulatedUserPoolData: any[];
    isLoadingUserPool: boolean;
    onToggleUserSelection: (userId: string) => void;
    onViewDetails: (userId: string) => void;
    onConfirmAdd: () => void;
}

export function SimulatedUserPoolModal({
    open,
    onOpenChange,
    selectedUsers,
    simulatedUserPoolData,
    isLoadingUserPool,
    onToggleUserSelection,
    onViewDetails,
    onConfirmAdd
}: SimulatedUserPoolModalProps) {
    const t = useTranslations('interview');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-full max-h-[85vh] flex flex-col p-0">
                {/* 顶部 - 固定 */}
                <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-2xl font-semibold text-gray-900 mb-2">
                        {t('modals.simulatedUserPool.title')}
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-normal">
                            {t('modals.simulatedUserPool.description')}
                        </span>
                        {selectedUsers.length > 0 && (
                            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                已选择 {selectedUsers.length} 人
                            </span>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </DialogHeader>

                {/* 用户池网格 - 可滚动 */}
                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                    {isLoadingUserPool ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <LoadingAnimation width={150} height={150} />
                            <p className="text-gray-600 mt-4">正在加载模拟用户池...</p>
                        </div>
                    ) : simulatedUserPoolData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {simulatedUserPoolData.map((user) => (
                                <div
                                    key={user.id}
                                    className={`relative cursor-pointer transition-all ${selectedUsers.includes(user.id)
                                        ? 'ring-2 ring-primary bg-primary/5'
                                        : 'hover:shadow-lg'
                                        }`}
                                >
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                        {/* 查看详情按钮 - 右上角 */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(user.id);
                                            }}
                                            className="absolute top-3 right-3 p-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors shadow-sm border border-gray-200 z-10"
                                            title="查看详情"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {/* 选择指示器 */}
                                        <div
                                            className="flex items-start gap-3 mb-4"
                                            onClick={() => onToggleUserSelection(user.id)}
                                        >
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedUsers.includes(user.id)
                                                ? 'bg-primary border-primary'
                                                : 'border-gray-300'
                                                }`}>
                                                {selectedUsers.includes(user.id) && (
                                                    <Check className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarImage src={user.avatar} alt={user.name} />
                                                        <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <h3 className="text-sm font-semibold text-gray-900 pr-8">{user.name}</h3>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 属性标签网格 */}
                                        <div onClick={() => onToggleUserSelection(user.id)}>
                                            {user.attributes && Object.keys(user.attributes).length > 0 && (
                                                <div className="grid grid-cols-3 gap-2">
                                                    {Object.entries(user.attributes).slice(0, 6).map(([key, value], index) => (
                                                        <div key={index} className="bg-gray-50 rounded-lg px-2 py-1.5 flex flex-col items-center">
                                                            <span className="text-xs text-gray-600 truncate w-full text-center">{key}</span>
                                                            <span className="text-xs font-medium text-gray-900 truncate w-full text-center">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <Bot className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 mb-2">暂无可用的模拟用户</p>
                            <p className="text-sm text-gray-500">请稍后再试</p>
                        </div>
                    )}
                </div>

                {/* 底部按钮 - 固定 */}
                <div className="flex-shrink-0 flex justify-center items-center gap-3 px-6 py-4 border-t bg-gray-50/50">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="px-6"
                    >
                        {t('modals.simulatedUserPool.cancel')}
                    </Button>
                    {selectedUsers.length > 0 && (
                        <Button
                            onClick={onConfirmAdd}
                            className="bg-primary hover:bg-primary/90 text-white px-6"
                        >
                            确认添加 ({selectedUsers.length})
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

