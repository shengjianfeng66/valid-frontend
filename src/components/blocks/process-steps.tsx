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
      title: "确认计划",
      description: "调研问卷与访谈大纲",
      status: currentStep > 3 ? "completed" : currentStep === 3 ? "current" : "upcoming"
    }
  ];

  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-6 mb-6", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  {
                    "bg-green-500 text-white": step.status === "completed",
                    "bg-orange-500 text-white": step.status === "current",
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
                      "text-green-600": step.status === "completed",
                      "text-orange-600": step.status === "current",
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

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={cn(
                    "h-0.5 transition-all",
                    {
                      "bg-green-500": steps[index + 1].status === "completed" || step.status === "completed",
                      "bg-orange-500": step.status === "current" && steps[index + 1].status !== "completed",
                      "bg-gray-200": step.status === "upcoming"
                    }
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Export the component type for use in other files
export type { ProcessStepsProps };