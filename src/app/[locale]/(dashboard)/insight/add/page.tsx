"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { NavActions } from "@/components/sidebar/nav-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar, useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { useState, useRef } from "react";
import { FileText, Upload, Plus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Check } from "lucide-react";

interface FormData {
  productName: string;
  businessType: string;
  targetUsers: string;
  userConcerns: string;
  coreFeatures: string;
  productSolution: File | null;
}

export default function Page() {
  const [formData, setFormData] = useState<FormData>({
    productName: "",
    businessType: "",
    targetUsers: "",
    userConcerns: "",
    coreFeatures: "",
    productSolution: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleNextStep = () => {
    router.push('/zh/insight/check');
  };

  // 让AI能够读取表单数据
  useCopilotReadable({
    description: "当前表单的所有数据，包括产品名称、业务类型、目标用户群体、用户关心的方面、核心功能模块和产品方案文件",
    value: {
      productName: formData.productName,
      businessType: formData.businessType,
      targetUsers: formData.targetUsers,
      userConcerns: formData.userConcerns,
      coreFeatures: formData.coreFeatures,
      hasProductSolution: !!formData.productSolution,
      productSolutionName: formData.productSolution?.name || null,
    },
  });

  // 更新产品名称
  useCopilotAction({
    name: "updateProductName",
    description: "更新产品名称字段",
    parameters: [{
      name: "productName",
      type: "string",
      description: "新的产品名称",
      required: true,
    }],
    handler: ({ productName }) => {
      setFormData(prev => ({ ...prev, productName }));
    },
  });

  // 更新业务类型
  useCopilotAction({
    name: "updateBusinessType",
    description: "更新业务类型字段",
    parameters: [{
      name: "businessType",
      type: "string",
      description: "新的业务类型，如：笔记APP、工具类、社交类等",
      required: true,
    }],
    handler: ({ businessType }) => {
      setFormData(prev => ({ ...prev, businessType }));
    },
  });

  // 更新目标用户群体
  useCopilotAction({
    name: "updateTargetUsers",
    description: "更新目标用户/核心用户群体字段",
    parameters: [{
      name: "targetUsers",
      type: "string",
      description: "目标用户群体描述，如：年轻女性用户、下沉市场用户、重度购物用户等",
      required: true,
    }],
    handler: ({ targetUsers }) => {
      setFormData(prev => ({ ...prev, targetUsers }));
    },
  });

  // 更新用户关心的方面
  useCopilotAction({
    name: "updateUserConcerns",
    description: "更新用户希望了解的产品方面",
    parameters: [{
      name: "userConcerns",
      type: "string",
      description: "用户关心的产品方面，如：为什么选择该产品、哪些功能困扰用户等",
      required: true,
    }],
    handler: ({ userConcerns }) => {
      setFormData(prev => ({ ...prev, userConcerns }));
    },
  });

  // 更新核心功能模块
  useCopilotAction({
    name: "updateCoreFeatures",
    description: "更新最关心的功能模块字段",
    parameters: [{
      name: "coreFeatures",
      type: "string",
      description: "核心功能模块，如：笔记功能、记录流程、分享功能、社区浏览等",
      required: true,
    }],
    handler: ({ coreFeatures }) => {
      setFormData(prev => ({ ...prev, coreFeatures }));
    },
  });

  // 清空表单
  useCopilotAction({
    name: "clearForm",
    description: "清空所有表单字段",
    parameters: [],
    handler: () => {
      setFormData({
        productName: "",
        businessType: "",
        targetUsers: "",
        userConcerns: "",
        coreFeatures: "",
        productSolution: null,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  // 填充示例数据
  useCopilotAction({
    name: "fillSampleData",
    description: "填充示例调研数据",
    parameters: [],
    handler: () => {
      setFormData({
        productName: "Dreamoo",
        businessType: "笔记APP、工具类、社交类",
        targetUsers: "年轻女性用户、下沉市场用户、重度购物用户等\n\n如果有特定关注的用户群体，请详细描述",
        userConcerns: "用户为什么选择Dreamoo而不是其他平台？哪些功能让用户感到困扰？用户的记录梦境过程是怎样的？\n\n这将帮助我们确定访谈的重点方向",
        coreFeatures: "笔记功能、记录流程、分享功能、社区浏览等\n\n可以填写多个功能，用逗号分隔",
        productSolution: null,
      });
    },
  });

  // 智能建议
  useCopilotChatSuggestions({
    instructions: "为用户提供以下建议：1. 帮我填写一个笔记APP的调研信息 2. 清空当前表单 3. 根据产品名称自动填充相关信息",
    minSuggestions: 3,
    maxSuggestions: 3,
  });

  return (
    <div style={{ "--copilot-kit-primary-color": "oklch(0.705 0.213 47.604)" } as CopilotKitCSSProperties}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-8 p-4">
            {/* 流程状态栏 */}
            <div className="bg-white rounded-lg shadow-sm px-0 py-6 mb-6">
              <div className="px-6">
                <Stepper value={2} className="w-full">
                  <StepperNav className="flex justify-between items-center">
                    <StepperItem step={1} completed={2 > 1}>
                      <StepperTrigger className="flex flex-col items-center gap-3">
                        <StepperIndicator className="w-10 h-10 text-sm font-medium bg-[oklch(0.705_0.213_47.604)] text-white">
                          <Check className="w-5 h-5" />
                        </StepperIndicator>
                        <div className="text-center">
                          <StepperTitle className="text-sm font-medium text-[oklch(0.705_0.213_47.604)]">创建项目</StepperTitle>
                          <StepperDescription className="text-xs text-gray-500 mt-1">介绍您的产品</StepperDescription>
                        </div>
                      </StepperTrigger>
                      <StepperSeparator className="mx-4 flex-1 bg-[oklch(0.705_0.213_47.604)] h-0.5" />
                    </StepperItem>
                    
                    <StepperItem step={2} completed={2 > 2}>
                      <StepperTrigger className="flex flex-col items-center gap-3">
                        <StepperIndicator className="w-10 h-10 text-sm font-medium bg-gray-200 text-gray-700 border-2 border-dashed border-[oklch(0.705_0.213_47.604)]">
                          2
                        </StepperIndicator>
                        <div className="text-center">
                          <StepperTitle className="text-sm font-medium text-[oklch(0.705_0.213_47.604)]">制定目标</StepperTitle>
                          <StepperDescription className="text-xs text-gray-500 mt-1">用户调研核心</StepperDescription>
                        </div>
                      </StepperTrigger>
                      <StepperSeparator className="mx-4 flex-1 bg-gray-200 h-0.5" />
                    </StepperItem>
                    
                    <StepperItem step={3} completed={2 > 3}>
                      <StepperTrigger className="flex flex-col items-center gap-3">
                        <StepperIndicator className="w-10 h-10 text-sm font-medium bg-gray-200 text-gray-500">
                          3
                        </StepperIndicator>
                        <div className="text-center">
                          <StepperTitle className="text-sm font-medium text-gray-500">确认计划</StepperTitle>
                          <StepperDescription className="text-xs text-gray-500 mt-1">调研问卷与访谈大纲</StepperDescription>
                        </div>
                      </StepperTrigger>
                    </StepperItem>
                  </StepperNav>
                </Stepper>
              </div>
            </div>
            
            <SurveyForm 
              formData={formData} 
              setFormData={setFormData}
              fileInputRef={fileInputRef}
              onNextStep={handleNextStep}
            />
          </div>
        </SidebarInset>
        <CopilotSidebar
          clickOutsideToClose={false}
          defaultOpen={true}
          labels={{
            title: "AI 调研助手",
            initial: "👋 你好！我是你的AI调研助手。\n\n我可以帮助你：\n\n• 📝 填写和修改表单内容\n• 🔄 清空或重置表单\n• 💡 根据产品信息自动补充相关内容\n• 📋 提供调研问题建议\n\n请告诉我你需要什么帮助！"
          }}
        />
      </SidebarProvider>
    </div>
  )
}

interface SurveyFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onNextStep: () => void;
}

function SurveyForm({ formData, setFormData, fileInputRef, onNextStep }: SurveyFormProps) {
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      // 检查文件类型
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('只支持 PDF、PNG、JPG 格式的文件');
        return;
      }
      // 检查文件大小 (100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('文件大小不能超过 100MB');
        return;
      }
    }
    setFormData(prev => ({ ...prev, productSolution: file }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      {/* 表单标题 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-orange-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">补充调研信息</h1>
      </div>

      <div className="space-y-6">
        {/* 产品名称和业务类型 - 并排布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              您的产品名称
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              placeholder="Dreamoo"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">这将帮助我们确定访谈的重点方向</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              您的业务类型
            </label>
            <input
              type="text"
              value={formData.businessType}
              onChange={(e) => handleInputChange('businessType', e.target.value)}
              placeholder="笔记APP、工具类、社交类"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">这将帮助我们确定访谈的重点方向</p>
          </div>
        </div>

        {/* 目标用户群体 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            目标用户/核心用户群体？
          </label>
          <textarea
            value={formData.targetUsers}
            onChange={(e) => handleInputChange('targetUsers', e.target.value)}
            placeholder="例如：年轻女性用户、下沉市场用户、重度购物用户等"
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">如果有特定关注的用户群体，请详细描述</p>
        </div>

        {/* 用户关心的方面 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            您希望了解用户对Dreamoo APP的哪些方面？
          </label>
          <textarea
            value={formData.userConcerns}
            onChange={(e) => handleInputChange('userConcerns', e.target.value)}
            placeholder="例如：用户为什么选择 Dreamoo 而不是其他平台？哪些功能让用户感到困扰？用户的记录梦境过程是怎样的？"
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">这将帮助我们确定访谈的重点方向</p>
        </div>

        {/* 核心功能模块 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            您最关心的功能模块是什么？
          </label>
          <textarea
            value={formData.coreFeatures}
            onChange={(e) => handleInputChange('coreFeatures', e.target.value)}
            placeholder="例如：笔记功能、记录流程、分享功能、社区浏览等"
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">可以填写多个功能，用逗号分隔</p>
        </div>

        {/* 产品方案文件上传 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            您的产品方案
          </label>
          <div 
            onClick={handleUploadClick}
            className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-orange-300 hover:bg-orange-50 transition-all cursor-pointer"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                {formData.productSolution ? (
                  <FileText className="w-6 h-6 text-orange-600" />
                ) : (
                  <Plus className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                {formData.productSolution ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formData.productSolution.name}</p>
                    <p className="text-xs text-gray-500">点击更换文件</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-700">点击或拖拽文件到此上传</p>
                    <p className="text-xs text-gray-500 mt-1">Only pdf, png, jpg can be uploaded, and the size does not exceed 100MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* 下一步按钮 */}
        <div className="flex justify-end mt-8">
          <button
            onClick={onNextStep}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            下一步
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
