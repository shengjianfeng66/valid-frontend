"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, FileText, AlignLeft, Globe, Youtube, Image, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTranslations } from "next-intl"
// 临时类型定义，直到安装 Ant Design 依赖
type AttachmentsProps = {
  items: any[]
  onChange: (params: { fileList: any[] }) => void
  beforeUpload: () => boolean
  placeholder: (type: string) => any
  getDropContainer: () => HTMLElement | null
}

type SenderProps = {
  ref: any
  header: React.ReactNode
  prefix: React.ReactNode
  value: string
  onChange: (value: string) => void
  onPasteFile: (e: any, files: File[]) => void
  onSubmit: () => void
  loading: boolean
  placeholder: string
}

// 允许的文件类型
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff'
]

// 检查文件类型是否允许
const isFileTypeAllowed = (file: File): boolean => {
  return ALLOWED_FILE_TYPES.includes(file.type.toLowerCase())
}

// 获取文件类型错误信息
const getFileTypeError = (file: File): string => {
  if (file.type.startsWith('image/')) {
    return `图片格式不支持，请使用 JPG、PNG、GIF、WebP、SVG、BMP、TIFF 格式`
  } else if (file.type === 'application/pdf') {
    return `文件类型不支持，请使用 PDF 或图片格式`
  } else {
    return `文件类型不支持，请使用 PDF 或图片格式`
  }
}

