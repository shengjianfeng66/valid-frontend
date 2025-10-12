"use client";

import {
    Stepper,
    StepperItem,
    StepperTrigger,
    StepperIndicator,
    StepperSeparator,
    StepperTitle,
    StepperDescription,
    StepperNav
} from "@/components/stepper";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

export function InterviewStepper() {
    const t = useTranslations('interview');

    return (
        <div className="bg-white rounded-lg shadow-sm px-6 py-6">
            <Stepper value={3} className="w-full">
                <StepperNav className="flex justify-between items-center">
                    <StepperItem step={1} completed={3 > 1}>
                        <StepperTrigger className="flex flex-col items-center gap-3">
                            <StepperIndicator className="w-10 h-10 text-sm font-medium bg-primary text-white">
                                <Check className="w-5 h-5" />
                            </StepperIndicator>
                            <div className="text-center">
                                <StepperTitle className="text-sm font-medium text-primary">{t('steps.step1.title')}</StepperTitle>
                                <StepperDescription className="text-xs text-gray-500 mt-1">{t('steps.step1.description')}</StepperDescription>
                            </div>
                        </StepperTrigger>
                        <StepperSeparator className="mx-4 flex-1 bg-primary h-0.5" />
                    </StepperItem>

                    <StepperItem step={2} completed={3 > 2}>
                        <StepperTrigger className="flex flex-col items-center gap-3">
                            <StepperIndicator className="w-10 h-10 text-sm font-medium bg-primary text-white">
                                <Check className="w-5 h-5" />
                            </StepperIndicator>
                            <div className="text-center">
                                <StepperTitle className="text-sm font-medium text-primary">{t('steps.step2.title')}</StepperTitle>
                                <StepperDescription className="text-xs text-gray-500 mt-1">{t('steps.step2.description')}</StepperDescription>
                            </div>
                        </StepperTrigger>
                        <StepperSeparator className="mx-4 flex-1 bg-primary h-0.5" />
                    </StepperItem>

                    <StepperItem step={3} completed={3 > 3}>
                        <StepperTrigger className="flex flex-col items-center gap-3">
                            <StepperIndicator className="w-10 h-10 text-sm font-medium bg-gray-200 text-gray-700 border-2 border-dashed border-primary">
                                3
                            </StepperIndicator>
                            <div className="text-center">
                                <StepperTitle className="text-sm font-medium text-primary">{t('steps.step3.title')}</StepperTitle>
                                <StepperDescription className="text-xs text-gray-500 mt-1">{t('steps.step3.description')}</StepperDescription>
                            </div>
                        </StepperTrigger>
                    </StepperItem>
                </StepperNav>
            </Stepper>
        </div>
    );
}

