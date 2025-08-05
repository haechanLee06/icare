"use client"

import { useChat } from "ai/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PenTool, Send, MessageCircle } from "lucide-react"
import DiaryEditModal from "./diary-edit-modal"

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [showDiaryModal, setShowDiaryModal] = useState(false)
  const [generatedDiary, setGeneratedDiary] = useState("")

  const generateDiary = async () => {
    if (messages.length === 0) return

    try {
      const response = await fetch("/api/generate-diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatHistory: messages }),
      })

      const { diary } = await response.json()
      setGeneratedDiary(diary)
      setShowDiaryModal(true)
    } catch (error) {
      console.error("生成日记失败:", error)
    }
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* 聊天记录区 */}
        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <div className="text-center text-stone-500">
                <MessageCircle size={48} className="mx-auto mb-4 text-orange-300" />
                <p className="text-lg font-medium mb-2">晚上好 ✨</p>
                <p className="text-sm">今天过得怎么样？想聊点什么吗？</p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs p-3 rounded-2xl shadow-sm ${
                  message.role === "user"
                    ? "bg-orange-400 text-white rounded-br-md"
                    : "bg-white text-stone-700 rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs p-3 bg-white text-stone-700 rounded-2xl rounded-bl-md shadow-sm">
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
        </div>

        {/* 输入区域 */}
        <div className="p-4 bg-white border-t border-amber-100">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            {/* 生成日记按钮 */}
            <Button
              type="button"
              onClick={generateDiary}
              disabled={messages.length === 0}
              className="p-3 bg-amber-100 hover:bg-amber-200 text-stone-600 rounded-full border-none shadow-sm disabled:opacity-50"
            >
              <PenTool size={20} />
            </Button>

            {/* 输入框 */}
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="聊点什么吧..."
              className="flex-grow bg-gray-100 border-none rounded-full px-4 py-3 focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all"
            />

            {/* 发送按钮 */}
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-orange-400 hover:bg-orange-500 text-white rounded-full border-none shadow-sm disabled:opacity-50"
            >
              <Send size={20} />
            </Button>
          </form>
        </div>
      </div>

      {/* 日记编辑模态框 */}
      <DiaryEditModal
        isOpen={showDiaryModal}
        onClose={() => setShowDiaryModal(false)}
        initialContent={generatedDiary}
      />
    </>
  )
}
