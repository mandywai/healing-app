// src/app/gratitude/logs/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import BackToHome from '@/components/BackToHome'

export default function GratitudeLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data, error } = await supabase
        .from('gratitude_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) {
        console.error('讀取失敗', error.message)
      } else {
        setLogs(data)
      }

      setLoading(false)
    }

    fetchLogs()
  }, [router])

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">📘 我的感恩日記</h1>
        <a href="/" className="text-sm underline text-blue-600">← 回首頁</a>
      </div>

      {loading ? (
        <p>載入中...</p>
      ) : logs.length === 0 ? (
        <p>尚未有感恩紀錄</p>
      ) : (
        <ul className="space-y-3">
          {logs.map(log => (
            <li
              key={log.id}
              className="p-3 border rounded-xl text-left"
            >
              <div className="text-sm text-gray-500 mb-1">{log.date}</div>
              <div>{log.content}</div>
            </li>
          ))}
        </ul>
      )}
      <BackToHome />
    </div>
  )
}
