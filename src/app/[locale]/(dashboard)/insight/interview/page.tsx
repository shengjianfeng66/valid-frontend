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
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserDetailSheet } from "@/components/user-detail-sheet";
import { toast } from "sonner";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { useTranslations } from "next-intl";

// API 数据类型定义
interface PersonaContent {
    [key: string]: string;
}

interface PersonaFromAPI {
    id: number;
    name: string;
    content: PersonaContent;
    source: number;
    created_at: string;
    updated_at: string | null;
}

interface PersonasResponse {
    personas: PersonaFromAPI[];
    total_count: number;
    requested_count: number;
}

// SWR fetcher 函数
const fetcher = async (url: string, count: number): Promise<PersonasResponse> => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            persona_count: count
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`获取到 ${data.total_count} 个人物画像`);

    return data;
}

// 将 API 返回的数据转换为组件需要的格式
function transformPersonaToUser(persona: PersonaFromAPI): any {
    const content = persona.content;

    return {
        id: `api-${persona.id}`,
        name: persona.name,
        avatar: "😊",
        attributes: content,
        source: persona.source,
        created_at: persona.created_at
    };
}

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

function UserCard({ user, onViewDetails, onRemoveUser }: { user: any; onViewDetails: (userId: string) => void; onRemoveUser: (userId: string) => void }) {
    const t = useTranslations('interview');
    const getStatusColor = (status: string) => {
        switch (status) {
            case "视频通话中":
            case "Video Calling":
                return "text-green-600 bg-green-50";
            case "准备中":
            case "Preparing":
                return "text-yellow-600 bg-yellow-50";
            case "已完成":
            case "Completed":
                return "text-blue-600 bg-blue-50";
            case "等待中":
            case "Waiting":
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onViewDetails(user.id)} className="justify-center cursor-pointer">
                                        {t('userCard.actions.viewDetails')}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onRemoveUser(user.id)} className="justify-center cursor-pointer">
                                        {t('userCard.actions.remove')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                            {t('userCard.realUserLabel')}
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
                    {t('userCard.chat')}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    {t('userCard.voice')}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm">
                    {t('userCard.video')}
                </button>
            </div>
        </div>
    );
}

