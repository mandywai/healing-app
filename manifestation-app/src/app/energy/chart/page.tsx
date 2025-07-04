// src/app/energy/chart/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import BackToHome from '@/components/BackToHome'

export default function EnergyChartPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any[]>([])
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

      setUser(user)

      const { data: logs, error } = await supabase
        .from('energy_logs')
        .select('date, level_score')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

      if (!error && logs) {
        setData(
          logs.map((log) => ({
            date: log.date,
            score: log.level_score,
          }))
        )
      }

      setLoading(false)
    }

    fetchLogs()
  }, [router])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">📈 能量趨勢圖</h1>
        <a href="/energy" className="text-sm underline text-blue-600">← 回到能量紀錄</a>
      </div>

      {loading ? (
        <p>載入中...</p>
      ) : data.length === 0 ? (
        <p>尚未有紀錄</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
      <BackToHome />
    </div>
  )
}
