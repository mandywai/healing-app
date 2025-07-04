// src/app/manifest/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import BackToHome from '@/components/BackToHome'

export default function ManifestationPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [goal, setGoal] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData?.user) return router.replace('/login')
      setUser(authData.user)

      const { data, error } = await supabase
        .from('manifest_goals')
        .select('content')
        .eq('user_id', authData.user.id)
        .single()

      if (!error && data) setGoal(data.content || '')
    }
    checkAuthAndFetch()
  }, [router])

  const handleSave = async () => {
    if (!goal.trim()) return

    setSaving(true)
    const { error } = await supabase.from('manifest_goals').upsert({
      user_id: user.id,
      content: goal.trim(),
    })
    setSaving(false)

    if (error) {
      alert('❌ 儲存失敗：' + error.message)
    } else {
      alert('✅ 顯化目標已儲存')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">🌟 顯化目標設定</h1>
        <BackToHome />
      </div>

      <Textarea
        rows={6}
        placeholder="寫下你此刻想顯化的願望、目標、信念..."
        value={goal}
        onChange={e => setGoal(e.target.value)}
      />

      <Button className="mt-4 w-full" onClick={handleSave} disabled={saving}>
        {saving ? '儲存中...' : '儲存顯化目標'}
      </Button>
    </div>
  )
}
