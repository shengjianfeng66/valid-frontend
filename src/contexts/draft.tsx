"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface DraftContextType {
    hasDraft: boolean;
    setHasDraft: (hasDraft: boolean) => void;
    clearDraft: () => void;
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export function DraftProvider({ children }: { children: React.ReactNode }) {
    const [hasDraft, setHasDraft] = useState(false);
    const pathname = usePathname();

    // 检测当前页面是否有草稿
    useEffect(() => {
        const checkDraft = () => {
            // 检查是否在创建流程页面
            const isInCreationFlow = pathname?.includes('/insight/goal') || pathname?.includes('/insight/outline');

            if (isInCreationFlow) {
                // 检查是否有表单数据
                const hasFormData = checkFormData();
                setHasDraft(!!hasFormData);
            } else {
                setHasDraft(false);
            }
        };

        checkDraft();
    }, [pathname]);

    const checkFormData = () => {
        // 检查 sessionStorage 中是否有调研信息
        try {
            const surveyInfo = sessionStorage.getItem('vf_surveyInfo');
            return surveyInfo && surveyInfo.trim() !== '';
        } catch {
            return false;
        }
    };

    const clearDraft = () => {
        setHasDraft(false);
    };

    return (
        <DraftContext.Provider value={{ hasDraft, setHasDraft, clearDraft }}>
            {children}
        </DraftContext.Provider>
    );
}

export function useDraft() {
    const context = useContext(DraftContext);
    if (context === undefined) {
        throw new Error('useDraft must be used within a DraftProvider');
    }
    return context;
}
