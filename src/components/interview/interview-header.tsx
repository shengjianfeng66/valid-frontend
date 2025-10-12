"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface InterviewHeaderProps {
    interviewData: any;
    onStartInterview: () => void;
    onFinishInterview: () => void;
    onViewAnalytics: () => void;
}

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
                text: '访谈中',
                className: 'bg-green-100 text-green-700'
            };
        case 2:
            return {
                text: '暂停访谈',
                className: 'bg-yellow-100 text-yellow-700'
            };
        case 3:
            return {
                text: '访谈结束',
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

export function InterviewHeader({
    interviewData,
    onStartInterview,
    onFinishInterview,
    onViewAnalytics
}: InterviewHeaderProps) {
    const t = useTranslations('interview');

    return (
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
                {interviewData.state === 3 && (
                    <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10 px-6 py-2 flex items-center gap-2"
                        onClick={onViewAnalytics}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        查看分析报告
                    </Button>
                )}

                {/* 开始/暂停/结束访谈按钮 */}
                <Button
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
                    onClick={() => {
                        if (interviewData.state === 0) {
                            onStartInterview();
                        } else if (interviewData.state === 1) {
                            onFinishInterview();
                        }
                    }}
                    disabled={interviewData.state === 2 || interviewData.state === 3}
                >
                    {interviewData.state === 0 ? t('interview.startInterview') :
                        interviewData.state === 1 ? t('interview.endInterview') :
                            interviewData.state === 2 ? '已暂停' :
                                t('interview.interviewEnded')}
                </Button>
            </div>
        </div>
    );
}

