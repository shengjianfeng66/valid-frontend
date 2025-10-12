"use client";

import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { UserCard } from "./user-card";

interface RealUsersSectionProps {
    realUsers: any[];
    shouldUseRecommend: boolean;
    onInviteClick: () => void;
    onViewDetails: (userId: string) => void;
    onRemoveUser: (userId: string) => void;
}

export function RealUsersSection({
    realUsers,
    shouldUseRecommend,
    onInviteClick,
    onViewDetails,
    onRemoveUser
}: RealUsersSectionProps) {
    const t = useTranslations('interview');

    return (
        <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        {t('users.realUsers.title')} {realUsers.length}
                    </h3>
                    {realUsers.length === 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                            {t('users.realUsers.freeLabel')}
                        </span>
                    )}
                </div>
                {realUsers.length === 0 && (
                    <Button
                        onClick={onInviteClick}
                        variant="outline"
                        className="text-gray-600 hover:text-gray-800"
                    >
                        {t('users.realUsers.inviteButton')}
                    </Button>
                )}
            </div>

            {realUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {realUsers.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            onViewDetails={onViewDetails}
                            onRemoveUser={onRemoveUser}
                            canRemove={shouldUseRecommend}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {t('users.realUsers.emptyDescription')}
                        <span
                            className="underline cursor-pointer hover:text-primary text-primary"
                            onClick={onInviteClick}
                        >
                            {t('users.realUsers.inviteLink')}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}

