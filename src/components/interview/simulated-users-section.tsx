"use client";

import { Button } from "@/components/ui/button";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Bot } from "lucide-react";
import { useTranslations } from "next-intl";
import { UserCard } from "./user-card";

interface SimulatedUsersSectionProps {
    simulatedUsers: any[];
    isLoadingUsers: boolean;
    shouldUseRecommend: boolean;
    responsesTotal?: number;
    onAddClick: () => void;
    onViewDetails: (userId: string) => void;
    onRemoveUser: (userId: string) => void;
}

export function SimulatedUsersSection({
    simulatedUsers,
    isLoadingUsers,
    shouldUseRecommend,
    responsesTotal,
    onAddClick,
    onViewDetails,
    onRemoveUser
}: SimulatedUsersSectionProps) {
    const t = useTranslations('interview');

    return (
        <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary" />
                        {t('users.simulatedUsers.title')} {simulatedUsers.length}
                        {!shouldUseRecommend && responsesTotal && (
                            <span className="text-sm text-gray-500 font-normal">
                                / {responsesTotal} 个
                            </span>
                        )}
                    </h3>
                    <span className="text-sm text-gray-600">
                        {shouldUseRecommend
                            ? t('users.simulatedUsers.description', { count: simulatedUsers.length })
                            : ''
                        }
                    </span>
                </div>
                {/* 只在未开始状态显示添加按钮 */}
                {shouldUseRecommend && (
                    <Button
                        onClick={onAddClick}
                        variant="outline"
                        className="text-gray-600 hover:text-gray-800"
                    >
                        {t('users.simulatedUsers.addButton')}
                    </Button>
                )}
            </div>

            {isLoadingUsers && simulatedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <LoadingAnimation width={150} height={150} />
                    <p className="text-gray-600 mt-4">
                        {shouldUseRecommend ? '正在获取推荐用户...' : '正在获取已访谈用户...'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {simulatedUsers.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            onViewDetails={onViewDetails}
                            onRemoveUser={onRemoveUser}
                            canRemove={shouldUseRecommend}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

