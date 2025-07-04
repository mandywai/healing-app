// src/app/energy/logs/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import BackToHome from '@/components/BackToHome'

export default function EnergyLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
  
      if (!user) {
        router.replace('/')
        return
      }
  
      const { data: logs, error } = await supabase
        .from('energy_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
  
      if (error) {
        console.error('讀取失敗', error.message)
      }
  
      setLogs(logs ?? []) // 即使 logs 為 null，也設為 []
      setLoading(false)
    }
  
    fetchLogs()
  }, [router])
  
  useEffect(() => {
    console.log('⚠️ logs:', logs)
  }, [logs])

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">📜 我的能量紀錄</h1>
        <a href="/energy" className="text-sm underline text-blue-600">← 回到能量紀錄</a>
      </div>

      {loading ? (
        <p>載入中...</p>
      ) : logs.length === 0 ? (
        <p>尚未有紀錄</p>
      ) : (
        <ul className="space-y-3">
          {logs.map(log => (
            <li
              key={log.id}
              className="p-3 border rounded-xl flex justify-between"
            >
              <div>{log.date}</div>
              <div>
                {log.level_name}（{log.level_score}）
              </div>
            </li>
          ))}
        </ul>
      )}
      <BackToHome />
    </div>
  )
}