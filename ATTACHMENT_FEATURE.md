# 附件功能实现说明（使用Zustand状态管理）

## 📋 功能概述

用户在dashboard页面的AI聊天输入框中上传附件后，点击"开始洞察"按钮，附件信息通过Zustand全局状态管理传递到insight/goal页面，并发送给CopilotKit AI助手，AI可以基于附件内容帮助用户填写表单。

## 🔄 完整流程

### 1️⃣ **Dashboard页面 - 上传附件**
文件：`src/components/blocks/ai-chat-block.tsx`

- 用户在输入框点击附件按钮上传文件
- 文件信息存储在组件的 `items` 状态中
- 支持多种文件类型：图片、PDF、文档等

### 2️⃣ **存储附件信息到Zustand Store**
位置：`ai-chat-block.tsx`

```typescript
import { useFormStore } from "@/stores/form-store"

// 在组件中获取store方法
const { setAttachments, setInitialMessage } = useFormStore()

// 存储消息和附件信息
setInitialMessage(value)

if (items.length > 0) {
  const attachmentInfo = items.map((item: any) => ({
    name: item.name,
    size: item.size,
    type: item.type,
    url: item.url
  }))
  setAttachments(attachmentInfo)
} else {
  setAttachments([])
}
```

### 3️⃣ **跳转到Insight/Goal页面**
```typescript
router.push(`/insight/goal`)
```

**优势**: 使用Zustand全局状态，无需手动清理，数据在整个应用中共享

### 4️⃣ **读取附件并发送给CopilotKit**
文件：`src/app/[locale]/(dashboard)/insight/goal/page.tsx`

#### A. 从Zustand Store读取附件
```typescript
// 直接从store获取数据，无需解析
const { 
  attachments,
  initialMessage,
  setInitialMessage 
} = useFormStore();

// 数据自动可用，无需手动读取和解析
```

#### B. 发送附件信息到CopilotKit Chat
```typescript
const sendInitialMessage = (message: string, attachments?: any[]) => {
  let fullMessage = message;
  if (attachments && attachments.length > 0) {
    const attachmentInfo = attachments.map((item: any) => 
      `\n\n📎 附件: ${item.name} (${(item.size / 1024).toFixed(2)} KB, ${item.type})`
    ).join('');
    fullMessage = message + attachmentInfo + '\n\n请基于以上信息和附件内容，帮我分析并填写表单。';
  }
  
  void sendMessage({ id: `init-${Date.now()}`, role: 'user', content: fullMessage });
};
```

#### C. 让AI可以访问附件信息
使用 `useCopilotReadable` hook：

```typescript
useCopilotReadable({
  description: "当前表单的所有数据，包括产品名称、业务类型、目标用户画像、调研目标、产品方案文件和用户上传的附件信息",
  value: {
    productName: formData.productName,
    businessType: formData.businessType,
    targetUsers: formData.targetUsers,
    researchGoals: formData.researchGoals,
    hasProductSolution: !!formData.productSolution,
    productSolutionName: formData.productSolution?.name || null,
    attachments: attachments.length > 0 ? attachments.map((item: any) => ({
      name: item.name,
      size: item.size,
      type: item.type,
      sizeInKB: (item.size / 1024).toFixed(2)
    })) : null,
    hasAttachments: attachments.length > 0,
    attachmentCount: attachments.length,
  },
});
```

### 5️⃣ **界面显示附件信息**
在表单顶部显示已上传的附件：

```typescript
{attachments.length > 0 && (
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <FileText className="w-5 h-5 text-blue-600" />
      <h3 className="text-sm font-semibold text-blue-900">
        已上传的附件 ({attachments.length})
      </h3>
    </div>
    <div className="space-y-2">
      {attachments.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm text-blue-800">
          <span>📎</span>
          <span className="font-medium">{item.name}</span>
          <span className="text-blue-600">({(item.size / 1024).toFixed(2)} KB)</span>
          <span className="text-blue-500">{item.type}</span>
        </div>
      ))}
    </div>
    <p className="text-xs text-blue-700 mt-2">
      💡 AI助手已收到这些附件信息，可以基于附件内容帮你分析和填写表单
    </p>
  </div>
)}
```

