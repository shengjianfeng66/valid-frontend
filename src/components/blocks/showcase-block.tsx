"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const categories = [
  { id: "all", label: "全部" },
  { id: "social", label: "社交网络" },
  { id: "productivity", label: "生产力工具" },
  { id: "entertainment", label: "娱乐" },
]

const showcaseData = [
  {
    id: 1,
    name: "小红书",
    rank: "#1",
    category: "social",
    icon: "📖",
    categoryLabel: "社交网络",
    userLove: "种草笔记分享、滤镜美化功能深受年轻用户喜爱",
    mainIssues: "内容推荐算法有时不够精准，广告植入过多",
    tags: ["内容创作", "社区氛围", "广告过多"]
  },
  {
    id: 2,
    name: "微信",
    rank: "#2",
    category: "social",
    icon: "💬",
    categoryLabel: "社交网络",
    userLove: "语音消息、朋友圈动态、小程序生态丰富",
    mainIssues: "界面设计相对陈旧，群聊管理功能待优化",
    tags: ["生态丰富", "使用习惯", "界面老旧"]
  },
  {
    id: 3,
    name: "网易云音乐",
    rank: "#3",
    category: "entertainment",
    icon: "🎵",
    categoryLabel: "娱乐",
    userLove: "个性化推荐、音乐评论区互动、歌单分享",
    mainIssues: "部分歌曲版权缺失，会员费用偏高",
    tags: ["个性推荐", "社区互动", "版权问题"]
  },
  {
    id: 4,
    name: "淘宝",
    rank: "#4",
    category: "productivity",
    icon: "🛒",
    categoryLabel: "生产力工具",
    userLove: "商品种类丰富、价格对比方便、物流快速",
    mainIssues: "商品质量参差不齐，客服响应速度慢",
    tags: ["商品丰富", "价格优势", "质量参差"]
  },
  {
    id: 5,
    name: "滴滴出行",
    rank: "#5",
    category: "productivity",
    icon: "🚗",
    categoryLabel: "生产力工具",
    userLove: "叫车便捷、司机服务态度好、支付方式多样",
    mainIssues: "高峰期价格波动大，等车时间较长",
    tags: ["便捷出行", "服务质量", "价格波动"]
  },
  {
    id: 6,
    name: "美团",
    rank: "#6",
    category: "productivity",
    icon: "🍔",
    categoryLabel: "生产力工具",
    userLove: "外卖配送快、商家选择多、优惠活动频繁",
    mainIssues: "配送费用逐渐上涨，食品安全监管待加强",
    tags: ["配送便捷", "商家丰富", "费用上涨"]
  }
]

export function ShowcaseBlock() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("appstore")
  const t = useTranslations("showcase")

  const filteredData = activeCategory === "all" 
    ? showcaseData 
    : showcaseData.filter(item => item.category === activeCategory)

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("appstore")}
            className={`flex items-center gap-2 transition-colors ${
              activeTab === "appstore"
                ? "text-black font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="text-lg">{t("appStoreTitle")}</span>
          </button>
          <button
            onClick={() => setActiveTab("producthunt")}
            className={`transition-colors ${
              activeTab === "producthunt"
                ? "text-black font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="text-lg">{t("productHuntTitle")}</span>
          </button>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{t("updateTime")}: 09月21日 06:00</span>
        </div>
      </div>

      {/* 分类标签 */}
      <div className="flex items-center gap-4 mb-8">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category.id)}
            className={`rounded-full px-4 py-2 text-sm ${
              activeCategory === category.id
                ? "bg-gray-800 text-white hover:bg-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* 应用卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((app) => (
          <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:scale-105 hover:border-primary transition-all duration-300 cursor-pointer">
            {/* 应用头部 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                {app.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{app.name}</h3>
                  <span className="text-sm text-gray-500">{app.rank}</span>
                </div>
                <span className="text-sm text-gray-500">{app.categoryLabel}</span>
              </div>
            </div>

            {/* 用户最爱功能 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">{t("userLove")}:</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{app.userLove}</p>
            </div>

            {/* 主要槽点 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">{t("mainIssues")}:</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{app.mainIssues}</p>
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              {app.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}