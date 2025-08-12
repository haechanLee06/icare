"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DiaryEditor from "@/components/diary-editor"
import { getTodayString } from "@/lib/supabase"

function DiaryEditContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [initialContent, setInitialContent] = useState("")
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const date = searchParams.get("date") || getTodayString()
    const content = searchParams.get("content") || ""

    console.log("页面接收到的参数:")
    console.log("- date:", date)
    console.log("- content:", content)
    console.log("- decoded content:", decodeURIComponent(content))

    setSelectedDate(date)
    if (content) {
      setInitialContent(decodeURIComponent(content))
    }
    setIsLoading(false)
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
          <p className="mt-2 text-stone-600">加载中...</p>
        </div>
      </div>
    )
  }

  return <DiaryEditor initialContent={initialContent} date={selectedDate} onBack={() => router.back()} />
}

export default function DiaryEditPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-amber-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
            <p className="mt-2 text-stone-600">加载中...</p>
          </div>
        </div>
      }
    >
      <DiaryEditContent />
    </Suspense>
  )
}
