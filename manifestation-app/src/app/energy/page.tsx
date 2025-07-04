// src/app/energy/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import BackToHome from '@/components/BackToHome'

const energyOptions = [
  { label: '開悟', value: '開悟', score: 700 },
  { label: '平靜', value: '平靜', score: 600 },
  { label: '喜悅', value: '喜悅', score: 540 },
  { label: '愛', value: '愛', score: 500 },
  { label: '理智', value: '理智', score: 400 },
  { label: '寬恕', value: '寬恕', score: 350 },
  { label: '主動', value: '主動', score: 310 },
  { label: '滿意', value: '滿意', score: 250 },
  { label: '勇氣', value: '勇氣', score: 200 },
  { label: '驕傲', value: '驕傲', score: 175 },
  { label: '憤怒', value: '憤怒', score: 150 },
  { label: '慾望', value: '慾望', score: 125 },
  { label: '恐懼', value: '恐懼', score: 100 },
  { label: '悲傷', value: '悲傷', score: 75 },
  { label: '冷淡', value: '冷淡', score: 50 },
  { label: '內疚', value: '內疚', score: 30 },
  { label: '羞愧', value: '羞愧', score: 20 },
]

export default function EnergyPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      } else {
        router.replace('/')
      }
    }
    fetchUser()
  }, [router])

  const handleSave = async () => {
    if (!selectedEnergy || !user) return

    const energy = energyOptions.find(e => e.value === selectedEnergy)
    if (!energy) return

    setSaving(true)
    const { error } = await supabase.from('energy_logs').insert({
      user_id: user.id,
      date: new Date().toISOString().slice(0, 10),
      level_name: energy.value,
      level_score: energy.score,
    })

    if (error) {
      setMessage('❌ 儲存失敗：' + error.message)
    } else {
      setMessage('✅ 今日能量已成功儲存！')
    }

    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (!user) return <p className="p-6 text-gray-600">載入中...</p>

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">🌟 能量紀錄</h1>
      </div>
      <div>
        <p className="mb-2">請選擇你今天的能量狀態：</p>
        <Select onValueChange={setSelectedEnergy}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="選擇一種能量" />
          </SelectTrigger>
          <SelectContent>
            {energyOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}（{option.score}）
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSave} disabled={saving} className="mt-4 w-full">
          {saving ? '儲存中...' : '儲存今日能量'}
        </Button>
        {message && <p className="mt-2 text-sm text-center">{message}</p>}
      </div>

      <div className="space-y-4">
        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => router.push('/energy/logs')}>✨ 查看歷史紀錄</Button>
        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => router.push('/energy/chart')}>🌟 查看能量趨勢圖</Button>
      </div>

      <BackToHome />
    </div>
  )
}