"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
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
import { Check, Users, Bot, ArrowUp, Copy, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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
        attributes: {
            "性格": "ENTP",
            "国籍": "中国",
            "职业": "设计师",
            "月入": "15000",
            "教育": "本科",
            "婚恋": "未婚"
        },
        isReal: false
    },
    {
        id: "7",
        name: "孙小明",
        age: 25,
        location: "成都新一线",
        avatar: "🙂",
        status: "准备中",
        attributes: {
            "性格": "INTJ",
            "国籍": "中国",
            "职业": "程序员",
            "月入": "20000",
            "教育": "硕士",
            "婚恋": "已婚"
        },
        isReal: false
    },
    {
        id: "8",
        name: "周丽娜",
        age: 30,
        location: "武汉新一线",
        avatar: "😍",
        status: "已完成",
        attributes: {
            "性格": "ESFP",
            "国籍": "中国",
            "职业": "摄影师",
            "月入": "12000",
            "教育": "本科",
            "婚恋": "未婚"
        },
        isReal: false
    },
    {
        id: "9",
        name: "吴建华",
        age: 35,
        location: "西安新一线",
        avatar: "🤓",
        status: "等待中",
        attributes: {
            "性格": "ISTJ",
            "国籍": "中国",
            "职业": "教师",
            "月入": "8000",
            "教育": "博士",
            "婚恋": "已婚"
        },
        isReal: false
    },
    {
        id: "10",
        name: "郑小芳",
        age: 26,
        location: "青岛二线",
        avatar: "😋",
        status: "视频通话中",
        attributes: {
            "性格": "ENFJ",
            "国籍": "中国",
            "职业": "营养师",
            "月入": "10000",
            "教育": "本科",
            "婚恋": "未婚"
        },
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
                            <button className="text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">男 {user.age}岁 {user.location}</p>

                        {/* 状态标签 */}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                            {user.status}
                        </span>
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

    // 真实用户保持原有样式
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                    {user.avatar}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                            真实用户
                        </span>
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
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm">
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
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showSimulatedUserPool, setShowSimulatedUserPool] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [addedSimulatedUsers, setAddedSimulatedUsers] = useState<any[]>([]);

    // 邀请流程步骤数据
    const inviteSteps = [
        {
            title: "复制链接发送给真人用户",
            description: "将邀请链接分享给目标用户群体"
        },
        {
            title: "AI 用户研究员自动化完成用户访谈",
            description: "AI自动进行深度用户访谈，收集一手数据"
        },
        {
            title: "AI 用户研究员自动化完成数据清洗与分析",
            description: "AI自动处理数据，生成深度洞察报告"
        }
    ];

    const realUsers = mockUsers.filter(user => user.isReal && false); // 临时设置为空来测试空状态
    const originalSimulatedUsers = mockUsers.filter(user => !user.isReal);
    const simulatedUsers = [...originalSimulatedUsers, ...addedSimulatedUsers];

    // 模拟用户池数据
    const simulatedUserPool = Array.from({ length: 16 }, (_, index) => ({
        id: `pool-${index + 1}`,
        name: "夏宇轩",
        age: 24,
        location: "杭州新一线",
        avatar: "😊",
        status: "等待中", // 添加状态字段
        isReal: false, // 标记为模拟用户
        attributes: {
            "性格": "ENTP",
            "国籍": "巴西",
            "人种": "黄种人",
            "职业": "金融业",
            "月入": "42000",
            "教育": "本科毕业",
            "婚恋": "未婚",
            "子女": "无",
            "住房": "有房无贷"
        },
        hobbies: ["摄影", "烘焙", "瑜伽", "钓鱼", "阅读", "编程"]
    }));

    const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText('https://validflow.com/invite/real-users');
            toast.success("复制成功", {
                description: "邀请链接已复制到剪贴板",
            });
        } catch (err) {
            toast.error("复制失败", {
                description: "请手动复制链接",
            });
        }
    };

    const nextStep = () => {
        setCurrentStep((prev) => (prev + 1) % inviteSteps.length);
    };

    const prevStep = () => {
        setCurrentStep((prev) => (prev - 1 + inviteSteps.length) % inviteSteps.length);
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleConfirmAdd = () => {
        // 获取选中的用户数据
        const selectedUserData = simulatedUserPool.filter(user => selectedUsers.includes(user.id));

        // 将选中的用户添加到已添加列表中
        setAddedSimulatedUsers(prev => [...prev, ...selectedUserData]);

        toast.success(`已添加 ${selectedUsers.length} 个模拟用户`, {
            description: "模拟用户已成功添加到访谈列表中"
        });
        setShowSimulatedUserPool(false);
        setSelectedUsers([]);
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
                                        <StepperIndicator className="w-10 h-10 text-sm font-medium bg-primary text-white">
                                            <Check className="w-5 h-5" />
                                        </StepperIndicator>
                                        <div className="text-center">
                                            <StepperTitle className="text-sm font-medium text-primary">制定目标</StepperTitle>
                                            <StepperDescription className="text-xs text-gray-500 mt-1">了解你的产品和用户</StepperDescription>
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
                                            <StepperTitle className="text-sm font-medium text-primary">访谈大纲</StepperTitle>
                                            <StepperDescription className="text-xs text-gray-500 mt-1">深度发掘用户需求</StepperDescription>
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
                                            <StepperTitle className="text-sm font-medium text-primary">寻找参与者</StepperTitle>
                                            <StepperDescription className="text-xs text-gray-500 mt-1">邀请真人和模拟用户访谈</StepperDescription>
                                        </div>
                                    </StepperTrigger>
                                </StepperItem>
                            </StepperNav>
                        </Stepper>
                    </div>



                    {/* 用户访谈区域 */}
                    <div className="bg-white rounded-lg shadow-sm">
                        {/* 顶部标题和开始访谈按钮 */}
                        <div className="px-6 py-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        用户的梦境记录习惯和对 Dreamoo 的看法
                                    </h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                            待开始
                                        </span>
                                        <span>创建时间: 2025.10.03 22:35</span>
                                        <span>预计访谈人数 24人</span>
                                        <span>预计积分消耗 2400</span>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2">
                                    开始访谈
                                </Button>
                            </div>
                        </div>

                        {/* 真人用户区域 */}
                        <div ref={realUsersRef} className="px-6 py-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        真人用户 {realUsers.length}
                                    </h3>
                                    {realUsers.length === 0 && (
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                            限时免费
                                        </span>
                                    )}
                                </div>
                                {realUsers.length === 0 && (
                                    <Button
                                        onClick={() => setShowInviteModal(true)}
                                        variant="outline"
                                        className="text-gray-600 hover:text-gray-800"
                                    >
                                        +邀请真人用户
                                    </Button>
                                )}
                            </div>

                            {realUsers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {realUsers.map((user) => (
                                        <UserCard key={user.id} user={user} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Usight 自动化帮你访谈真人用户、回收一手数据、完成用户研究分析，
                                        <span
                                            className="underline cursor-pointer hover:text-primary text-primary"
                                            onClick={() => setShowInviteModal(true)}
                                        >
                                            快去邀请吧
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 分隔线 */}
                        <div className="border-t border-gray-200"></div>

                        {/* 模拟用户区域 */}
                        <div ref={simulatedUsersRef} className="px-6 py-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Bot className="w-5 h-5 text-primary" />
                                        模拟用户 {simulatedUsers.length}
                                    </h3>
                                    <span className="text-sm text-gray-600">
                                        已匹配 {simulatedUsers.length} 位目标用户，他们来自真人数据建模，可以达到真人 85% 的访谈效果
                                    </span>
                                </div>
                                <Button
                                    onClick={() => setShowSimulatedUserPool(true)}
                                    variant="outline"
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    +添加模拟用户
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {simulatedUsers.map((user) => (
                                    <UserCard key={user.id} user={user} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 回到顶部按钮 */}
                    {showScrollTop && (
                        <Button
                            onClick={scrollToTop}
                            className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg z-50"
                        >
                            <ArrowUp className="w-5 h-5" />
                        </Button>
                    )}
                </div>

                {/* 邀请真人用户弹窗 */}
                <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                    <DialogContent className="max-w-6xl w-full">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold text-gray-900">
                                邀请真人用户
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 text-base leading-relaxed">
                                复制链接发送给真人用户，AI 用户研究员自动化完成用户访谈，AI 用户研究员自动化完成数据清洗与分析
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
                                                    <span className="text-gray-500 text-lg">步骤 {index + 1} 图片</span>
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
                                    上一步
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
                                    下一步
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
                                复制链接
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* 模拟用户池弹窗 */}
                <Dialog open={showSimulatedUserPool} onOpenChange={setShowSimulatedUserPool}>
                    <DialogContent className="max-w-6xl w-full max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold text-gray-900 mb-2">
                                模拟用户池
                            </DialogTitle>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 font-normal">
                                    他们来自真人数据建模，可以达到真人85%的访谈效果
                                </span>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </DialogHeader>

                        {/* 用户池网格 */}
                        <div className="grid grid-cols-4 gap-4 py-6">
                            {simulatedUserPool.map((user) => (
                                <div
                                    key={user.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                                    onClick={() => toggleUserSelection(user.id)}
                                >
                                    {/* 选择指示器 */}
                                    <div className="absolute top-2 right-2">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedUsers.includes(user.id)
                                            ? 'bg-green-500 border-green-500'
                                            : 'bg-white border-gray-300'
                                            }`}>
                                            {selectedUsers.includes(user.id) && (
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>

                                    {/* 用户基本信息 */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                                            {user.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-base font-semibold text-gray-900">{user.name}</h3>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-2">男 {user.age}岁 {user.location}</p>
                                        </div>
                                    </div>

                                    {/* 属性标签网格 - 一行三个 */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(user.attributes).slice(0, 6).map(([key, value], index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg px-2 py-1.5 flex flex-col items-center">
                                                <span className="text-xs text-gray-600">{key}</span>
                                                <span className="text-xs font-medium text-gray-900">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 底部按钮 */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                onClick={() => setShowSimulatedUserPool(false)}
                                className="px-6"
                            >
                                取消
                            </Button>
                            <Button
                                onClick={handleConfirmAdd}
                                disabled={selectedUsers.length === 0}
                                className="bg-primary hover:bg-primary/90 text-white px-6"
                            >
                                确认添加 {selectedUsers.length}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </SidebarInset>
        </SidebarProvider>
    );
}