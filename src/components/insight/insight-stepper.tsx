"use client"

import { Check } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/stepper"

interface InsightStepperProps {
  /** 当前步骤 (1: 目标设定, 2: 访谈大纲, 3: 用户访谈) */
  currentStep: number
  /** 可选的步骤点击回调（用于导航功能） */
  onStepClick?: (step: number) => void
  /** 翻译命名空间（默认为 'interview'） */
  translationNamespace?: string
}

export function InsightStepper({ currentStep, onStepClick, translationNamespace = "interview" }: InsightStepperProps) {
  const t = useTranslations(translationNamespace)

  // 判断步骤是否可以导航（只有已完成的步骤才能点击）
  const canNavigateToStep = (step: number) => {
    return onStepClick && step < currentStep
  }

  return (
    <div className="bg-white rounded-lg shadow-sm px-6 py-6">
      <Stepper value={currentStep} className="w-full">
        <StepperNav className="flex justify-between items-center">
          {/* 步骤 1: 目标设定 */}
          <StepperItem step={1} completed={currentStep > 1}>
            <StepperTrigger
              className="step-trigger"
              canNavigate={canNavigateToStep(1)}
              onClick={() => canNavigateToStep(1) && onStepClick?.(1)}
            >
              <StepperIndicator
                className={`w-10 h-10 text-sm font-medium ${
                  currentStep > 1
                    ? "bg-primary text-white"
                    : currentStep === 1
                      ? "bg-gray-200 text-gray-700 border-2 border-dashed border-primary"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > 1 ? <Check className="w-5 h-5" /> : "1"}
              </StepperIndicator>
              <div className="text-center">
                <StepperTitle className={`text-sm font-medium ${currentStep >= 1 ? "text-primary" : "text-gray-500"}`}>
                  {t("steps.step1.title")}
                </StepperTitle>
                <StepperDescription className="text-xs text-gray-500 mt-1">
                  {t("steps.step1.description")}
                </StepperDescription>
              </div>
            </StepperTrigger>
            <StepperSeparator className={`mx-4 flex-1 h-0.5 ${currentStep > 1 ? "bg-primary" : "bg-gray-200"}`} />
          </StepperItem>

          {/* 步骤 2: 访谈大纲 */}
          <StepperItem step={2} completed={currentStep > 2}>
            <StepperTrigger
              className="step-trigger"
              canNavigate={canNavigateToStep(2)}
              onClick={() => canNavigateToStep(2) && onStepClick?.(2)}
            >
              <StepperIndicator
                className={`w-10 h-10 text-sm font-medium ${
                  currentStep > 2
                    ? "bg-primary text-white"
                    : currentStep === 2
                      ? "bg-gray-200 text-gray-700 border-2 border-dashed border-primary"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > 2 ? <Check className="w-5 h-5" /> : "2"}
              </StepperIndicator>
              <div className="text-center">
                <StepperTitle className={`text-sm font-medium ${currentStep >= 2 ? "text-primary" : "text-gray-500"}`}>
                  {t("steps.step2.title")}
                </StepperTitle>
                <StepperDescription className="text-xs text-gray-500 mt-1">
                  {t("steps.step2.description")}
                </StepperDescription>
              </div>
            </StepperTrigger>
            <StepperSeparator className={`mx-4 flex-1 h-0.5 ${currentStep > 2 ? "bg-primary" : "bg-gray-200"}`} />
          </StepperItem>

          {/* 步骤 3: 用户访谈 */}
          <StepperItem step={3} completed={currentStep > 3}>
            <StepperTrigger
              className="step-trigger"
              canNavigate={canNavigateToStep(3)}
              onClick={() => canNavigateToStep(3) && onStepClick?.(3)}
            >
              <StepperIndicator
                className={`w-10 h-10 text-sm font-medium ${
                  currentStep > 3
                    ? "bg-primary text-white"
                    : currentStep === 3
                      ? "bg-gray-200 text-gray-700 border-2 border-dashed border-primary"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > 3 ? <Check className="w-5 h-5" /> : "3"}
              </StepperIndicator>
              <div className="text-center">
                <StepperTitle className={`text-sm font-medium ${currentStep >= 3 ? "text-primary" : "text-gray-500"}`}>
                  {t("steps.step3.title")}
                </StepperTitle>
                <StepperDescription className="text-xs text-gray-500 mt-1">
                  {t("steps.step3.description")}
                </StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>
        </StepperNav>
      </Stepper>
    </div>
  )
}
