// src/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
  }
const AFFIRMATIONS = [
  '當事情不如預期時，我選擇看見它的禮物。',
  '我釋放過度的期待，選擇信任自己的旅程。',
  '我接受變化，因為它帶來成長與可能。',
  '我不需依賴他人的認同，我就是我最大的支持。',
  '我轉化焦慮為行動，轉化期待為信念。',
  '我以感恩與信任，信任自己的旅程。'
]

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [goal, setGoal] = useState('')
  const [affirmation, setAffirmation] = useState('')
  const [notifGranted, setNotifGranted] = useState(false)

  useEffect(() => {
    const fetchUserAndGoal = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData?.user) return router.replace('/login')
      setUser(authData.user)

      const { data: goalData } = await supabase
        .from('manifest_goals')
        .select('content')
        .eq('user_id', authData.user.id)
        .single()

      if (goalData?.content) setGoal(goalData.content)
    }
    fetchUserAndGoal()

    // 隨機肯定句
    const index = new Date().getDate() % AFFIRMATIONS.length
    setAffirmation(AFFIRMATIONS[index])

    const saveTimezone = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        const offset = new Date().getTimezoneOffset() * -1 // ex: -480 → +480
        await supabase.from('user_profiles').upsert({
          id: user?.id,
          timezone_offset: offset
        })
      }
}, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const handleRequestPermission =async () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(result => {
        if (result === 'granted') {
          setNotifGranted(true)
          new Notification('🧘‍♀️ 今日肯定句', {
            body: affirmation,
            icon: '/icon-192x192.png'
          })
        }
      })
    }
    if (!user) return
    if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = await Notification.requestPermission()
    
        if (permission === 'granted') {
          try {
            const reg = await navigator.serviceWorker.register('/service-worker.js')
            const sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
            })
    
            // 發送 Push Subscription 到 Supabase
            const { error } = await supabase.from('push_subscriptions').upsert({
              user_id: user.id,
              subscription: sub.toJSON()
            })
    
            if (!error) {
              setNotifGranted(true)
              new Notification('🧘‍♀️ 推播已啟用', {
                body: '您將於每日早上 9 點收到肯定句提醒',
                icon: '/icon-192x192.png'
              })
            } else {
              console.error('Supabase 儲存失敗：', error.message)
            }
          } catch (err) {
            console.error('推播註冊失敗：', err)
          }
        }
      }
}

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🌿 Healing Reflection</h1>
        <button onClick={handleLogout} className="text-sm text-red-600 underline">登出</button>
      </div>

      {user && (
        <div className="text-gray-700">
          👋 歡迎回來，{user.email}<br />
          {goal && <span className="text-sm block">🎯 顯化目標：{goal}</span>}
          {affirmation && <span className="text-sm text-purple-700 mt-2 block">🧘‍♀️ 今日肯定句：{affirmation}</span>}
        </div>
      )}

      {!notifGranted && (
        <Button variant="outline" onClick={handleRequestPermission}>
          🔔 啟用每日提醒通知
        </Button>
      )}

      <div className="space-y-4">
        <Button className="w-full" onClick={() => router.push('/energy')}>✨ 能量記錄</Button>
        <Button className="w-full" onClick={() => router.push('/gratitude')}>🙏 感恩日記</Button>
        <Button className="w-full" onClick={() => router.push('/manifest')}>🌟 顯化目標</Button>
      </div>
    </div>
  )
}
