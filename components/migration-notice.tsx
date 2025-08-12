"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, ExternalLink } from "lucide-react"

interface MigrationNoticeProps {
  onDismiss: () => void
}

export default function MigrationNotice({ onDismiss }: MigrationNoticeProps) {
  const handleOpenSupabase = () => {
    window.open("https://supabase.com/dashboard", "_blank")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <h2 className="text-lg font-semibold text-stone-700">数据库需要更新</h2>
        </div>

        <div className="space-y-4 text-sm text-stone-600">
          <p>为了支持按日期管理聊天记录的新功能，需要更新数据库结构。</p>

          <div className="bg-amber-50 p-3 rounded-lg">
            <p className="font-medium text-amber-800 mb-2">请按以下步骤操作：</p>
            <ol className="list-decimal list-inside space-y-1 text-amber-700">
              <li>打开 Supabase 控制台</li>
              <li>进入 SQL Editor</li>
              <li>执行项目中的 migrate-chat-messages.sql 脚本</li>
              <li>刷新页面</li>
            </ol>
          </div>

          <p className="text-xs text-stone-500">在更新完成前，应用将以兼容模式运行，部分功能可能受限。</p>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button onClick={handleOpenSupabase} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
            <ExternalLink className="w-4 h-4 mr-2" />
            打开 Supabase
          </Button>
          <Button onClick={onDismiss} variant="outline" className="flex-1 bg-transparent">
            稍后处理
          </Button>
        </div>
      </div>
    </div>
  )
}
