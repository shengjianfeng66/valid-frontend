"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { InterviewCardList } from "@/components/blocks/interview-card-list"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
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

export default function InterviewPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2">
                    <div className="flex flex-1 items-center gap-2 px-3">
                        <SidebarTrigger />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                    </div>
                </header>
                <div className="flex flex-1 flex-col bg-gray-100 p-4 gap-4">
                    {/* 顶部 - 流程状态栏 */}
                    <div className="bg-white rounded-lg shadow-sm px-6 py-6">
                        <Stepper value={3} className="w-full">
                            <StepperNav className="flex justify-between items-center">
                                <StepperItem step={1} completed={3 > 1}>
                                    <StepperTrigger className="flex flex-col items-center gap-3">
                                        <StepperIndicator className="w-10 h-10 text-sm font-medium bg-[oklch(0.705_0.213_47.604)] text-white">
                                            <Check className="w-5 h-5" />
                                        </StepperIndicator>
                                        <div className="text-center">
                                            <StepperTitle className="text-sm font-medium text-[oklch(0.705_0.213_47.604)]">制定目标</StepperTitle>
                                            <StepperDescription className="text-xs text-gray-500 mt-1">了解你的产品和用户</StepperDescription>
                                        </div>
                                    </StepperTrigger>
                                    <StepperSeparator className="mx-4 flex-1 bg-[oklch(0.705_0.213_47.604)] h-0.5" />
                                </StepperItem>

                                <StepperItem step={2} completed={3 > 2}>
                                    <StepperTrigger className="flex flex-col items-center gap-3">
                                        <StepperIndicator className="w-10 h-10 text-sm font-medium bg-[oklch(0.705_0.213_47.604)] text-white">
                                            <Check className="w-5 h-5" />
                                        </StepperIndicator>
                                        <div className="text-center">
                                            <StepperTitle className="text-sm font-medium text-[oklch(0.705_0.213_47.604)]">访谈大纲</StepperTitle>
                                            <StepperDescription className="text-xs text-gray-500 mt-1">深度发掘用户需求</StepperDescription>
                                        </div>
                                    </StepperTrigger>
                                    <StepperSeparator className="mx-4 flex-1 bg-[oklch(0.705_0.213_47.604)] h-0.5" />
                                </StepperItem>

                                <StepperItem step={3} completed={3 > 3}>
                                    <StepperTrigger className="flex flex-col items-center gap-3">
                                        <StepperIndicator className="w-10 h-10 text-sm font-medium bg-gray-200 text-gray-700 border-2 border-dashed border-[oklch(0.705_0.213_47.604)]">
                                            3
                                        </StepperIndicator>
                                        <div className="text-center">
                                            <StepperTitle className="text-sm font-medium text-[oklch(0.705_0.213_47.604)]">寻找参与者</StepperTitle>
                                            <StepperDescription className="text-xs text-gray-500 mt-1">邀请真人和模拟用户访谈</StepperDescription>
                                        </div>
                                    </StepperTrigger>
                                </StepperItem>
                            </StepperNav>
                        </Stepper>
                    </div>

                    {/* 中间内容区 */}
                    <div className="bg-white rounded-lg shadow-sm flex-1 p-6">
                        <InterviewCardList />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}