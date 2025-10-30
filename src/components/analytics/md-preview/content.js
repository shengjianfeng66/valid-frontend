// Mock markdown content for preview/demo
const mockMarkdown = `
# 产品分析报告

> 本文展示了 markdown 的常见元素与渲染效果。

## 1. 关键结论
- 用户新增环比增长 23%
- 留存小幅提升至 38%
- 主要流失原因为「注册流程复杂」

## 2. 指标概览
| 指标 | 本周 | 上周 | 环比 |
| ---- | ---- | ---- | ---- |
| 新增用户 | 2,345 | 1,905 | +23% |
| DAU | 6,210 | 5,880 | +5.6% |
| 留存率 | 38% | 36% | +2pp |

## 3. 代码示例




## 4. 数学公式
注册完成率的简化估算：

$$\\text{Completion} = \\frac{\\text{Reached Step N}}{\\text{Started}}$$

## 5. 待办与提示
- [x] 修复注册短信超时问题
- [ ] 优化埋点字段命名

> 提示：可通过 A/B 验证表单长度对转化率的影响。

---

感谢阅读。
`

export default mockMarkdown
