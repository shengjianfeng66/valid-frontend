"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

interface InviteRealUsersModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InviteRealUsersModal({ open, onOpenChange }: InviteRealUsersModalProps) {
    const t = useTranslations('interview');
    const [currentStep, setCurrentStep] = useState(0);

    // 邀请流程步骤数据
    const inviteSteps = [
        {
            title: t('modals.inviteRealUsers.steps.step1.title'),
            description: t('modals.inviteRealUsers.steps.step1.description')
        },
        {
            title: t('modals.inviteRealUsers.steps.step2.title'),
            description: t('modals.inviteRealUsers.steps.step2.description')
        },
        {
            title: t('modals.inviteRealUsers.steps.step3.title'),
            description: t('modals.inviteRealUsers.steps.step3.description')
        }
    ];

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText('https://validflow.com/invite/real-users');
            toast.success(t('toast.copySuccess'), {
                description: t('toast.copySuccessDescription'),
            });
        } catch (err) {
            toast.error(t('toast.copyFailed'), {
                description: t('toast.copyFailedDescription'),
            });
        }
    };

    const nextStep = () => {
        setCurrentStep((prev) => (prev + 1) % inviteSteps.length);
    };

    const prevStep = () => {
        setCurrentStep((prev) => (prev - 1 + inviteSteps.length) % inviteSteps.length);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-full">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                        {t('modals.inviteRealUsers.title')}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-base leading-relaxed">
                        {t('modals.inviteRealUsers.description')}
                    </DialogDescription>
                </DialogHeader>

                {/* 轮播图区域 */}
                <div className="relative py-8">
                    <div className="relative overflow-hidden rounded-lg">
                        <div className="flex transition-transform duration-300 ease-in-out"
                            style={{ transform: `translateX(-${currentStep * 100}%)` }}>
                            {inviteSteps.map((step, index) => (
                                <div key={index} className="w-full flex-shrink-0">
                                    <div className="text-center">
                                        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
                                            <span className="text-gray-500 text-lg">{t('modals.inviteRealUsers.stepImage', { number: index + 1 })}</span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                                        <p className="text-gray-600 text-base leading-relaxed max-w-md mx-auto">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 轮播控制按钮 */}
                    <div className="flex items-center justify-between mt-6">
                        <Button
                            onClick={prevStep}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            {t('modals.inviteRealUsers.previous')}
                        </Button>

                        {/* 指示器 */}
                        <div className="flex gap-2">
                            {inviteSteps.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentStep(index)}
                                    className={`w-3 h-3 rounded-full transition-colors ${index === currentStep
                                        ? 'bg-primary'
                                        : 'bg-gray-300'
                                        }`}
                                />
                            ))}
                        </div>

                        <Button
                            onClick={nextStep}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            {t('modals.inviteRealUsers.next')}
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex justify-center pt-6">
                    <Button
                        onClick={handleCopyLink}
                        className="bg-primary hover:bg-primary/90 text-white px-12 py-3 rounded-lg flex items-center gap-2 text-lg"
                    >
                        <Copy className="w-5 h-5" />
                        {t('modals.inviteRealUsers.copyLink')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