// 临时组件定义
const CloudUploadOutlined = () => <span>📁</span>
const LinkOutlined = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24">
    <path fill="currentColor" fillRule="evenodd" d="M9.035 15.956a1.29 1.29 0 0 0 1.821-.004l6.911-6.911a3.15 3.15 0 0 0 0-4.457l-.034-.034a3.15 3.15 0 0 0-4.456 0l-7.235 7.234a5.031 5.031 0 0 0 7.115 7.115l6.577-6.577a1.035 1.035 0 0 1 1.463 1.464l-6.576 6.577A7.1 7.1 0 0 1 4.579 10.32l7.235-7.234a5.22 5.22 0 0 1 7.382 0l.034.034a5.22 5.22 0 0 1 0 7.383l-6.91 6.91a3.36 3.36 0 0 1-4.741.012l-.006-.005-.012-.011a3.346 3.346 0 0 1 0-4.732L12.76 7.48a1.035 1.035 0 0 1 1.464 1.463l-5.198 5.198a1.277 1.277 0 0 0 0 1.805z" clipRule="evenodd"></path>
  </svg>
)
const App = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const AntButton = ({ type, icon, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    title="添加附件"
  >
    {icon}
  </button>
)
const Flex = ({ children, style, align }: any) => (
  <div style={style} className={`flex items-${align}`}>
    {children}
  </div>
)

// 临时 Attachments 组件
const Attachments = ({ ref, items, onChange, beforeUpload, placeholder, getDropContainer }: any) => {

  const removeItem = (uid: string) => {
    const newItems = items.filter((item: any) => item.uid !== uid)
    onChange({ fileList: newItems })
  }

  // 获取文件图标
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️'
    if (type.includes('text')) return '📃'
    if (type.includes('video')) return '🎥'
    if (type.includes('audio')) return '🎵'
    if (type.includes('zip') || type.includes('rar')) return '📦'
    return '📄'
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // 获取文件类型显示名称
  const getFileTypeName = (type: string) => {
    if (type.startsWith('image/')) return 'Image'
    if (type.includes('pdf')) return 'PDF'
    if (type.includes('word') || type.includes('document')) return 'Word'
    if (type.includes('excel') || type.includes('spreadsheet')) return 'Excel'
    if (type.includes('powerpoint') || type.includes('presentation')) return 'PowerPoint'
    if (type.includes('text')) return 'Text'
    if (type.includes('video')) return 'Video'
    if (type.includes('audio')) return 'Audio'
    if (type.includes('zip') || type.includes('rar')) return 'Archive'
    return 'File'
  }

  // 估算文本文件字数（仅对文本文件）
  const estimateWordCount = (size: number, type: string) => {
    if (!type.includes('text') && !type.includes('txt')) return null
    // 粗略估算：1KB ≈ 500-1000个中文字符
    const estimatedChars = Math.round(size * 0.5)
    if (estimatedChars > 1000) {
      return `约 ${Math.round(estimatedChars / 1000)} 万字`
    } else if (estimatedChars > 100) {
      return `约 ${Math.round(estimatedChars / 100) * 100} 字`
    }
    return `约 ${estimatedChars} 字`
  }

  return (
    <div className="space-y-2">
      {/* 已上传的文件列表 */}
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {items.map((item: any) => (
              <div key={item.uid} className="bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2 max-w-xs">
                {/* 图片缩略图或文件图标 */}
                <div className="flex-shrink-0">
                  {item.type.startsWith('image/') ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-8 h-8 object-cover rounded border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded border border-gray-200 flex items-center justify-center">
                      <div className="text-sm">{getFileIcon(item.type)}</div>
                    </div>
                  )}
                  {/* 备用图标（当图片加载失败时显示） */}
                  {item.type.startsWith('image/') && (
                    <div className="w-8 h-8 bg-blue-100 rounded border border-gray-200 flex items-center justify-center hidden">
                      <div className="text-sm">🖼️</div>
                    </div>
                  )}
                </div>

                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate" title={item.name}>
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getFileTypeName(item.type)} · {formatFileSize(item.size)}
                    {item.type.includes('text') && (
                      <span> · {estimateWordCount(item.size, item.type)}</span>
                    )}
                  </div>
                </div>

                {/* 删除按钮 */}
                <button
                  onClick={() => removeItem(item.uid)}
                  className="text-gray-400 hover:text-red-500 text-sm p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                  title="删除文件"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 临时 Sender 组件
const Sender = ({ ref, header, prefix, value, onChange, onPasteFile, onSubmit, loading, placeholder }: SenderProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动调整高度
  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const maxHeight = 120 // 最大高度 120px
      const minHeight = 40  // 最小高度 40px
      textarea.style.height = Math.min(Math.max(scrollHeight, minHeight), maxHeight) + 'px'
    }
  }

  // 当值变化时调整高度
  useEffect(() => {
    adjustHeight()
  }, [value])

  return (
    <div className="w-full">
      {header}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value)
                adjustHeight()
              }}
              placeholder={placeholder}
              className="w-full min-h-[40px] max-h-[120px] resize-none border-0 outline-none text-gray-900 placeholder-gray-500 overflow-hidden"
              style={{
                lineHeight: '24px',
                fontSize: '16px',
                height: '40px'
              }}
              onPaste={(e) => {
                const files = Array.from(e.clipboardData.files)
                if (files.length > 0) {
                  onPasteFile(e, files)
                } else {
                  // 处理粘贴的图片（从剪贴板）
                  const items = Array.from(e.clipboardData.items)
                  const imageItems = items.filter(item => item.type.startsWith('image/'))

                  if (imageItems.length > 0) {
                    // 检查是否超过最大数量限制
                    if (onPasteFile) {
                      const files = imageItems.map(item => item.getAsFile()).filter((file): file is File => file !== null)
                      onPasteFile(e, files)
                    }
                  }
                }
              }}
            />
          </div>
          <div className="flex justify-start">
            {prefix}
          </div>
        </div>
      </div>
    </div>
  )
}

