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
import { Check, Users, Bot, ArrowUp, Copy, X, ChevronLeft, ChevronRight, Eye, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { useRouter } from "@/i18n/navigation";
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
    meta?: any;
    user_profile_tags?: {
        [categoryKey: string]: {
            name: string;
            description?: string;
            subcategories?: {
                [subKey: string]: {
                    name: string;
                    tags: {
                        [tagKey: string]: string;
                    }
                }
            }
        }
    };
    [key: string]: any;
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
    const attributes: Record<string, string> = {};

    // 提取所有标签 - 添加 null 检查
    if (content && content.user_profile_tags) {
        Object.keys(content.user_profile_tags).forEach(categoryKey => {
            const category = content.user_profile_tags![categoryKey];

            // 遍历子分类
            if (category && category.subcategories) {
                Object.keys(category.subcategories).forEach(subKey => {
                    const subcategory = category.subcategories![subKey];

                    // 提取所有tags
                    if (subcategory && subcategory.tags) {
                        Object.keys(subcategory.tags).forEach(tagKey => {
                            attributes[tagKey] = subcategory.tags[tagKey];
                        });
                    }
                });
            }
        });
    }

    return {
        id: `api-${persona.id}`,
        name: persona.name || '未命名用户',
        avatar: "😊",
        status: "等待中",
        isReal: false,
        attributes: attributes,
        rawContent: content, // 保存原始 content 供详情页使用
        source: persona.source,
        created_at: persona.created_at
    };
}


