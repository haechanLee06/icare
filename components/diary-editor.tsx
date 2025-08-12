"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Upload, Palette, Sticker } from "lucide-react"
import { useDiaries } from "@/hooks/useDiaries"

interface DiaryEditorProps {
  initialContent: string
  date: string
  onBack: () => void
}

const templates = [
  { id: "default", name: "默认", bg: "bg-white", text: "text-stone-700", accent: "text-stone-600" },
  { id: "warm", name: "温暖", bg: "bg-orange-50", text: "text-orange-800", accent: "text-orange-600" },
  { id: "calm", name: "平静", bg: "bg-blue-50", text: "text-blue-800", accent: "text-blue-600" },
  { id: "nature", name: "自然", bg: "bg-green-50", text: "text-green-800", accent: "text-green-600" },
  { id: "dreamy", name: "梦幻", bg: "bg-purple-50", text: "text-purple-800", accent: "text-purple-600" },
]

const stickers = [
  { id: "heart", emoji: "❤️", name: "爱心" },
  { id: "star", emoji: "⭐", name: "星星" },
  { id: "sun", emoji: "☀️", name: "太阳" },
  { id: "moon", emoji: "🌙", name: "月亮" },
  { id: "flower", emoji: "🌸", name: "花朵" },
  { id: "coffee", emoji: "☕", name: "咖啡" },
  { id: "book", emoji: "📖", name: "书本" },
  { id: "music", emoji: "🎵", name: "音乐" },
  { id: "camera", emoji: "📷", name: "相机" },
  { id: "rainbow", emoji: "🌈", name: "彩虹" },
]

