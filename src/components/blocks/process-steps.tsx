"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
}

interface ProcessStepsProps {
  currentStep?: number;
  className?: string;
}

export default function ProcessSteps({ currentStep = 2, className }: ProcessStepsProps) {
  const steps: ProcessStep[] = [
    {
      id: 1,
      title: "创建项目",
      description: "介绍您的产品",
      status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming"
    },
    {
      id: 2,
      title: "制定目标",
      description: "用户调研核心",
      status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming"
    },
    {
      id: 3,
      title: "调研问卷",
      description: "问卷设计",
      status: currentStep > 3 ? "completed" : currentStep === 3 ? "current" : "upcoming"
    },
    {
      id: 4,
      title: "访谈大纲",
      description: "访谈提纲",
      status: currentStep > 4 ? "completed" : currentStep === 4 ? "current" : "upcoming"
    }
  ];

  return (
    <div className={cn("bg-white rounded-lg shadow-sm px-0 py-6 mb-6", className)}>
      <div className="relative flex items-start justify-between w-full px-6">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex flex-col items-center z-10">
            {/* Step Circle */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                {
                  "bg-[oklch(0.705_0.213_47.604)] text-white": step.status === "completed",
                  "bg-gray-200 text-gray-700 border-2 border-dashed border-[oklch(0.705_0.213_47.604)]": step.status === "current",
                  "bg-gray-200 text-gray-500": step.status === "upcoming"
                }
              )}
            >
              {step.status === "completed" ? (
                <Check className="w-5 h-5" />
              ) : (
                step.id
              )}
            </div>

            {/* Step Info */}
            <div className="mt-3 text-center">
              <div
                className={cn(
                  "text-sm font-medium",
                  {
                    "text-[oklch(0.705_0.213_47.604)]": step.status === "completed",
                    "text-[oklch(0.705_0.213_47.600)]": step.status === "current",
                    "text-gray-500": step.status === "upcoming"
                  }
                )}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {step.description}
              </div>
            </div>
          </div>
        ))}

        {/* Connector Lines as background layer */}
        <div className="absolute top-5 left-6 right-6 flex items-center z-0">
          {steps.map((step, index) => (
            index < steps.length - 1 && (
              <div key={index} className="flex-1">
                <div
                  className={cn(
                    "h-0.5 transition-all",
                    {
                      "bg-[oklch(0.705_0.213_47.604)]": step.status === "completed" || steps[index + 1].status === "completed" || step.status === "current",
                      "bg-gray-200": step.status === "upcoming" && steps[index + 1].status === "upcoming"
                    }
                  )}
                />
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

// Export the component type for use in other files
export type { ProcessStepsProps };
