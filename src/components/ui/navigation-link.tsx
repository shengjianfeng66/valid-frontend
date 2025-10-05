"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "./confirm-dialog";

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
                title="确认离开"
                description="离开页面将不会保存草稿"
                confirmText="确定离开"
                cancelText="取消"
            />
        </>
    );
}
