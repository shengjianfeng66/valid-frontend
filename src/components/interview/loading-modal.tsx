"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { useTranslations } from "next-intl";

interface LoadingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'start' | 'finish';
}

export function LoadingModal({ open, onOpenChange, type }: LoadingModalProps) {
    const t = useTranslations('interview');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-semibold">
                        {type === 'start' ? t('loading.title') : '正在结束访谈'}
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        {type === 'start'
                            ? t('loading.description')
                            : '正在生成访谈分析报告，请稍候...'}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-2">
                    <LoadingAnimation
                        width={250}
                        height={250}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

