"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useFormStore } from "@/stores/form-store";

interface DraftContextType {
    hasDraft: boolean;
    setHasDraft: (hasDraft: boolean) => void;
    clearDraft: () => void;
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export function DraftProvider({ children }: { children: React.ReactNode }) {
    const [hasDraft, setHasDraft] = useState(false);
    const pathname = usePathname();
    const { clearForm } = useFormStore();

    // 检测当前页面是否有草稿
    useEffect(() => {
        const checkDraft = () => {
            // 检查是否在创建流程页面
            const isInCreationFlow = pathname?.includes('/insight/goal') ||
                pathname?.includes('/insight/outline') ||
                pathname?.includes('/insight/interview');

            if (isInCreationFlow) {
                // 在创建流程页面时，总是显示确认弹窗
                setHasDraft(true);
            } else {
                // 离开创建流程页面时，清空表单数据
                setHasDraft(false);
                clearForm();
            }
        };

        checkDraft();
    }, [pathname, clearForm]);

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
