import ReactMarkdown from "react-markdown" // 解析 markdown
import remarkGfm from "remark-gfm" // markdown 对表格/删除线/脚注等的支持
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import remarkGemoji from "remark-gemoji"
import rehypeRaw from "rehype-raw"

import React from "react"

interface Props {
  content: string
}

const MdPreview: React.FC<Props> = ({ content }) => {
  let index = 0
  return (
    <div className="space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkGemoji]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          code(props) {
            const { children, className, inline } = props as any
            if (inline) {
              return (
                <code className={`${className ?? ""} bg-gray-100 px-1.5 py-0.5 text-sm text-gray-800 rounded`}>
                  {children}
                </code>
              )
            }
            return (
              <pre className={`${className ?? ""} mb-5 min-h-0 bg-gray-50 p-4 rounded-md overflow-x-auto`}>
                <code className="text-sm leading-6">{String(children).replace(/\n$/, "")}</code>
              </pre>
            )
          },
          hr() {
            return <hr className="border-0 h-0.5 bg-gray-200 my-4" />
          },
          blockquote({ children }) {
            return <blockquote className="m-0 border-l-4 border-gray-200 pl-4 text-gray-600">{children}</blockquote>
          },
          img({ src, alt }) {
            return <img src={src || ""} alt={alt || ""} className="max-w-full" />
          },
          table({ children }) {
            return (
              <table className="block overflow-auto mb-4 w-full border-collapse border-spacing-0">{children}</table>
            )
          },
          thead({ children }) {
            return <thead className="bg-gray-50">{children}</thead>
          },
          tbody({ children }) {
            return <tbody className="[&>tr:nth-child(even)]:bg-gray-50">{children}</tbody>
          },
          tr({ children }) {
            return <tr className="odd:bg-white even:bg-gray-50">{children}</tr>
          },
          th({ children }) {
            return <th className="border border-gray-300 px-3 py-2 whitespace-nowrap">{children}</th>
          },
          td({ children }) {
            return <td className="border border-gray-300 px-3 py-2 whitespace-nowrap">{children}</td>
          },
          h1({ children }) {
            return (
              <h1 id={"heading-" + ++index} className="heading text-3xl font-semibold mt-6 mb-2">
                {children}
              </h1>
            )
          },
          h2({ children }) {
            return (
              <h2 id={"heading-" + ++index} className="heading text-2xl font-semibold mt-6 mb-2">
                {children}
              </h2>
            )
          },
          h3({ children }) {
            return (
              <h3 id={"heading-" + ++index} className="heading text-xl font-semibold mt-5 mb-2">
                {children}
              </h3>
            )
          },
          h4({ children }) {
            return (
              <h4 id={"heading-" + ++index} className="heading text-lg font-semibold mt-4 mb-2">
                {children}
              </h4>
            )
          },
          h5({ children }) {
            return (
              <h5 id={"heading-" + ++index} className="heading text-base font-semibold mt-3 mb-1.5">
                {children}
              </h5>
            )
          },
          h6({ children }) {
            return (
              <h6 id={"heading-" + ++index} className="heading text-sm font-semibold mt-2 mb-1">
                {children}
              </h6>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MdPreview
