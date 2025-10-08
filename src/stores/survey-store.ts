import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 调研信息接口
export interface SurveyInfo {
    productName: string;
    businessType: string;
    targetUsers: string;
    userConcerns: string;
    coreFeatures: string;
    hasProductSolution?: boolean;
    productSolutionName?: string;
}

// 访谈数据接口
export interface InterviewData {
    surveyIntro: string;
    surveyTargetUsers: string;
    surveyQuestions: {
        page1: { q1: string; q2: string };
        page2: { q1: string; q2: string };
        page3: { q1: string; q2: string };
    };
    interviewTargetUsers: string;
    interviewOutline: {
        opening_script: {
            introduction: string;
        };
        closing_script: {
            conclusion: string;
        };
        sections: Array<{
            name: string;
            questions: Array<{
                main: string;
                probes: string[];
            }>;
            reason: string;
        }>;
    };
}

// Store 接口
interface SurveyStore {
    surveyInfo: SurveyInfo | null;
    interviewData: InterviewData | null;

    // Actions
    setSurveyInfo: (info: SurveyInfo | null) => void;
    setInterviewData: (data: InterviewData | null) => void;
    clearSurveyInfo: () => void;
    clearInterviewData: () => void;
    clearAll: () => void;
}

// 创建 store，使用 persist 中间件持久化到 sessionStorage
export const useSurveyStore = create<SurveyStore>()(
    persist(
        (set) => ({
            surveyInfo: null,
            interviewData: null,

            setSurveyInfo: (info) => set({ surveyInfo: info }),
            setInterviewData: (data) => set({ interviewData: data }),
            clearSurveyInfo: () => set({ surveyInfo: null }),
            clearInterviewData: () => set({ interviewData: null }),
            clearAll: () => set({ surveyInfo: null, interviewData: null }),
        }),
        {
            name: 'vf-survey-storage', // sessionStorage key
            partialize: (state) => ({
                surveyInfo: state.surveyInfo,
                interviewData: state.interviewData,
            }),
        }
    )
);

