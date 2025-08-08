"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Save, ImageIcon } from "lucide-react"

interface DiaryEditModalProps {
  isOpen: boolean
  onClose: () => void
  initialContent: string
  onSave: (content: string, template: string, images: string[], highlight: string) => void
}

const templates = [
  { id: "default", name: "默认", color: "bg-white", textColor: "text-stone-700", borderColor: "border-gray-200" },
  { id: "warm", name: "温暖", color: "bg-orange-50", textColor: "text-orange-800", borderColor: "border-orange-200" },
  { id: "calm", name: "平静", color: "bg-blue-50", textColor: "text-blue-800", borderColor: "border-blue-200" },
  { id: "nature", name: "自然", color: "bg-green-50", textColor: "text-green-800", borderColor: "border-green-200" },
  { id: "dreamy", name: "梦幻", color: "bg-purple-50", textColor: "text-purple-800", borderColor: "border-purple-200" },
]

export default function DiaryEditModal({ isOpen, onClose, initialContent, onSave }: DiaryEditModalProps) {
  const [content, setContent] = useState(initialContent)
  const [selectedTemplate, setSelectedTemplate] = useState("default")
  const [images, setImages] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setContent(initialContent)
    setSelectedTemplate("default") // 重置模板
    setImages([]) // 重置图片
  }, [initialContent, isOpen]) // 当 initialContent 或 isOpen 改变时重置

  const handleSave = async () => {
    if (!content.trim()) {
      alert("请输入日记内容")
      return
    }

    setIsSaving(true)
    try {
      const highlight = extractHighlight(content)
      onSave(content, selectedTemplate, images, highlight)
      alert("日记保存成功！")
      onClose()
    } catch (error) {
      console.error("保存日记失败:", error)
      alert("保存失败，请重试")
    } finally {
      setIsSaving(false)
    }
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
    ]
    const sentences = text.split(/[。！？]/).filter((s) => s.trim())

    for (const sentence of sentences) {
      if (positiveWords.some((word) => sentence.includes(word))) {
        return sentence.trim()
      }
    }

    return sentences[0]?.trim() || ""
  }

  const handleImageUpload = () => {
    if (images.length < 3) {
      const newImage = `/placeholder.svg?height=100&width=100&text=图片${images.length + 1}`
      setImages([...images, newImage])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-stone-700">编辑日记</h2>
          <Button onClick={onClose} variant="ghost" className="p-2 hover:bg-gray-100 text-stone-500 rounded-full">
            <X size={20} />
          </Button>
        </div>

        {/* 内容区 */}
        <div className="p-6 space-y-6">
          {/* 文本编辑区 */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">日记内容</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              placeholder="记录今天的心情..."
            />
          </div>

          {/* 图片上传区 */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">添加图片</label>
            <div className="flex flex-wrap gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative w-20 h-20">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`图片${index + 1}`}
                    className="w-full h-full object-cover bg-gray-100 rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <button
                  onClick={handleImageUpload}
                  className="flex items-center justify-center w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors"
                >
                  <ImageIcon size={24} />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">最多可添加3张图片</p>
          </div>

          {/* 模板选择 */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">心情模板</label>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all ${template.color} ${template.borderColor} ${
                    selectedTemplate === template.id
                      ? "ring-2 ring-orange-300 border-orange-400"
                      : "hover:border-orange-300"
                  }`}
                >
                  <div className={`w-full h-full rounded-md flex items-center justify-center ${template.textColor}`}>
                    <span className="text-xs font-medium">{template.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 预览区 */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">预览</label>
            <div
              className={`p-4 rounded-lg border ${templates.find((t) => t.id === selectedTemplate)?.color} ${templates.find((t) => t.id === selectedTemplate)?.borderColor}`}
            >
              <p className={`text-sm leading-relaxed ${templates.find((t) => t.id === selectedTemplate)?.textColor}`}>
                {content || "在这里预览您的日记..."}
              </p>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-6 border-t border-gray-100">
          <Button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            <Save size={20} className="mr-2" />
            {isSaving ? "保存中..." : "保存日记"}
          </Button>
        </div>
      </div>
    </div>
  )
}
