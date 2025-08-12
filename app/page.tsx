"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import LoginForm from "@/components/auth/login-form"
import SignupForm from "@/components/auth/signup-form"
import ChatInterface from "@/components/chat-interface"
import CalendarInterface from "@/components/calendar-interface"
import { MessageCircle, Calendar } from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<"chat" | "calendar">("chat")
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
          <p className="mt-2 text-stone-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {authMode === "login" ? (
            <LoginForm onSwitchToSignup={() => setAuthMode("signup")} />
          ) : (
            <SignupForm onSwitchToLogin={() => setAuthMode("login")} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-amber-50">
      {/* 主内容区域 */}
      <div className="flex-grow">{activeTab === "chat" ? <ChatInterface /> : <CalendarInterface />}</div>

      {/* 底部导航 */}
      <div className="flex justify-center p-4 bg-white border-t border-amber-100">
        <div className="flex space-x-8">
          <button onClick={() => setActiveTab("chat")} className="flex flex-col items-center space-y-1">
            <MessageCircle className={`w-6 h-6 ${activeTab === "chat" ? "text-orange-400" : "text-stone-400"}`} />
            <span className={`text-xs font-medium ${activeTab === "chat" ? "text-orange-400" : "text-stone-400"}`}>
              心语
            </span>
          </button>
          <button onClick={() => setActiveTab("calendar")} className="flex flex-col items-center space-y-1">
            <Calendar className={`w-6 h-6 ${activeTab === "calendar" ? "text-orange-400" : "text-stone-400"}`} />
            <span className={`text-xs font-medium ${activeTab === "calendar" ? "text-orange-400" : "text-stone-400"}`}>
              日历
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
