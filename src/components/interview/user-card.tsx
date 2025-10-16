"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { getStatusConfig } from "@/utils/interview";

interface UserCardProps {
    user: any;
    onViewDetails: (userId: string) => void;
    onRemoveUser: (userId: string) => void;
    canRemove?: boolean;
}

export function UserCard({ user, onViewDetails, onRemoveUser, canRemove = true }: UserCardProps) {
    const t = useTranslations('interview');

    // 模拟用户使用新的卡片样式
    if (!user.isReal) {
        const attributes = user.attributes || {};
        const attributeEntries = Object.entries(attributes);

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                {/* 用户基本信息 */}
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                        {user.avatar}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-base font-semibold text-gray-900">{user.name}</h3>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onViewDetails(user.id)} className="justify-center cursor-pointer">
                                        {t('userCard.actions.viewDetails')}
                                    </DropdownMenuItem>
                                    {canRemove && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onRemoveUser(user.id)} className="justify-center cursor-pointer">
                                                {t('userCard.actions.remove')}
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* 状态标签 */}
                        {getStatusConfig(user.status, true)?.label ? <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(user.status, true)?.color}`}>
                            <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                            {getStatusConfig(user.status, true)?.label}
                        </span> : null}
                    </div>
                </div>

                {/* 属性标签网格 - 一行三个 */}
                <div className="grid grid-cols-3 gap-2">
                    {attributeEntries.slice(0, 6).map(([key, value], index) => (
                        <div key={index} className="bg-gray-50 rounded-lg px-2 py-1.5 flex flex-col items-center">
                            <span className="text-xs text-gray-600">{key}</span>
                            <span className="text-xs font-medium text-gray-900">{String(value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
