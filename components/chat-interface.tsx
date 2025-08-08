"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Edit3, Send } from 'lucide-react'
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
  
  // 新增状态用于处理AI流式响应
  const [streamingAiContent, setStreamingAiContent] = useState<string>("");
  // const [streamingAiMessageId, setStreamingAiMessageId] = useState<string | null>(null); // 暂时不需要这个ID，因为我们只显示一个流式消息

  const { messages, addMessage } = useChatMessages() // `messages` 和 `addMessage` 来自 Hook
  const { addDiary } = useDiaries()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingAiContent]) // 监听 messages 和 streamingAiContent 变化以滚动

  // 判断是否应该显示"生成今日日记"按钮
  const shouldShowGenerate = messages.filter((msg) => msg.role === "user").length >= 3

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setIsLoading(true);
    setStreamingAiContent(""); // 清空之前的流式内容

    // 1. 添加用户消息到 Supabase (通过 Hook)
    await addMessage("user", userMessage.trim());
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 将当前所有消息（包括刚刚添加的用户消息）发送给后端，用于AI上下文
        // 确保只发送 role 和 content
        body: JSON.stringify({ messages: messages.map(msg => ({ role: msg.role, content: msg.content })) }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let receivedText = '';

      while (true) {
        const { done, value } = await reader?.read()!;
        if (done) break;
        receivedText += decoder.decode(value, { stream: true });
        setStreamingAiContent(receivedText); // 实时更新流式内容
      }

      // 2. AI 响应完成后，将完整的 AI 消息保存到 Supabase (通过 Hook)
      await addMessage("assistant", receivedText);

    } catch (error) {
      console.error("发送消息失败:", error);
      setStreamingAiContent("抱歉，AI 暂时无法响应，请稍后再试。"); // 显示错误信息
      alert("发送消息失败，请检查网络或稍后再试。");
    } finally {
      setIsLoading(false);
      setStreamingAiContent(""); // 清空流式内容
    }
  };

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

    setIsLoading(true); // 生成日记时也显示加载状态
    try {
      const response = await fetch("/api/generate-diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 将完整的聊天历史发送给后端
        body: JSON.stringify({ chatHistory: messages.map(msg => ({ role: msg.role, content: msg.content })) }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }

      const { diary } = await response.json()
      setGeneratedDiary(diary)
      setShowDiaryModal(true)
    } catch (error) {
      console.error("生成日记失败:", error)
      alert("生成日记失败，请稍后再试。")
    } finally {
      setIsLoading(false);
    }
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
        {/* Header */}
        <div className="p-4 bg-white border-b border-amber-100">
          <h1 className="text-xl font-semibold text-stone-700 text-center">心语迹</h1>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
          {messages.length === 0 && !isLoading && ( // 只有在没有消息且不加载时才显示初始提示
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

          {/* 显示流式 AI 内容 */}
          {isLoading && streamingAiContent && (
            <div className="flex justify-start">
              <div className="max-w-xs p-3 text-stone-700 bg-white rounded-t-2xl rounded-br-2xl shadow-sm">
                <p className="text-sm leading-relaxed">{streamingAiContent}</p>
              </div>
            </div>
          )}

          {/* 原始的加载动画，只有在加载中且还没有流式内容时显示 */}
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

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-amber-100">
          {shouldShowGenerate && (
            <div className="mb-3">
              <Button
                onClick={handleGenerateDiary}
                className="w-full bg-amber-200 hover:bg-amber-300 text-stone-700 border-none"
                variant="outline"
                disabled={isLoading} // 生成日记时禁用按钮
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
