"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Edit3, Send } from "lucide-react"
import DiaryEditModal from "./diary-edit-modal"
import { useChatMessages } from "@/hooks/useChatMessages"
import { useDiaries } from "@/hooks/useDiaries"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export default function ChatInterface() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDiaryModal, setShowDiaryModal] = useState(false)
  const [generatedDiary, setGeneratedDiary] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, addMessage } = useChatMessages()
  const { addDiary } = useDiaries()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const shouldShowGenerate = messages.filter((msg) => msg.role === "user").length >= 3

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return

    setIsLoading(true)
    
    // 添加用户消息到数据库
    await addMessage("user", userMessage.trim())
    setInput("")

    // 模拟AI回复
    setTimeout(async () => {
      const userMessageCount = messages.filter((msg) => msg.role === "user").length + 1
      let aiResponse = ""

      if (userMessageCount === 1) {
        aiResponse = "你好！今天做了些什么事呀？"
      } else if (userMessageCount === 2) {
        aiResponse = "听起来很棒呢！那你今天的心情如何？"
      } else if (userMessageCount === 3) {
        aiResponse =
          "我能感受到你的心情。每一天的感受都很珍贵，要不要把今天的经历记录下来呢？你可以点击下面的按钮生成今日日记哦～"
      } else {
        aiResponse = "我一直在这里陪伴你，有什么想聊的都可以告诉我哦～"
      }

      // 添加AI回复到数据库
      await addMessage("assistant", aiResponse)
      setIsLoading(false)
    }, 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    handleSendMessage(input.trim())
  }

  const handleGenerateDiary = async () => {
    if (messages.length === 0) {
      alert("请先与AI聊天，然后再生成日记")
      return
    }

    // 模拟日记内容生成
    const today = new Date()
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日}`

    let mood = "平静"
    let activities = "日常的各种事情"

    // 简单模拟从聊天记录中提取信息
    const userMessages = messages.filter((msg) => msg.role === "user")
    for (const message of userMessages) {
      const content = message.content.toLowerCase()
      if (content.includes("开心") || content.includes("快乐")) mood = "很开心"
      if (content.includes("工作") || content.includes("学习")) activities = "工作和学习"
      if (content.includes("运动") || content.includes("锻炼")) activities = "运动锻炼"
      if (content.includes("朋友") || content.includes("聚会")) activities = "与朋友聚会"
    }

    const diaryContent = `今天是${dateStr}，我今天感觉${mood}，我今天完成了${activities}。

回想起来，每一个平凡的日子都值得被记录和珍惜。感谢今天的经历，让我更加了解自己。`

    setGeneratedDiary(diaryContent)
    setShowDiaryModal(true)
  }

  const handleDiarySaved = async (content: string, template: string, images: string[], highlight: string) => {
    try {
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

      const { error } = await addDiary({
        content,
        date: dateStr,
        template,
        images,
        highlight,
      })

      if (error) {
        alert("保存日记失败，请重试")
      } else {
        alert("日记保存成功！")
        setShowDiaryModal(false)
      }
    } catch (error) {
      console.error("保存日记失败:", error)
      alert("保存失败，请重试")
    }
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Chat Messages Area */}
        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-16 h-16 mb-4 text-orange-300" />
              <h2 className="mb-2 text-lg font-medium text-stone-700">晚上好 ✨</h2>
              <p className="text-stone-500">今天过得怎么样？想聊点什么吗？</p>
              <p className="text-xs text-stone-400 mt-2">试试发送"你好"开始对话</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs p-3 rounded-t-2xl shadow-sm ${
                  message.role === "user"
                    ? "bg-orange-400 text-white rounded-bl-2xl"
                    : "bg-white text-stone-700 rounded-br-2xl"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs p-3 text-stone-700 bg-white rounded-t-2xl rounded-br-2xl shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-amber-100">
          {shouldShowGenerate && (
            <div className="mb-3">
              <Button
                onClick={handleGenerateDiary}
                className="w-full bg-amber-200 hover:bg-amber-300 text-stone-700 border-none"
                variant="outline"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                生成今日日记
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="聊点什么吧..."
              className="flex-grow bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-orange-300"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-orange-400 hover:bg-orange-500 text-white rounded-full"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* 日记编辑模态框 */}
      <DiaryEditModal
        isOpen={showDiaryModal}
        onClose={() => setShowDiaryModal(false)}
        initialContent={generatedDiary}
        onSave={handleDiarySaved}
      />
    </>
  )
}