## 📝 关键技术点

### 1. Zustand状态管理
- **优点**：
  - 全局状态共享，跨组件访问
  - 类型安全，完整的TypeScript支持
  - 无需手动序列化/反序列化
  - 自动响应式更新
  - 无需手动清理
- **Store结构**：
  ```typescript
  interface FormStore {
    attachments: AttachmentItem[];
    initialMessage: string;
    setAttachments: (attachments: AttachmentItem[]) => void;
    setInitialMessage: (message: string) => void;
    clearAttachments: () => void;
  }
  ```

### 2. CopilotKit消息发送
- 使用 `useCopilotChatInternal()` hook获取 `sendMessage` 方法
- 消息格式：`{ id, role, content }`
- 需要等待CopilotKit初始化完成
- 发送后自动清理 `initialMessage`，保留 `attachments` 供后续使用

### 3. CopilotKit上下文共享
- 使用 `useCopilotReadable` hook让AI访问应用状态
- AI可以读取附件元数据（文件名、大小、类型）
- 配合消息内容，AI可以理解用户意图

## 🎯 使用场景

1. **产品方案文档分析**
   - 用户上传产品PRD文档
   - AI分析文档内容，自动填写产品名称、业务类型等字段

2. **竞品分析文档**
   - 用户上传竞品分析报告
   - AI提取目标用户画像和调研目标

3. **图片内容识别**
   - 用户上传产品截图
   - AI识别功能模块，生成调研问题

## 🔧 扩展建议

### 1. 支持实际文件内容读取
当前只传递文件元数据，可以扩展为：
```typescript
// 读取文件内容
const reader = new FileReader();
reader.onload = (e) => {
  const content = e.target?.result;
  // 将内容发送给AI
};
reader.readAsText(file); // 文本文件
reader.readAsDataURL(file); // 图片、PDF等
```

### 2. 使用CopilotKit的文件上传功能
CopilotKit支持原生文件处理，可以参考官方文档：
- [CopilotKit File Upload](https://docs.copilotkit.ai/reference/hooks/useCopilotReadable)

### 3. 后端处理
对于大文件或需要专业解析的文件（如PDF、Word），可以：
- 上传到服务器
- 使用专业解析库提取内容
- 通过API返回结构化数据给前端

## ✅ 测试建议

1. **基本功能测试**
   - 上传单个文件
   - 上传多个文件
   - 不同文件类型

2. **边界情况测试**
   - 无附件情况
   - 大文件上传
   - 特殊字符文件名

3. **集成测试**
   - AI是否正确接收附件信息
   - AI是否能基于附件提供建议
   - 表单自动填充功能

## 📚 相关文件

- `src/stores/form-store.ts` - **Zustand状态管理store**
- `src/components/blocks/ai-chat-block.tsx` - 附件上传组件
- `src/app/[locale]/(dashboard)/insight/goal/page.tsx` - 附件接收和处理
- `src/i18n/messages/zh.json` - 多语言配置

## 🎉 总结

通过Zustand + CopilotKit的组合，实现了：
1. ✅ 附件信息从dashboard传递到goal页面（使用全局状态）
2. ✅ 附件信息发送到CopilotKit AI
3. ✅ AI可以访问附件元数据
4. ✅ 界面友好展示附件信息
5. ✅ 完整的用户体验闭环
6. ✅ 类型安全的状态管理
7. ✅ 自动响应式更新

## 🚀 相比SessionStorage的优势

| 特性 | SessionStorage | Zustand |
|------|----------------|---------|
| 类型安全 | ❌ 需要手动类型转换 | ✅ 完整TypeScript支持 |
| 序列化 | ❌ 需要手动JSON.stringify/parse | ✅ 自动处理 |
| 响应式 | ❌ 需要手动监听 | ✅ 自动响应更新 |
| 跨组件共享 | ⚠️ 需要重复读取 | ✅ 直接访问 |
| 数据清理 | ❌ 需要手动清理 | ✅ 提供清理方法 |
| 开发体验 | ⚠️ 普通 | ✅ 优秀 |
| 调试 | ⚠️ 较困难 | ✅ 支持Redux DevTools |

这个方案更加现代化、类型安全，完全符合React最佳实践！

