import React, { useEffect, useState } from "react"

interface AnchorItem {
  key: string;
  href: string;
  title: string;
  level: number;
  children?: AnchorItem[];
}

export const ArticleNav: React.FC = () => {
  // 生成锚点列表
  const [anchorList, setAnchorList] = useState<AnchorItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  console.log("🚀 ~ anchorList:", anchorList)
  const generateAnchorList = (hNodeList: Array<HTMLElement>) => {
    if (hNodeList.length == 0) return []
    // 最终生成的列表
    let anchorList: any[] = []
    // 当前处理的dom元素索引
    let index = 0
    // 保存当前锚点信息
    let currentAnchor: any = {}

    // 逻辑主函数
    function transform(item: HTMLElement) {
      let anchor = createAnchor(item)
      if (anchorList.length == 0) {
        anchorList.push(anchor)
        currentAnchor = anchor
        return
      }
      // 如果标签的大小递增，则往children中添加
      if (anchor.level > currentAnchor.level) {
        currentAnchor.children = currentAnchor?.children ?? []
        recursionFn(currentAnchor.children, anchor)
      }
      // 如果当前处理的anchor和保存的anchor层级相同，则判断为当前保存anchor层级的元素处理完毕
      else {
        anchorList.push(anchor)
        currentAnchor = anchor
      }
    }

    // 递归查询到相同的level，并处理
    function recursionFn(curChildren: any | any[], anchor: any) {
      if (curChildren.length == 0 || curChildren[0].level == anchor.level) {
        curChildren.push(anchor)
      } else if (curChildren[0].level < anchor.level) {
        // 顺序遍历，永远是往最后加
        let lastIndex = curChildren.length - 1
        curChildren[lastIndex].children = curChildren[lastIndex]?.children ?? []
        recursionFn(curChildren[lastIndex].children, anchor)
      }
    }

    // 创建锚点信息
    function createAnchor(item: HTMLElement) {
      let level = Number(item.nodeName.split("")[1])
      let anchor: any = {
        key: "",
        href: "",
        title: "",
        level, // h标签的层级
      }
      anchor.title = item.innerHTML
      anchor.href = `#heading-${++index}`
      anchor.key = anchor.href
      return anchor
    }

    for (let item of hNodeList) {
      transform(item)
    }
    return anchorList
  }

  // 监听滚动，更新激活的锚点
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll<HTMLElement>(".heading")
      const scrollTop = window.scrollY || document.documentElement.scrollTop

      let currentId = ""
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 100) {
          currentId = heading.id
        }
      })

      if (currentId) {
        setActiveId(currentId)
      }
    }

    const scrollContainer = document.querySelector('[role="tabpanel"][data-state="active"]')
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll)
      return () => scrollContainer.removeEventListener("scroll", handleScroll)
    }
  }, [anchorList])

  useEffect(() => {
    // 延迟执行，确保 MdPreview 组件已经渲染完成
    const timer = setTimeout(() => {
      const hNodeList = document.querySelectorAll<HTMLElement>(".heading")
      console.log("🔍 Found heading elements:", hNodeList.length)
      const anchors = generateAnchorList(Array.from(hNodeList))
      setAnchorList(anchors)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // 渲染目录项
  const renderAnchorItem = (item: AnchorItem, depth: number = 0) => {
    const isActive = activeId === item.href.slice(1) // 移除 # 号

    return (
      <div key={item.key}>
        <a
          href={item.href}
          className={`
            block py-1.5 text-sm transition-colors
            ${depth === 0 ? "pl-0" : `pl-${depth * 3}`}
            ${isActive
              ? "text-primary font-medium border-l-2 border-primary -ml-0.5 pl-2"
              : "text-gray-600 hover:text-gray-900 border-l-2 border-transparent -ml-0.5 pl-2"
            }
          `}
          onClick={(e) => {
            e.preventDefault()
            const target = document.querySelector(item.href)
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "start" })
              setActiveId(item.href.slice(1))
            }
          }}
        >
          <span className="line-clamp-2">{item.title}</span>
        </a>
        {item.children && item.children.length > 0 && (
          <div className="ml-3">
            {item.children.map((child) => renderAnchorItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className="space-y-1" aria-label="文档目录">
      {anchorList.length > 0 ? (
        <>
          {anchorList.map((item) => renderAnchorItem(item, 0))}
        </>
      ) : (
        <div className="text-sm text-gray-500">正在加载目录...</div>
      )}
    </nav>
  )
}

export default ArticleNav
