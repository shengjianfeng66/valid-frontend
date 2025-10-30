import React, { useEffect, useState } from "react"
import { Anchor } from "antd"

export const ArticleNav: React.FC = () => {
  // 生成锚点列表
  let [anchorList, setAnchorList] = useState([])
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

  useEffect(() => {
    let hNodeList: any = document.querySelectorAll(".heading")
    //@ts-ignore
    setAnchorList(generateAnchorList(hNodeList))
    generateAnchorList(hNodeList)
  }, [])

  return (
    <>
      <Anchor
        items={anchorList}
        affix={false}
        // 这里把滚动的容器的类名改成自己的

        //@ts-ignore
        getContainer={() => document.querySelector(".basic_layout_container")}
      ></Anchor>
    </>
  )
}

export default ArticleNav