function UserCard({ user, onViewDetails, onRemoveUser, canRemove = true }: { user: any; onViewDetails: (userId: string) => void; onRemoveUser: (userId: string) => void; canRemove?: boolean }) {
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
                                    {canRemove && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onRemoveUser(user.id)} className="justify-center cursor-pointer">
                                                {t('userCard.actions.remove')}
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

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
    const searchParams = useSearchParams();
    const router = useRouter();
    const interviewId = searchParams.get('id');

    const realUsersRef = useRef<HTMLDivElement>(null);
    const simulatedUsersRef = useRef<HTMLDivElement>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showSimulatedUserPool, setShowSimulatedUserPool] = useState(false);
    const [showLoadingModal, setShowLoadingModal] = useState(false);
    const [loadingModalType, setLoadingModalType] = useState<'start' | 'finish'>('start');
    const [showUserDetailSheet, setShowUserDetailSheet] = useState(false);
    const [showRemoveConfirmDialog, setShowRemoveConfirmDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [addedSimulatedUsers, setAddedSimulatedUsers] = useState<any[]>([]);
    const [removedUserIds, setRemovedUserIds] = useState<string[]>([]);
    const [simulatedUserPoolData, setSimulatedUserPoolData] = useState<any[]>([]);
    const [isLoadingUserPool, setIsLoadingUserPool] = useState(false);
    const [currentResponsePage, setCurrentResponsePage] = useState(1);
    const [hasMoreResponses, setHasMoreResponses] = useState(true);
    const [allInterviewedUsers, setAllInterviewedUsers] = useState<any[]>([]);

    // 使用 SWR 获取访谈详情
    const { data: interviewData, error: interviewError, isLoading: isLoadingInterview, mutate: mutateInterview } = useSWR(
        interviewId ? `http://localhost:8000/api/v1/interview/get/${interviewId}` : null,
        async (url: string) => {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📝 获取到访谈详情:', data);
            return data;
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    // 从访谈详情中获取推荐人数
    const recommendedCount = interviewData?.participants?.recommended_total || 0;
    const interviewState = interviewData?.state;

    // 根据访谈状态决定调用哪个接口
    // state === 0: 调用推荐接口
    // state !== 0: 调用 originalsound 接口获取已访谈的模拟用户
    const shouldUseRecommend = interviewState === 0;

    // 使用 SWR 获取推荐用户 - 只在 state === 0 时调用
    const { data: personasData, error: recommendError, isLoading: isLoadingRecommended } = useSWR(
        interviewData && shouldUseRecommend ? ['http://localhost:8000/api/v1/persona/recommend', recommendedCount] : null,
        ([url, count]) => fetcher(url, count),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    // 使用 SWR 获取已访谈的模拟用户 - 只在 state !== 0 时调用，支持分页
    const { data: responsesData, error: responsesError, isLoading: isLoadingResponses } = useSWR(
        interviewData && !shouldUseRecommend && hasMoreResponses
            ? `http://localhost:8000/api/v1/interview/get_responses_and_interviewees?interview_id=${interviewData.id}&page=${currentResponsePage}&page_size=20`
            : null,
        async (url: string) => {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('📝 获取已访谈用户数据:', data);
            return data;
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    // 转换推荐用户数据，并过滤掉已删除的
    const recommendedUsers = personasData?.personas
        ? personasData.personas.map(transformPersonaToUser).filter(user => !removedUserIds.includes(user.id))
        : [];

    // 根据状态选择显示的用户列表
    const displayedUsers = shouldUseRecommend ? recommendedUsers : allInterviewedUsers;

    // 监听数据加载
    useEffect(() => {
        if (personasData && shouldUseRecommend) {
            console.log('👥 推荐用户数据已加载:', {
                请求数量: recommendedCount,
                实际返回: personasData.total_count,
                用户列表长度: recommendedUsers.length
            });
        }
    }, [personasData, recommendedCount, recommendedUsers.length, shouldUseRecommend]);

    // 处理分页数据加载
    useEffect(() => {
        if (responsesData && !shouldUseRecommend && responsesData.success) {
            console.log('👥 已访谈用户数据已加载:', {
                当前页: responsesData.page,
                总数: responsesData.total,
                返回数量: responsesData.items?.length,
                已加载总数: allInterviewedUsers.length + (responsesData.items?.length || 0)
            });

            // 转换新数据
            const newUsers = responsesData.items
                .filter((item: any) => item.interviewee.source === 1)
                .map((item: any) => {
                    const content = item.interviewee.content;
                    const attributes: Record<string, string> = {};

                    // 从 user_profile_tags 中提取所有标签
                    if (content && content.user_profile_tags) {
                        Object.keys(content.user_profile_tags).forEach(categoryKey => {
                            const category = content.user_profile_tags[categoryKey];

                            if (category && category.subcategories) {
                                Object.keys(category.subcategories).forEach(subKey => {
                                    const subcategory = category.subcategories[subKey];

                                    if (subcategory && subcategory.tags) {
                                        Object.keys(subcategory.tags).forEach(tagKey => {
                                            attributes[tagKey] = subcategory.tags[tagKey];
                                        });
                                    }
                                });
                            }
                        });
                    }

                    return {
                        id: `response-${item.response.id}`,
                        name: item.interviewee.name,
                        avatar: "😊",
                        status: item.response.state === 2 ? "已完成" : "进行中",
                        isReal: false,
                        attributes: attributes,
                        rawContent: content,
                        source: item.interviewee.source,
                        created_at: item.response.created_at,
                        responseId: item.response.id,
                        intervieweeId: item.interviewee.id,
                        responseDetails: item.response.details,
                        hasInterviewData: true
                    };
                });

            // 追加新数据（去重）
            setAllInterviewedUsers(prev => {
                const existingIds = new Set(prev.map(u => u.id));
                const uniqueNewUsers = newUsers.filter((u: any) => !existingIds.has(u.id));
                return [...prev, ...uniqueNewUsers];
            });

            // 检查是否还有更多数据
            const loadedCount = allInterviewedUsers.length + newUsers.length;
            setHasMoreResponses(loadedCount < responsesData.total);
        }
    }, [responsesData, shouldUseRecommend]);

    // 重置分页状态（当访谈状态改变时）
    useEffect(() => {
        if (!shouldUseRecommend) {
            console.log('🔄 访谈状态切换，重置分页数据');
            setAllInterviewedUsers([]);
            setCurrentResponsePage(1);
            setHasMoreResponses(true);
        }
    }, [shouldUseRecommend, interviewData?.id]);

    // 当状态从推荐模式切换到已访谈模式时，关闭加载弹窗
    useEffect(() => {
        if (!shouldUseRecommend && allInterviewedUsers.length > 0) {
            // 有数据了，关闭加载弹窗
            setShowLoadingModal(false);
        }
    }, [shouldUseRecommend, allInterviewedUsers.length]);

    // 处理错误
    const error = recommendError || responsesError;
    useEffect(() => {
        if (error) {
            console.error('获取用户数据失败:', error);
            toast.error('获取用户数据失败', {
                description: '请检查后端服务是否正常运行'
            });
        }
    }, [error]);

    // 处理访谈详情错误
    useEffect(() => {
        if (interviewError) {
            console.error('❌ 获取访谈详情失败:', interviewError);
            toast.error('获取访谈详情失败', {
                description: '请检查后端服务是否正常运行'
            });
        }
    }, [interviewError]);

    // 监听访谈数据变化
    useEffect(() => {
        if (interviewData) {
            console.log('✅ 访谈数据已加载:', {
                id: interviewData.id,
                name: interviewData.name,
                description: interviewData.description,
                state: interviewData.state,
                created_at: interviewData.created_at,
                recommended_total: interviewData.participants?.recommended_total,
                fullData: interviewData
            });
            console.log('📊 推荐用户数量:', interviewData.participants?.recommended_total || 2);
        }
    }, [interviewData]);

    // 根据 state 获取访谈状态
    const getInterviewStatus = (state: number) => {
        switch (state) {
            case 0:
                return {
                    text: '未开始',
                    className: 'bg-gray-100 text-gray-700'
                };
            case 1:
                return {
                    text: '进行中',
                    className: 'bg-green-100 text-green-700'
                };
            case 2:
                return {
                    text: '已结束',
                    className: 'bg-blue-100 text-blue-700'
                };
            default:
                return {
                    text: '未知',
                    className: 'bg-gray-100 text-gray-700'
                };
        }
    };

    // 格式化日期
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\//g, '.');
    };

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

    const realUsers: any[] = []; // 真人用户列表（暂时为空）
    // 使用显示的用户和添加的用户，过滤掉已删除的
    const simulatedUsers = [...displayedUsers, ...addedSimulatedUsers.filter(user => !removedUserIds.includes(user.id))];

    // 合并加载状态
    const isLoadingUsers = isLoadingRecommended || isLoadingResponses;

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

    // 获取模拟用户池数据
    const fetchSimulatedUserPool = async () => {
        setIsLoadingUserPool(true);
        try {
            const response = await fetch('http://localhost:8000/api/v1/interviewee/list_simulated_users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // 转换数据格式 - 支持两种数据结构
            let personasArray: PersonaFromAPI[] = [];

            if (Array.isArray(data.personas)) {
                // 如果返回的是 { personas: [...] } 格式
                personasArray = data.personas;
            } else if (Array.isArray(data)) {
                // 如果直接返回数组格式
                personasArray = data;
            }

            if (personasArray.length > 0) {
                const transformedUsers = personasArray.map(transformPersonaToUser);
                setSimulatedUserPoolData(transformedUsers);
            }
        } catch (error) {
            console.error('获取模拟用户池失败:', error);
            toast.error('获取模拟用户池失败', {
                description: '请检查后端服务是否正常运行'
            });
        } finally {
            setIsLoadingUserPool(false);
        }
    };

    // 打开模拟用户池弹窗
    const handleOpenSimulatedUserPool = () => {
        setShowSimulatedUserPool(true);
        fetchSimulatedUserPool();
    };

    const handleConfirmAdd = () => {
        // 从用户池中获取选中的用户
        const usersToAdd = simulatedUserPoolData.filter(user => selectedUsers.includes(user.id));
        setAddedSimulatedUsers(prev => [...prev, ...usersToAdd]);

        toast.success(t('toast.addSimulatedUsersSuccess', { count: selectedUsers.length }), {
            description: t('toast.addSimulatedUsersDescription')
        });
        setShowSimulatedUserPool(false);
        setSelectedUsers([]);
    };

    // 开始访谈
    const handleStartInterview = async () => {
        if (!interviewData) {
            toast.error('无法开始访谈', {
                description: '访谈数据未加载'
            });
            return;
        }

        // 提取所有模拟用户的真实 ID（去掉 "api-" 前缀）
        console.log('模拟用户列表:', simulatedUsers.map(u => ({ id: u.id, name: u.name })));

        const intervieweeIds = simulatedUsers
            .map(user => {
                // user.id 格式是 "api-123"，需要提取数字部分
                const match = user.id.match(/^api-(\d+)$/);
                return match ? parseInt(match[1], 10) : null;
            })
            .filter((id): id is number => id !== null);

        console.log('提取的 interviewee IDs:', intervieweeIds);

        if (intervieweeIds.length === 0) {
            toast.error('无法开始访谈', {
                description: '请至少添加一个模拟用户'
            });
            return;
        }

        try {
            console.log('开始访谈，参数:', {
                interview_id: interviewData.id,
                interviewee_ids: intervieweeIds
            });

            const response = await fetch('http://localhost:8000/api/v1/interview/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    interview_id: interviewData.id,
                    interviewee_ids: intervieweeIds
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('访谈开始成功:', data);

            toast.success('访谈已开始', {
                description: `正在访谈 ${intervieweeIds.length} 位用户`
            });

            // 显示加载弹窗
            setLoadingModalType('start');
            setShowLoadingModal(true);

            // 等待一小段时间让后端处理，然后刷新访谈详情
            setTimeout(async () => {
                await mutateInterview();
                console.log('✅ 访谈状态已刷新');

                // 刷新后，状态会变成 1，shouldUseRecommend 会变成 false
                // 自动触发已访谈用户数据的获取
            }, 1000); // 等待 1 秒

        } catch (error) {
            console.error('开始访谈失败:', error);
            toast.error('开始访谈失败', {
                description: '请检查后端服务是否正常运行'
            });
        }
    };

    // 结束访谈
    const handleFinishInterview = async () => {
        if (!interviewData) {
            toast.error('无法结束访谈', {
                description: '访谈数据未加载'
            });
            return;
        }

        try {
            // TODO: 从认证系统获取真实的 user_id
            const userId = 1; // 临时硬编码，后续需要从 session 或 context 中获取

            console.log('结束访谈，参数:', {
                interview_id: interviewData.id,
                user_id: userId
            });

            const response = await fetch('http://localhost:8000/api/v1/interview/finish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    interview_id: interviewData.id,
                    user_id: userId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('访谈结束成功:', data);

            toast.success('访谈已结束', {
                description: '访谈状态已更新为已完成'
            });

            // 显示加载弹窗（用于等待AI分析）
            setLoadingModalType('finish');
            setShowLoadingModal(true);

            // 等待一小段时间让后端处理，然后刷新访谈详情
            setTimeout(async () => {
                await mutateInterview();
                console.log('✅ 访谈状态已刷新为已结束');

                // 刷新后，状态会变成 2，接口会自动切换
                // 加载弹窗会在数据加载完成后自动关闭
            }, 1000); // 等待 1 秒

        } catch (error) {
            console.error('结束访谈失败:', error);
            toast.error('结束访谈失败', {
                description: error instanceof Error ? error.message : '请检查后端服务是否正常运行'
            });
        }
    };

    // 处理用户菜单点击
    const handleViewDetails = (userId: string) => {
        const user = [...displayedUsers, ...addedSimulatedUsers, ...simulatedUserPoolData].find(u => u.id === userId);
        if (user) {
            setSelectedUser(user);
            setShowUserDetailSheet(true);
        }
    };

    // 跳转到分析页面
    const handleViewAnalytics = () => {
        if (interviewId) {
            router.push(`/analytics?interview_id=${interviewId}`);
        }
    };

    const handleRemoveUser = (userId: string) => {
        // 只在推荐模式下允许移除用户
        if (!shouldUseRecommend) {
            toast.error('无法移除', {
                description: '访谈进行中或已结束，无法移除用户'
            });
            return;
        }

        const user = [...displayedUsers, ...addedSimulatedUsers].find(u => u.id === userId);
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

    // 监听滚动显示回到顶部按钮 + 无限滚动加载
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);

            // 无限滚动：检测是否滚动到底部
            if (!shouldUseRecommend && hasMoreResponses && !isLoadingResponses) {
                const scrollPosition = window.innerHeight + window.scrollY;
                const bottomPosition = document.documentElement.scrollHeight - 300; // 距离底部 300px 时开始加载

                if (scrollPosition >= bottomPosition) {
                    console.log('🔄 触发分页加载，当前页:', currentResponsePage);
                    setCurrentResponsePage(prev => prev + 1);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [shouldUseRecommend, hasMoreResponses, isLoadingResponses, currentResponsePage]);

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
                            {isLoadingInterview ? (
                                <div className="flex items-center justify-center py-4">
                                    <LoadingAnimation width={100} height={100} />
                                </div>
                            ) : interviewData ? (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                            {interviewData.name}
                                        </h2>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className={`${getInterviewStatus(interviewData.state).className} px-2 py-1 rounded-full text-xs font-medium`}>
                                                {getInterviewStatus(interviewData.state).text}
                                            </span>
                                            <span>{t('interview.info.createdTime')}: {formatDate(interviewData.created_at)}</span>
                                            <span>{t('interview.info.expectedUsers')} {interviewData.participants?.recommended_total || 0}人</span>
                                            {interviewData.duration && (
                                                <span>预计时长: {Math.round(interviewData.duration / 60)}分钟</span>
                                            )}
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* 查看分析报告按钮 - 只在已结束状态显示 */}
                                        {interviewData.state === 2 && (
                                            <Button
                                                variant="outline"
                                                className="border-primary text-primary hover:bg-primary/10 px-6 py-2 flex items-center gap-2"
                                                onClick={handleViewAnalytics}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                查看分析报告
                                            </Button>
                                        )}

                                        {/* 开始/结束访谈按钮 */}
                                        <Button
                                            className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
                                            onClick={() => {
                                                if (interviewData.state === 0) {
                                                    handleStartInterview();
                                                } else if (interviewData.state === 1) {
                                                    handleFinishInterview();
                                                }
                                            }}
                                            disabled={interviewData.state === 2}
                                        >
                                            {interviewData.state === 0 ? t('interview.startInterview') :
                                                interviewData.state === 1 ? t('interview.endInterview') :
                                                    t('interview.interviewEnded')}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    {t('interview.noData')}
                                </div>
                            )}
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
                                        {!shouldUseRecommend && responsesData?.total && (
                                            <span className="text-sm text-gray-500 font-normal">
                                                / {responsesData.total} 个
                                            </span>
                                        )}
                                    </h3>
                                    <span className="text-sm text-gray-600">
                                        {shouldUseRecommend
                                            ? t('users.simulatedUsers.description', { count: simulatedUsers.length })
                                            : '已完成访谈的模拟用户'
                                        }
                                    </span>
                                </div>
                                {/* 只在未开始状态显示添加按钮 */}
                                {shouldUseRecommend && (
                                    <Button
                                        onClick={handleOpenSimulatedUserPool}
                                        variant="outline"
                                        className="text-gray-600 hover:text-gray-800"
                                    >
                                        {t('users.simulatedUsers.addButton')}
                                    </Button>
                                )}
                            </div>

                            {isLoadingUsers && simulatedUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <LoadingAnimation width={150} height={150} />
                                    <p className="text-gray-600 mt-4">
                                        {shouldUseRecommend ? '正在获取推荐用户...' : '正在获取已访谈用户...'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {simulatedUsers.map((user) => (
                                            <UserCard
                                                key={user.id}
                                                user={user}
                                                onViewDetails={handleViewDetails}
                                                onRemoveUser={handleRemoveUser}
                                                canRemove={shouldUseRecommend}
                                            />
                                        ))}
                                    </div>

                                    {/* 加载更多指示器 */}
                                    {!shouldUseRecommend && isLoadingResponses && simulatedUsers.length > 0 && (
                                        <div className="flex justify-center items-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                                            <span className="text-sm text-gray-600">加载更多...</span>
                                        </div>
                                    )}

                                    {/* 已加载全部数据提示 */}
                                    {!shouldUseRecommend && !hasMoreResponses && simulatedUsers.length > 0 && (
                                        <div className="flex justify-center items-center py-8">
                                            <span className="text-sm text-gray-500">已加载全部数据</span>
                                        </div>
                                    )}
                                </>
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
                                {selectedUsers.length > 0 && (
                                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                        已选择 {selectedUsers.length} 人
                                    </span>
                                )}
                                <button className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </DialogHeader>

                        {/* 用户池网格 */}
                        <div className="py-6">
                            {isLoadingUserPool ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <LoadingAnimation width={150} height={150} />
                                    <p className="text-gray-600 mt-4">正在加载模拟用户池...</p>
                                </div>
                            ) : simulatedUserPoolData.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {simulatedUserPoolData.map((user) => (
                                        <div
                                            key={user.id}
                                            className={`relative cursor-pointer transition-all ${selectedUsers.includes(user.id)
                                                ? 'ring-2 ring-primary bg-primary/5'
                                                : 'hover:shadow-lg'
                                                }`}
                                        >
                                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                                {/* 查看详情按钮 - 右上角 */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(user.id);
                                                    }}
                                                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors shadow-sm border border-gray-200 z-10"
                                                    title="查看详情"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {/* 选择指示器 */}
                                                <div
                                                    className="flex items-start gap-3 mb-4"
                                                    onClick={() => toggleUserSelection(user.id)}
                                                >
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedUsers.includes(user.id)
                                                        ? 'bg-primary border-primary'
                                                        : 'border-gray-300'
                                                        }`}>
                                                        {selectedUsers.includes(user.id) && (
                                                            <Check className="w-3 h-3 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                                                                {user.avatar}
                                                            </div>
                                                            <h3 className="text-sm font-semibold text-gray-900 pr-8">{user.name}</h3>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 属性标签网格 */}
                                                <div onClick={() => toggleUserSelection(user.id)}>
                                                    {user.attributes && Object.keys(user.attributes).length > 0 && (
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {Object.entries(user.attributes).slice(0, 6).map(([key, value], index) => (
                                                                <div key={index} className="bg-gray-50 rounded-lg px-2 py-1.5 flex flex-col items-center">
                                                                    <span className="text-xs text-gray-600 truncate w-full text-center">{key}</span>
                                                                    <span className="text-xs font-medium text-gray-900 truncate w-full text-center">{String(value)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Bot className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 mb-2">暂无可用的模拟用户</p>
                                    <p className="text-sm text-gray-500">请稍后再试</p>
                                </div>
                            )}
                        </div>

                        {/* 底部按钮 */}
                        <div className="flex justify-center items-center gap-3 pt-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowSimulatedUserPool(false);
                                    setSelectedUsers([]);
                                }}
                                className="px-6"
                            >
                                {t('modals.simulatedUserPool.cancel')}
                            </Button>
                            {selectedUsers.length > 0 && (
                                <Button
                                    onClick={handleConfirmAdd}
                                    className="bg-primary hover:bg-primary/90 text-white px-6"
                                >
                                    确认添加 ({selectedUsers.length})
                                </Button>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Loading Modal */}
                <Dialog open={showLoadingModal} onOpenChange={setShowLoadingModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-center text-xl font-semibold">
                                {loadingModalType === 'start' ? t('loading.title') : '正在结束访谈'}
                            </DialogTitle>
                            <DialogDescription className="text-center text-gray-600">
                                {loadingModalType === 'start'
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