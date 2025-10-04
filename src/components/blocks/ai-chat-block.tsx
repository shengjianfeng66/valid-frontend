"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, FileText, AlignLeft, Globe, Youtube, Image, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTranslations } from "next-intl"

const formatIcons = [
  { icon: MessageSquare, label: "一句话" },
  { icon: FileText, label: "PDF文档" },
  { icon: AlignLeft, label: "长文本" },
  { icon: Globe, label: "网站" },
  { icon: Image, label: "图片" },
]

export function AiChatBlock() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const t = useTranslations("aiChat")

  const handleSubmit = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    // 使用 sessionStorage 传递输入内容，避免 URL 过长
    const value = input.trim()
    try {
      sessionStorage.setItem('vf_initialMessage', value)
    } catch (e) {
      // 忽略存储异常，后续仍然尝试页面跳转
    }
    setTimeout(() => {
      setIsLoading(false)
      router.push(`/insight/goal`)
    }, 1000)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* 标题区域 */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-3xl font-bold text-primary">
            {t("title")}
          </h1>
        </div>
        <h2 className="text-xl text-gray-600 mb-4">
          {t("subtitle")}
        </h2>
        <p className="text-gray-500 text-sm max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>

      {/* 格式图标 */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {formatIcons.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
          )
        })}
      </div>

      {/* 输入区域 */}
      <div className="space-y-4">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            className="min-h-[120px] resize-none border-2 border-gray-200 rounded-xl p-4 text-sm focus:border-gray-400 focus:ring-0"
          />
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 rounded-lg flex items-center gap-2 min-w-[120px]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("analyzing")}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t("startAnalysis")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
