"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Edit3, Send } from "lucide-react"
import ChatSidebar from "./chat-sidebar"
import MigrationNotice from "./migration-notice"
import { useChatMessages } from "@/hooks/useChatMessages"
import { useDiaries } from "@/hooks/useDiaries"
import { getTodayString } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ChatInterface() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showMigrationNotice, setShowMigrationNotice] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // 新增状态用于处理AI流式响应
  const [streamingAiContent, setStreamingAiContent] = useState<string>("")

  const { messages, loading, chatDates, migrationNeeded, addMessage, clearMessages, refreshChatDates } =
    useChatMessages(selectedDate)
  const { addDiary } = useDiaries()

  // 检查是否需要显示迁移提示
  useEffect(() => {
    if (migrationNeeded) {
      setShowMigrationNotice(true)
    }
  }, [migrationNeeded])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingAiContent])

  // 判断是否应该显示"生成今日日记"按钮 - 只有今天的聊天记录才显示
  const shouldShowGenerate =
    selectedDate === getTodayString() && messages.filter((msg) => msg.role === "user").length >= 3

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return

    setIsLoading(true)
    setStreamingAiContent("")

    // 1. 添加用户消息到 Supabase
    await addMessage("user", userMessage.trim(), selectedDate)
    setInput("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 发送当前日期的所有消息作为上下文
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage.trim() }].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let receivedText = ""

      while (true) {
        const { done, value } = await reader?.read()!
        if (done) break
        receivedText += decoder.decode(value, { stream: true })
        setStreamingAiContent(receivedText)
      }

      // 2. AI 响应完成后，将完整的 AI 消息保存到 Supabase
      await addMessage("assistant", receivedText, selectedDate)
    } catch (error) {
      console.error("发送消息失败:", error)
      setStreamingAiContent("抱歉，AI 暂时无法响应，请稍后再试。")
      alert("发送消息失败，请检查网络或稍后再试。")
    } finally {
      setIsLoading(false)
      setStreamingAiContent("")
    }
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

    setIsLoading(true)
    try {
      const response = await fetch("/api/generate-diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 发送今天的完整聊天历史
        body: JSON.stringify({
          chatHistory: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || "Unknown error"}`)
      }

      const { diary } = await response.json()

      // 跳转到日记编辑页面，传递生成的内容和日期
      router.push(`/diary/edit?date=${selectedDate}&content=${encodeURIComponent(diary)}`)
    } catch (error) {
      console.error("生成日记失败:", error)
      alert("生成日记失败，请稍后再试。")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
  }

  const handleClearChat = async (date: string) => {
    await clearMessages(date)
    await refreshChatDates()
  }

  const isToday = selectedDate === getTodayString()

  return (
    <>
      {/* 使用固定高度的容器 */}
      <div className="h-screen flex bg-amber-50 overflow-hidden">
        {/* 固定左侧侧边栏 - 完全固定高度 */}
        <div className="flex-shrink-0 h-full">
          <ChatSidebar
            chatDates={chatDates}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onClearChat={handleClearChat}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* 主聊天区域 - 自适应剩余空间 */}
        <div className="flex-1 flex flex-col min-w-0 bg-amber-50 h-full">
          {/* Header - 固定在顶部 */}
          <div className="flex-shrink-0 p-4 bg-white border-b border-amber-100">
            <h1 className="text-xl font-semibold text-stone-700 text-center">
              心语迹{" "}
              {!isToday && `- ${new Date(selectedDate).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}`}
            </h1>
            {migrationNeeded && (
              <div className="mt-2 text-center">
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">兼容模式运行中</span>
              </div>
            )}
          </div>

          {/* Chat Messages Area - 可滚动区域，占据剩余高度 */}
          <div className="flex-1 overflow-y-auto bg-amber-50">
            <div className="p-4 space-y-4 min-h-full">
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-16 h-16 mb-4 text-orange-300" />
                  <h2 className="mb-2 text-lg font-medium text-stone-700">{isToday ? "晚上好 ✨" : "回顾往日对话"}</h2>
                  <p className="text-stone-500">
                    {isToday ? "今天过得怎么样？想聊点什么吗？" : "查看这一天的聊天记录"}
                  </p>
                  {isToday && <p className="text-xs text-stone-400 mt-2">试试发送"你好"开始对话</p>}
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

              {/* 显示流式 AI 内容 */}
              {isLoading && streamingAiContent && (
                <div className="flex justify-start">
                  <div className="max-w-xs p-3 text-stone-700 bg-white rounded-t-2xl rounded-br-2xl shadow-sm">
                    <p className="text-sm leading-relaxed">{streamingAiContent}</p>
                  </div>
                </div>
              )}

              {/* 加载动画 */}
              {isLoading && !streamingAiContent && (
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
          </div>

          {/* Input Area - 固定在底部，只有今天才能发送消息 */}
          {isToday && (
            <div className="flex-shrink-0 p-4 bg-white border-t border-amber-100">
              {shouldShowGenerate && (
                <div className="mb-3">
                  <Button
                    onClick={handleGenerateDiary}
                    className="w-full bg-amber-200 hover:bg-amber-300 text-stone-700 border-none"
                    variant="outline"
                    disabled={isLoading}
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
          )}
        </div>
      </div>

      {/* 迁移提示模态框 */}
      {showMigrationNotice && <MigrationNotice onDismiss={() => setShowMigrationNotice(false)} />}
    </>
  )
}
