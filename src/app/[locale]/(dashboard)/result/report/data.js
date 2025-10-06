// Markdown 测试内容
export const markdownTestContent = `# Markdown 渲染测试文档

这是一份用于测试 Markdown 渲染效果的示例文档，包含了各种常用的 Markdown 语法。

## 基础文本格式

### 段落和换行
这是一个普通段落，包含了一些**粗体文本**和*斜体文本*。我们还可以使用~~删除线~~来标记已删除的内容。

### 列表

#### 无序列表
- 第一项
- 第二项
  - 嵌套项目 1
  - 嵌套项目 2
- 第三项

#### 有序列表
1. 第一步：准备环境
2. 第二步：安装依赖
   1. 安装核心包
   2. 安装插件
3. 第三步：配置项目

## 代码相关

### 行内代码
使用 \`console.log()\` 来输出调试信息。

### 代码块
\`\`\`javascript
// JavaScript 代码示例
function generateTOC(content) {
  const headings = content.match(/^(#{1,6})\\s(.+)/gm) || []
  return headings.map((heading, index) => {
    const level = heading.match(/^#+/)[0].length
    const title = heading.replace(/^#+\\s/, '')
    const id = title.toLowerCase().replace(/\\s+/g, '-')
    return { level, title, id, index }
  })
}
\`\`\`

\`\`\`python
# Python 代码示例
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

## 表格

| 功能 | 状态 | 优先级 | 描述 |
|------|------|--------|------|
| 用户登录 | ✅ 完成 | 高 | 支持多种登录方式 |
| 数据导出 | 🚧 进行中 | 中 | 支持 Excel 和 PDF 格式 |
| 消息推送 | ❌ 未开始 | 低 | 实时消息通知功能 |

## 链接和图片

### 链接
- [GitHub 仓库](https://github.com/example/repo)
- [项目文档](https://docs.example.com)
- [邮箱联系](mailto:contact@example.com)

### 图片
![示例图片](https://via.placeholder.com/400x200/4CAF50/FFFFFF?text=Markdown+Test)

## 引用和分割线

> 这是一个引用块，通常用于引用他人的话或者重要的说明。
> 
> 可以包含多行内容，并且支持**格式化**。

---

## 任务列表

- [x] 完成项目初始化
- [x] 配置开发环境
- [ ] 编写单元测试
- [ ] 部署到生产环境
- [ ] 编写用户文档

## 高级功能

### HTML 标签
<details>
<summary>点击展开详细信息</summary>

这里是可以折叠的详细内容。

- 支持 Markdown 语法
- 可以包含代码块
- 支持嵌套结构

</details>

## 表情符号和特殊字符

### 表情符号
😀 😁 😂 🤣 😃 😄 😅 😆 😉 😊 😋 😎 😍 😘 🥰 😗 😙 😚 😇 🤗 🤩 🤔 🤨 😐 😑 😶 🙄 😏 😣 😥 😮 🤐 😯 😪 😫 😴 😌 😛 😜 😝 🤤 😒 😓 😔 😕 🙃 🤑 😲 ☹️ 🙁 😖 😞 😟 😤 😢 😭 😦 😧 😨 😩 🤯 😬 😰 😱 🥵 🥶 😳 🤪 🤫 🤭 🤬 🤯 😶 😐 😑

### 特殊字符
© 版权符号
® 注册商标
™ 商标符号
€ 欧元符号
£ 英镑符号
¥ 日元符号
° 度数符号
± 正负号
× 乘号
÷ 除号
≤ 小于等于
≥ 大于等于
≠ 不等于
≈ 约等于
∞ 无穷大

## 总结

这份文档包含了 Markdown 的大部分常用语法，可以用来测试各种 Markdown 渲染器的效果。通过观察不同元素的渲染结果，可以评估渲染器的质量和功能完整性。

### 测试要点
1. **标题层级**：检查 6 级标题的样式和间距
2. **代码高亮**：验证不同语言的语法高亮效果
3. **表格样式**：检查表格的边框和对齐
4. **响应式设计**：在不同屏幕尺寸下的显示效果

---

*文档生成时间：2024年12月*`;