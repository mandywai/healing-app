// src/app/gratitude/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import BackToHome from '@/components/BackToHome'

export default function GratitudePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [text, setText] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) return router.replace('/login')
      setUser(data.user)
    }
    checkAuth()
  }, [router])

  const handleSave = async () => {
    if (!text.trim()) return

    setSaving(true)
    setMessage('')

    const { error } = await supabase.from('gratitude_logs').upsert({
      user_id: user.id,
      date: new Date().toISOString().slice(0, 10),
      content: text.trim(),
    })

    if (error) {
      setMessage('❌ 儲存失敗：' + error.message)
    } else {
        router.push('/gratitude/logs')
    }

    setSaving(false)
    if (error) {
        alert('❌ 儲存失敗：' + error.message) // ✅ 出錯會 alert
      } else {
        router.push('/gratitude/logs')
      }
}

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">🙏 今日感恩日記</h1>
      </div>

      <Textarea
        rows={6}
        placeholder="寫下今天你感恩的事情..."
        value={text}
        onChange={e => setText(e.target.value)}
      />

      <Button className="mt-4 w-full" onClick={handleSave} disabled={saving}>
        {saving ? '儲存中...' : '儲存'}
      </Button>

      {message && <p className="mt-2 text-center text-sm">{message}</p>}
      <div className="space-y-4">
      <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => router.push('/gratitude/logs')}>✨ 查看感恩紀錄</Button>
        </div>
      <BackToHome />
    </div>
  )
}