export default function DiaryEditor({ initialContent, date, onBack }: DiaryEditorProps) {
  const [content, setContent] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("default")
  const [images, setImages] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [placedStickers, setPlacedStickers] = useState<Array<{ id: string; emoji: string; x: number; y: number }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const diaryPageRef = useRef<HTMLDivElement>(null)

  const { addDiary, updateDiary } = useDiaries()

  // 确保初始内容正确设置
  useEffect(() => {
    console.log("DiaryEditor - 接收到的初始内容:", initialContent)
    if (initialContent) {
      setContent(initialContent)
    }
  }, [initialContent])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日，${weekDays[date.getDay()]}`
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImages((prev) => [...prev, result])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStickerClick = (sticker: { id: string; emoji: string }) => {
    // 在日记页面中央添加贴纸
    const newSticker = {
      ...sticker,
      x: Math.random() * 300 + 50, // 随机位置
      y: Math.random() * 200 + 100,
    }
    setPlacedStickers((prev) => [...prev, newSticker])
  }

  const removePlacedSticker = (index: number) => {
    setPlacedStickers((prev) => prev.filter((_, i) => i !== index))
  }

  const extractHighlight = (text: string) => {
    const positiveWords = [
      "开心",
      "快乐",
      "满足",
      "成功",
      "美好",
      "温暖",
      "感动",
      "惊喜",
      "值得",
      "幸福",
      "治愈",
      "舒服",
      "放松",
      "充实",
      "有意义",
    ]
    const sentences = text.split(/[。！？]/).filter((s) => s.trim())

    for (const sentence of sentences) {
      if (positiveWords.some((word) => sentence.includes(word))) {
        return sentence.trim()
      }
    }

    return sentences[0]?.trim() || ""
  }

  const handleSave = async () => {
    if (!content.trim()) {
      alert("请输入日记内容")
      return
    }

    setIsSaving(true)
    try {
      const highlight = extractHighlight(content)

      const { error } = await addDiary({
        content,
        date,
        template: selectedTemplate,
        images,
        highlight,
      })

      if (error) {
        console.error("保存日记失败:", error)
        alert("保存日记失败，请重试")
      } else {
        alert("日记保存成功！")
        onBack()
      }
    } catch (error) {
      console.error("保存日记失败:", error)
      alert("保存失败，请重试")
    } finally {
      setIsSaving(false)
    }
  }

  const currentTemplate = templates.find((t) => t.id === selectedTemplate) || templates[0]

  return (
    <div className="min-h-screen bg-amber-50 flex">
      {/* 左侧工具栏 */}
      <div className="w-64 bg-white border-r border-amber-200 flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-amber-100">
          <Button onClick={onBack} variant="ghost" className="mb-4 p-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h2 className="text-lg font-semibold text-stone-700">编辑工具</h2>
        </div>

        {/* 图片上传 */}
        <div className="p-4 border-b border-amber-100">
          <h3 className="text-sm font-medium text-stone-600 mb-3">添加图片</h3>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full mb-3">
            <Upload className="w-4 h-4 mr-2" />
            上传图片
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`上传图片${index + 1}`}
                    className="w-full h-16 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 心情模板 */}
        <div className="p-4 border-b border-amber-100">
          <h3 className="text-sm font-medium text-stone-600 mb-3">心情模板</h3>
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`w-full p-3 rounded-lg border-2 transition-all ${template.bg} ${template.text} ${
                  selectedTemplate === template.id
                    ? "border-orange-400 ring-2 ring-orange-200"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Palette className="w-4 h-4" />
                  <span className="text-sm font-medium">{template.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="p-4 mt-auto">
          <Button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="w-full bg-orange-400 hover:bg-orange-500 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "保存中..." : "保存日记"}
          </Button>
        </div>
      </div>

      {/* 中间日记本页面 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative">
          {/* 日记本背景 */}
          <div className="w-[600px] h-[800px] bg-white rounded-lg shadow-2xl border border-gray-200 relative overflow-hidden">
            {/* 装订线 */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-red-100 border-r-2 border-red-200">
              <div className="flex flex-col items-center justify-center h-full space-y-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-red-300 rounded-full"></div>
                ))}
              </div>
            </div>

            {/* 日记内容区域 */}
            <div
              ref={diaryPageRef}
              className={`ml-12 p-8 h-full ${currentTemplate.bg} ${currentTemplate.text} relative`}
            >
              {/* 日期标题 */}
              <h1 className="text-2xl font-bold mb-6 text-center">{formatDate(date)}</h1>

              {/* AI生成内容提示 */}
              {initialContent && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">✨ AI为您生成的日记内容</p>
                  <p className="text-xs text-blue-500">您可以在下方编辑和完善这些内容</p>
                </div>
              )}

              {/* 图片展示 */}
              {images.length > 0 && (
                <div className="mb-6 grid grid-cols-2 gap-3">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`日记图片${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                    />
                  ))}
                </div>
              )}

              {/* 文本编辑区 */}
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={initialContent ? "编辑AI生成的内容..." : "在这里记录今天的心情..."}
                className={`w-full h-96 resize-none border-none bg-transparent ${currentTemplate.text} placeholder:${currentTemplate.accent} focus:ring-0 focus:outline-none text-base leading-relaxed`}
                style={{ fontFamily: "serif" }}
              />

              {/* 放置的贴纸 */}
              {placedStickers.map((sticker, index) => (
                <div
                  key={index}
                  className="absolute cursor-pointer hover:scale-110 transition-transform"
                  style={{ left: sticker.x, top: sticker.y }}
                  onClick={() => removePlacedSticker(index)}
                  title="点击删除贴纸"
                >
                  <span className="text-2xl">{sticker.emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 右侧贴纸库 */}
      <div className="w-64 bg-white border-l border-amber-200 flex flex-col">
        <div className="p-4 border-b border-amber-100">
          <h2 className="text-lg font-semibold text-stone-700 flex items-center">
            <Sticker className="w-5 h-5 mr-2" />
            贴纸库
          </h2>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            {stickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleStickerClick(sticker)}
                className="p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
                title={sticker.name}
              >
                <div className="text-2xl mb-1">{sticker.emoji}</div>
                <div className="text-xs text-stone-500">{sticker.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
