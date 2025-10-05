"use client";

import { useState } from "react";
import { Clock, MapPin, Star, MessageCircle, Phone, Video, UserPlus } from "lucide-react";

interface User {
  id: string;
  name: string;
  age: number;
  location: string;
  avatar: string;
  status: "视频通话中" | "准备中" | "已完成" | "等待中";
  rating?: number;
  tags: string[];
  isReal: boolean;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "张雨晴",
    age: 28,
    location: "北京一线",
    avatar: "🤗",
    status: "视频通话中",
    tags: ["创意爱好", "上班族", "数码爱好者", "理想主义"],
    isReal: true
  },
  {
    id: "2",
    name: "李小红",
    age: 32,
    location: "上海一线",
    avatar: "😊",
    status: "视频通话中",
    tags: ["通勤族", "实用", "时间敏感", "精致生活"],
    isReal: true
  },
  {
    id: "3",
    name: "王大伟",
    age: 29,
    location: "广州一线",
    avatar: "😄",
    status: "准备中",
    tags: ["品质生活", "细致", "追求完美", "社交达人"],
    isReal: true
  },
  {
    id: "4",
    name: "陈美丽",
    age: 24,
    location: "深圳一线",
    avatar: "🤗",
    status: "已完成",
    tags: ["创意爱好", "上班族", "追求品质", "精致生活"],
    isReal: true
  },
  {
    id: "5",
    name: "刘强",
    age: 27,
    location: "杭州新一线",
    avatar: "😎",
    status: "等待中",
    tags: ["效率", "实用", "文艺青年", "追求品质"],
    isReal: true
  },
  {
    id: "6",
    name: "赵敏",
    age: 27,
    location: "南京新一线",
    avatar: "😊",
    status: "视频通话中",
    tags: ["品质生活", "细致", "文艺青年", "社交达人"],
    isReal: false
  },
  {
    id: "7",
    name: "孙小明",
    age: 25,
    location: "成都新一线",
    avatar: "🙂",
    status: "准备中",
    tags: ["游戏爱好者", "科技控", "夜猫子", "创新思维"],
    isReal: false
  },
  {
    id: "8",
    name: "周丽娜",
    age: 30,
    location: "武汉新一线",
    avatar: "😍",
    status: "已完成",
    tags: ["美食达人", "旅行爱好者", "摄影师", "生活记录者"],
    isReal: false
  },
  {
    id: "9",
    name: "吴建华",
    age: 35,
    location: "西安新一线",
    avatar: "🤓",
    status: "等待中",
    tags: ["历史爱好者", "读书人", "传统文化", "深度思考"],
    isReal: false
  },
  {
    id: "10",
    name: "郑小芳",
    age: 26,
    location: "青岛二线",
    avatar: "😋",
    status: "视频通话中",
    tags: ["健身达人", "营养师", "早起族", "正能量"],
    isReal: false
  },
  {
    id: "11",
    name: "何志强",
    age: 31,
    location: "大连二线",
    avatar: "🤔",
    status: "准备中",
    tags: ["投资理财", "商业思维", "效率专家", "目标导向"],
    isReal: false
  },
  {
    id: "12",
    name: "林雅婷",
    age: 23,
    location: "厦门二线",
    avatar: "🥰",
    status: "已完成",
    tags: ["艺术创作", "手工制作", "小清新", "治愈系"],
    isReal: false
  },
  {
    id: "13",
    name: "马天宇",
    age: 28,
    location: "长沙新一线",
    avatar: "😃",
    status: "等待中",
    tags: ["音乐制作", "创意工作者", "夜生活", "潮流追随者"],
    isReal: false
  },
  {
    id: "14",
    name: "黄小慧",
    age: 29,
    location: "宁波二线",
    avatar: "😌",
    status: "视频通话中",
    tags: ["瑜伽教练", "冥想", "慢生活", "内心平静"],
    isReal: false
  },
  {
    id: "15",
    name: "谢建国",
    age: 33,
    location: "佛山二线",
    avatar: "😏",
    status: "准备中",
    tags: ["创业者", "风险投资", "商业洞察", "领导力"],
    isReal: false
  },
  {
    id: "16",
    name: "袁梦琪",
    age: 22,
    location: "苏州二线",
    avatar: "🤩",
    status: "已完成",
    tags: ["二次元", "动漫爱好者", "cosplay", "萌系文化"],
    isReal: false
  },
  {
    id: "17",
    name: "冯大海",
    age: 36,
    location: "烟台三线",
    avatar: "😤",
    status: "等待中",
    tags: ["户外运动", "登山爱好者", "冒险精神", "自然主义"],
    isReal: false
  },
  {
    id: "18",
    name: "蔡小雨",
    age: 24,
    location: "珠海二线",
    avatar: "🥳",
    status: "视频通话中",
    tags: ["派对达人", "社交媒体", "时尚博主", "生活分享"],
    isReal: false
  }
];

interface UserCardProps {
  user: User;
}

function UserCard({ user }: UserCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "视频通话中":
        return "text-green-600 bg-green-50";
      case "准备中":
        return "text-yellow-600 bg-yellow-50";
      case "已完成":
        return "text-blue-600 bg-blue-50";
      case "等待中":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* 头像和基本信息 */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
          {user.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
            {user.isReal && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                真实用户
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{user.age}岁 · 男</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{user.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 状态 */}
      <div className="mb-4">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
          <div className="w-2 h-2 bg-current rounded-full"></div>
          {user.status}
        </span>
      </div>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {user.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
          <MessageCircle className="w-4 h-4" />
          聊天
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
          <Phone className="w-4 h-4" />
          语音
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm">
          <Video className="w-4 h-4" />
          视频
        </button>
      </div>
    </div>
  );
}

export function InterviewCardList() {
  const [activeTab, setActiveTab] = useState<"real" | "simulated">("real");

  const realUsers = mockUsers.filter(user => user.isReal);
  const simulatedUsers = mockUsers.filter(user => !user.isReal);
  const currentUsers = activeTab === "real" ? realUsers : simulatedUsers;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* 标题和时间信息 */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          用户对淘宝宝贝记忆功能的使用情况和看法
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            进行中
          </span>
          <span>7月24日 16:00 开始 - 已进行 23 分钟</span>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>性别：全部</option>
            </select>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>年龄：全部</option>
            </select>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>城市：全部</option>
            </select>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>标签：全部</option>
            </select>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              重置筛选
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            <UserPlus className="w-4 h-4" />
            邀请真人用户
          </button>
        </div>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("real")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "real"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
          >
            真人用户 ({realUsers.length}人)
          </button>
          <button
            onClick={() => setActiveTab("simulated")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "simulated"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
          >
            模拟用户 ({simulatedUsers.length}人)
          </button>
        </div>
      </div>

      {/* 用户卡片网格 */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
}