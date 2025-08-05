"use client"

import { Button } from "@/components/ui/button"
import { X, Quote, Edit } from "lucide-react"

interface Diary {
  id: string
  content: string
  date: string
  images: string[]
  template: string
  highlight: string
  createdAt: string
}

interface DiaryDetailModalProps {
  diary: Diary | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (diary: Diary) => void
}

const templateStyles = {
  default: { bg: "bg-white", text: "text-stone-700", accent: "text-stone-600", border: "border-gray-200" },
  warm: { bg: "bg-orange-50", text: "text-orange-800", accent: "text-orange-600", border: "border-orange-200" },
  calm: { bg: "bg-blue-50", text: "text-blue-800", accent: "text-blue-600", border: "border-blue-200" },
  nature: { bg: "bg-green-50", text: "text-green-800", accent: "text-green-600", border: "border-green-200" },
  dreamy: { bg: "bg-purple-50", text: "text-purple-800", accent: "text-purple-600", border: "border-purple-200" },
}

export default function DiaryDetailModal({ diary, isOpen, onClose, onEdit }: DiaryDetailModalProps) {
  if (!isOpen || !diary) return null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日，${weekDays[date.getDay()]}`
  }

  const style = templateStyles[diary.template as keyof typeof templateStyles] || templateStyles.default

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-amber-50 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6">
          <Button
            onClick={() => onEdit?.(diary)}
            variant="ghost"
            className="p-2 hover:bg-amber-100 text-stone-600 rounded-full"
          >
            <Edit size={20} />
          </Button>
          <Button onClick={onClose} variant="ghost" className="p-2 hover:bg-amber-100 text-stone-500 rounded-full">
            <X size={20} />
          </Button>
        </div>

        {/* 日记卡片 */}
        <div className="px-6 pb-6">
          <div className={`p-6 rounded-2xl shadow-lg border ${style.bg} ${style.border}`}>
            {/* 日期标题 */}
            <h2 className={`text-xl font-bold mb-4 ${style.text}`}>{formatDate(diary.date)}</h2>

            {/* 高光时刻 */}
            {diary.highlight && (
              <blockquote className={`p-4 my-4 border-l-4 rounded-r-lg bg-white bg-opacity-50 border-current`}>
                <div className="flex items-start space-x-2">
                  <Quote size={16} className={`mt-1 flex-shrink-0 ${style.accent}`} />
                  <p className={`italic leading-relaxed ${style.accent}`}>"{diary.highlight}"</p>
                </div>
              </blockquote>
            )}

            {/* 图片展示 */}
            {diary.images.length > 0 && (
              <div className="my-4 grid grid-cols-2 gap-2">
                {diary.images.map((image, index) => (
                  <img
                    key={index}
                    src={image || "/placeholder.svg"}
                    alt={`日记图片${index + 1}`}
                    className="aspect-square object-cover bg-gray-200 rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* 正文内容 */}
            <article className={`prose prose-sm max-w-none ${style.text}`}>
              {diary.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-3 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </article>

            {/* 创建时间 */}
            <div className="mt-4 pt-4 border-t border-current border-opacity-20">
              <p className={`text-xs ${style.accent}`}>创建于 {new Date(diary.createdAt).toLocaleString("zh-CN")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
