'use client'

import { useEffect } from 'react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(() => console.log('✅ Service Worker 已註冊'))
        .catch(err => console.error('❌ 註冊 Service Worker 失敗:', err))
    }
  }, [])

  return <>{children}</>
}