Sender.Header = ({ title, children, open, onOpenChange }: any) => (
  <div className={`mb-2 ${open ? 'block' : 'hidden'}`}>
    {children}
  </div>
)

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
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const router = useRouter()
  const t = useTranslations("aiChat")

  const attachmentsRef = useRef<any>(null)
  const senderRef = useRef<any>(null)

  const handleSubmit = async (text?: string) => {
    const messageToSend = text || input.trim()
    if (!messageToSend) return

    setIsLoading(true)
    // 使用 sessionStorage 传递输入内容，避免 URL 过长
    const value = messageToSend.trim()
    try {
      sessionStorage.setItem('vf_initialMessage', value)
      // 存储附件信息
      if (items.length > 0) {
        const attachmentInfo = items.map((item: any) => ({
          name: item.name,
          size: item.size,
          type: item.type,
          url: item.url
        }))
        sessionStorage.setItem('vf_attachments', JSON.stringify(attachmentInfo))
      }
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
        <App>
          <Flex style={{ height: 220 }} align="end">
            <Sender
              ref={senderRef}
              header={
                <Sender.Header
                  title="附件"
                  styles={{
                    content: {
                      padding: 0,
                    },
                  }}
                  open={open}
                  onOpenChange={setOpen}
                  forceRender
                >
                  <Attachments
                    ref={attachmentsRef}
                    items={items}
                    onChange={({ fileList }: any) => setItems(fileList)}
                    placeholder={(type: any) =>
                      type === 'drop'
                        ? {
                          title: '拖拽文件到这里',
                        }
                        : {
                          icon: <CloudUploadOutlined />,
                          title: '上传文件',
                          description: '点击或拖拽文件到此区域上传',
                        }
                    }
                    getDropContainer={() => senderRef.current?.nativeElement}
                  />
                </Sender.Header>
              }
              prefix={
                <AntButton
                  type="text"
                  icon={<LinkOutlined />}
                  onClick={() => {
                    // 检查是否超过最大数量限制
                    if (items.length >= 3) {
                      alert('最多只能上传3个文件')
                      return
                    }

                    // 直接触发文件选择对话框
                    const fileInput = document.createElement('input')
                    fileInput.type = 'file'
                    fileInput.multiple = true
                    fileInput.accept = '.pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff'
                    fileInput.onchange = (e: any) => {
                      const files = Array.from(e.target.files || []) as File[]
                      if (files.length > 0) {
                        // 检查文件类型
                        const invalidFiles = files.filter(file => !isFileTypeAllowed(file))
                        if (invalidFiles.length > 0) {
                          alert(`以下文件类型不支持：\n${invalidFiles.map(f => f.name).join('\n')}\n\n请使用 PDF 或图片格式（JPG、PNG、GIF、WebP、SVG、BMP、TIFF）`)
                          return
                        }

                        // 计算还能添加多少个文件
                        const remainingSlots = 3 - items.length
                        const filesToAdd = files.slice(0, remainingSlots)

                        if (files.length > remainingSlots) {
                          alert(`最多只能上传3个文件，已选择${files.length}个文件，只能添加前${remainingSlots}个`)
                        }

                        const newItems = filesToAdd.map((file: File) => ({
                          uid: Math.random().toString(36).substr(2, 9),
                          name: file.name,
                          size: file.size,
                          type: file.type,
                          url: URL.createObjectURL(file),
                          status: 'done'
                        }))
                        setItems(prev => [...prev, ...newItems])
                        setOpen(true) // 显示附件区域
                      }
                    }
                    fileInput.click()
                  }}
                />
              }
              value={input}
              onChange={setInput}
              onPasteFile={(_, files) => {
                // 检查是否超过最大数量限制
                if (items.length >= 3) {
                  alert('最多只能上传3个文件')
                  return
                }

                // 检查文件类型
                const invalidFiles = files.filter(file => !isFileTypeAllowed(file))
                if (invalidFiles.length > 0) {
                  alert(`以下文件类型不支持：\n${invalidFiles.map(f => f.name || '未知文件').join('\n')}\n\n请使用 PDF 或图片格式（JPG、PNG、GIF、WebP、SVG、BMP、TIFF）`)
                  return
                }

                // 计算还能添加多少个文件
                const remainingSlots = 3 - items.length
                const filesToAdd = files.slice(0, remainingSlots)

                if (files.length > remainingSlots) {
                  alert(`最多只能上传3个文件，已选择${files.length}个文件，只能添加前${remainingSlots}个`)
                }

                // 处理粘贴的文件（包括图片）
                const newItems = filesToAdd.map((file: File) => ({
                  uid: Math.random().toString(36).substr(2, 9),
                  name: file.name || `粘贴文件_${Date.now()}.${file.type.split('/')[1]}`,
                  size: file.size,
                  type: file.type,
                  url: URL.createObjectURL(file),
                  status: 'done'
                }))
                setItems(prev => [...prev, ...newItems])
                setOpen(true);
              }}
              onSubmit={() => {
                handleSubmit(input);
                setItems([]);
                setInput('');
              }}
              loading={isLoading}
              placeholder={t("placeholder")}
            />
          </Flex>
        </App>

        {/* 开始分析按钮 */}
        <div className="flex justify-center">
          <Button
            onClick={() => handleSubmit(input)}
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
