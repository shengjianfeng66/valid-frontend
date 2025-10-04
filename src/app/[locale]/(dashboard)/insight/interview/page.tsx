"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar"
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
import { Check, Users, Bot, ArrowUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 模拟用户数据
const mockUsers = [
    {
        id: "1",
        name: "张雨晴",
        age: 28,
        location: "北京一线",
        avatar: "🤗",
        status: "视频通话中",
        tags: ["创意爱好", "上班族", "数码爱好者", "理想主义"],
        isReal: true
    },
    {
        id: "2",
        name: "李小红",
        age: 32,
        location: "上海一线",
        avatar: "😊",
        status: "视频通话中",
        tags: ["通勤族", "实用", "时间敏感", "精致生活"],
        isReal: true
    },
    {
        id: "3",
        name: "王大伟",
        age: 29,
        location: "广州一线",
        avatar: "😄",
        status: "准备中",
        tags: ["品质生活", "细致", "追求完美", "社交达人"],
        isReal: true
    },
    {
        id: "4",
        name: "陈美丽",
        age: 24,
        location: "深圳一线",
        avatar: "🤗",
        status: "已完成",
        tags: ["创意爱好", "上班族", "追求品质", "精致生活"],
        isReal: true
    },
    {
        id: "5",
        name: "刘强",
        age: 27,
        location: "杭州新一线",
        avatar: "😎",
        status: "等待中",
        tags: ["效率", "实用", "文艺青年", "追求品质"],
        isReal: true
    },
    {
        id: "6",
        name: "赵敏",
        age: 27,
        location: "南京新一线",
        avatar: "😊",
        status: "视频通话中",
        tags: ["品质生活", "细致", "文艺青年", "社交达人"],
        isReal: false
    },
    {
        id: "7",
        name: "孙小明",
        age: 25,
        location: "成都新一线",
        avatar: "🙂",
        status: "准备中",
        tags: ["游戏爱好者", "科技控", "夜猫子", "创新思维"],
        isReal: false
    },
    {
        id: "8",
        name: "周丽娜",
        age: 30,
        location: "武汉新一线",
        avatar: "😍",
        status: "已完成",
        tags: ["美食达人", "旅行爱好者", "摄影师", "生活记录者"],
        isReal: false
    },
    {
        id: "9",
        name: "吴建华",
        age: 35,
        location: "西安新一线",
        avatar: "🤓",
        status: "等待中",
        tags: ["历史爱好者", "读书人", "传统文化", "深度思考"],
        isReal: false
    },
    {
        id: "10",
        name: "郑小芳",
        age: 26,
        location: "青岛二线",
        avatar: "😋",
        status: "视频通话中",
        tags: ["健身达人", "营养师", "早起族", "正能量"],
        isReal: false
    }
];

function UserCard({ user }: { user: any }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "视频通话中":
                return "text-green-600 bg-green-50";
            case "准备中":
                return "text-yellow-600 bg-yellow-50";
            case "已完成":
                return "text-blue-600 bg-blue-50";
            case "等待中":
                return "text-gray-600 bg-gray-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                    {user.avatar}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        {user.isReal && (
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                                真实用户
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{user.age}岁 · 男</span>
                        <span>{user.location}</span>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                    {user.status}
                </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {user.tags.map((tag: string, index: number) => (
                    <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    聊天
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    语音
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors text-sm">
                    视频
                </button>
            </div>
        </div>
    );
}

export default function InterviewPage() {
    const realUsersRef = useRef<HTMLDivElement>(null);
    const simulatedUsersRef = useRef<HTMLDivElement>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const realUsers = mockUsers.filter(user => user.isReal);
    const simulatedUsers = mockUsers.filter(user => !user.isReal);

    const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 监听滚动显示回到顶部按钮
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

                    {/* 快捷导航按钮 */}
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex gap-4">
                            <Button
                                onClick={() => scrollToSection(realUsersRef)}
                                className="flex items-center gap-2 bg-[oklch(0.705_0.213_47.604)] hover:bg-[oklch(0.685_0.213_47.604)] text-white"
                            >
                                <Users className="w-4 h-4" />
                                真人用户 ({realUsers.length}人)
                            </Button>
                            <Button
                                onClick={() => scrollToSection(simulatedUsersRef)}
                                className="flex items-center gap-2 bg-[oklch(0.705_0.213_47.604)] hover:bg-[oklch(0.685_0.213_47.604)] text-white"
                            >
                                <Bot className="w-4 h-4" />
                                模拟用户 ({simulatedUsers.length}人)
                            </Button>
                        </div>
                    </div>

                    {/* 真人用户区域 */}
                    <div ref={realUsersRef} className="bg-white rounded-lg shadow-sm">
                        <CardHeader className="border-b border-gray-200 pt-8">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-[oklch(0.705_0.213_47.604)]" />
                                真人用户 ({realUsers.length}人)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {realUsers.map((user) => (
                                    <UserCard key={user.id} user={user} />
                                ))}
                            </div>
                        </CardContent>
                    </div>

                    {/* 模拟用户区域 */}
                    <div ref={simulatedUsersRef} className="bg-white rounded-lg shadow-sm">
                        <CardHeader className="border-b border-gray-200 pt-8">
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-[oklch(0.705_0.213_47.604)]" />
                                模拟用户 ({simulatedUsers.length}人)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {simulatedUsers.map((user) => (
                                    <UserCard key={user.id} user={user} />
                                ))}
                            </div>
                        </CardContent>
                    </div>

                    {/* 回到顶部按钮 */}
                    {showScrollTop && (
                        <Button
                            onClick={scrollToTop}
                            className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[oklch(0.705_0.213_47.604)] hover:bg-[oklch(0.685_0.213_47.604)] text-white shadow-lg z-50"
                        >
                            <ArrowUp className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}