export default function InterviewPage() {
    const t = useTranslations('interview');
    const realUsersRef = useRef<HTMLDivElement>(null);
    const simulatedUsersRef = useRef<HTMLDivElement>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showSimulatedUserPool, setShowSimulatedUserPool] = useState(false);
    const [showLoadingModal, setShowLoadingModal] = useState(false);
    const [showUserDetailSheet, setShowUserDetailSheet] = useState(false);
    const [showRemoveConfirmDialog, setShowRemoveConfirmDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [addedSimulatedUsers, setAddedSimulatedUsers] = useState<any[]>([]);
    const [removedUserIds, setRemovedUserIds] = useState<string[]>([]);

    // 使用 SWR 获取推荐用户
    const { data: personasData, error, isLoading: isLoadingRecommended } = useSWR(
        ['http://localhost:8000/api/v1/persona/recommend', 10],
        ([url, count]) => fetcher(url, count),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    // 转换推荐用户数据，并过滤掉已删除的
    const recommendedUsers = personasData?.personas
        ? personasData.personas.map(transformPersonaToUser).filter(user => !removedUserIds.includes(user.id))
        : [];

    // 处理错误
    useEffect(() => {
        if (error) {
            console.error('获取推荐用户失败:', error);
            toast.error('获取推荐用户失败', {
                description: '请检查后端服务是否正常运行'
            });
        }
    }, [error]);

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

    const realUsers = mockUsers.filter(user => user.isReal && false); // 临时设置为空来测试空状态
    // 使用推荐用户和添加的用户，过滤掉已删除的
    const simulatedUsers = [...recommendedUsers, ...addedSimulatedUsers.filter(user => !removedUserIds.includes(user.id))];

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

        toast.success(t('toast.addSimulatedUsersSuccess', { count: selectedUsers.length }), {
            description: t('toast.addSimulatedUsersDescription')
        });
        setShowSimulatedUserPool(false);
        setSelectedUsers([]);
    };

    // 处理用户菜单点击
    const handleViewDetails = (userId: string) => {
        const user = [...recommendedUsers, ...addedSimulatedUsers].find(u => u.id === userId);
        if (user) {
            setSelectedUser(user);
            setShowUserDetailSheet(true);
        }
    };

    const handleRemoveUser = (userId: string) => {
        const user = [...recommendedUsers, ...addedSimulatedUsers].find(u => u.id === userId);
        if (user) {
            setSelectedUser(user);
            setShowRemoveConfirmDialog(true);
        }
    };

    const confirmRemoveUser = () => {
        if (selectedUser) {
            // 将用户ID添加到已删除列表
            setRemovedUserIds(prev => [...prev, selectedUser.id]);
            toast.success(t('toast.removeUserSuccess'), {
                description: t('toast.removeUserDescription', { name: selectedUser.name })
            });
        }
        setShowRemoveConfirmDialog(false);
        setSelectedUser(null);
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



                    {/* 用户访谈区域 */}
                    <div className="bg-white rounded-lg shadow-sm">
                        {/* 顶部标题和开始访谈按钮 */}
                        <div className="px-6 py-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        {t('interview.title')}
                                    </h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                            {t('interview.status.pending')}
                                        </span>
                                        <span>{t('interview.info.createdTime')}: 2025.10.03 22:35</span>
                                        <span>{t('interview.info.expectedUsers')} 24人</span>
                                        <span>{t('interview.info.expectedCredits')} 2400</span>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
                                    onClick={() => setShowLoadingModal(true)}
                                >
                                    {t('interview.startInterview')}
                                </Button>
                            </div>
                        </div>

                        {/* 真人用户区域 */}
                        <div ref={realUsersRef} className="px-6 py-6">
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
                                        onClick={() => setShowInviteModal(true)}
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
                                            onViewDetails={handleViewDetails}
                                            onRemoveUser={handleRemoveUser}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {t('users.realUsers.emptyDescription')}
                                        <span
                                            className="underline cursor-pointer hover:text-primary text-primary"
                                            onClick={() => setShowInviteModal(true)}
                                        >
                                            {t('users.realUsers.inviteLink')}
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
                                        {t('users.simulatedUsers.title')} {simulatedUsers.length}
                                    </h3>
                                    <span className="text-sm text-gray-600">
                                        {t('users.simulatedUsers.description', { count: simulatedUsers.length })}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => setShowSimulatedUserPool(true)}
                                    variant="outline"
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    {t('users.simulatedUsers.addButton')}
                                </Button>
                            </div>

                            {isLoadingRecommended ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <LoadingAnimation width={150} height={150} />
                                    <p className="text-gray-600 mt-4">正在获取推荐用户...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {simulatedUsers.map((user) => (
                                        <UserCard
                                            key={user.id}
                                            user={user}
                                            onViewDetails={handleViewDetails}
                                            onRemoveUser={handleRemoveUser}
                                        />
                                    ))}
                                </div>
                            )}
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

                {/* 模拟用户池弹窗 */}
                <Dialog open={showSimulatedUserPool} onOpenChange={setShowSimulatedUserPool}>
                    <DialogContent className="max-w-6xl w-full max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold text-gray-900 mb-2">
                                {t('modals.simulatedUserPool.title')}
                            </DialogTitle>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 font-normal">
                                    {t('modals.simulatedUserPool.description')}
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
                                {t('modals.simulatedUserPool.cancel')}
                            </Button>
                            <Button
                                onClick={handleConfirmAdd}
                                disabled={selectedUsers.length === 0}
                                className="bg-primary hover:bg-primary/90 text-white px-6"
                            >
                                {t('modals.simulatedUserPool.confirmAdd', { count: selectedUsers.length })}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Loading Modal */}
                <Dialog open={showLoadingModal} onOpenChange={setShowLoadingModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-center text-xl font-semibold">
                                {t('loading.title')}
                            </DialogTitle>
                            <DialogDescription className="text-center text-gray-600">
                                {t('loading.description')}
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

                {/* 用户详情抽屉 */}
                <UserDetailSheet
                    open={showUserDetailSheet}
                    onOpenChange={setShowUserDetailSheet}
                    selectedUser={selectedUser}
                />

                {/* 移除用户确认弹窗 */}
                <Dialog open={showRemoveConfirmDialog} onOpenChange={setShowRemoveConfirmDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t('confirmDialog.removeUser.title')}</DialogTitle>
                            <DialogDescription>
                                {t('confirmDialog.removeUser.description', { name: selectedUser?.name })}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowRemoveConfirmDialog(false)}
                            >
                                {t('confirmDialog.removeUser.cancel')}
                            </Button>
                            <Button
                                onClick={confirmRemoveUser}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                {t('confirmDialog.removeUser.confirm')}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </SidebarInset>
        </SidebarProvider>
    );
}