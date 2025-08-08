"use client"
import { useState } from "react"
import { Calendar, MessageCircle, LogOut } from "lucide-react"
import ChatInterface from "@/components/chat-interface"
import CalendarInterface from "@/components/calendar-interface"
import LoginForm from "@/components/auth/login-form"
import SignUpForm from "@/components/auth/signup-form"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "calendar">("chat")
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
          <p className="mt-4 text-stone-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        {authMode === "login" ? (
          <LoginForm onSwitchToSignUp={() => setAuthMode("signup")} />
        ) : (
          <SignUpForm onSwitchToLogin={() => setAuthMode("login")} />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-amber-50">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-amber-100 shadow-sm">
        <h1 className="text-xl font-semibold text-stone-700">心语迹</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-stone-500">{user.email}</span>
          <Button
            onClick={signOut}
            variant="ghost"
            size="sm"
            className="text-stone-500 hover:text-stone-700"
          >
            <LogOut size={16} className="mr-1" />
            退出
          </Button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-grow overflow-hidden">
        {activeTab === "chat" ? <ChatInterface /> : <CalendarInterface />}
      </div>

      {/* 底部导航栏 */}
      <div className="flex bg-white border-t border-amber-100 shadow-lg">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex flex-col items-center py-3 px-4 transition-colors ${
            activeTab === "chat" ? "text-orange-400 bg-amber-50" : "text-stone-500 hover:text-orange-300"
          }`}
        >
          <MessageCircle size={24} />
          <span className="text-xs mt-1 font-medium">心语</span>
        </button>

        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex-1 flex flex-col items-center py-3 px-4 transition-colors ${
            activeTab === "calendar" ? "text-orange-400 bg-amber-50" : "text-stone-500 hover:text-orange-300"
          }`}
        >
          <Calendar size={24} />
          <span className="text-xs mt-1 font-medium">日历</span>
        </button>
      </div>
    </div>
  )
}
