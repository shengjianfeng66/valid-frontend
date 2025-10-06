"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import { ConfirmDialog } from "./confirm-dialog";
import { useTranslations } from "next-intl";

interface NavigationLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    hasDraft?: boolean;
    onLeave?: () => void;
}

export function NavigationLink({
    href,
    children,
    className,
    hasDraft = false,
    onLeave,
}: NavigationLinkProps) {
    const t = useTranslations();
    const [showConfirm, setShowConfirm] = React.useState(false);
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (hasDraft) {
            setShowConfirm(true);
        } else {
            router.push(href);
        }
    };

    const handleConfirm = () => {
        if (onLeave) {
            onLeave();
        }
        router.push(href);
    };

    return (
        <>
            <a href={href} onClick={handleClick} className={className}>
                {children}
            </a>
            <ConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                onConfirm={handleConfirm}
                title={t('confirmLeave.title')}
                description={t('confirmLeave.description')}
                confirmText={t('confirmLeave.confirmText')}
                cancelText={t('confirmLeave.cancelText')}
            />
        </>
    );
}
