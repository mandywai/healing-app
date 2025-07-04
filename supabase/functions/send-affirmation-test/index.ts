// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// supabase/functions/send-affirmation-test/index.ts
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
//import { urlBase64ToUint8Array } from '../../../src/lib/utils.ts' // 如果你有抽出去

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const vapidKey = Deno.env.get('VAPID_PRIVATE_KEY')!

const supabase = createClient(supabaseUrl, supabaseKey)

serve(async () => {
  const AFFIRMATIONS = [
    '當事情不如預期時，我選擇看見它的禮物。',
    '我釋放過度的期待，選擇信任自己的旅程。',
    '我接受變化，因為它帶來成長與可能。',
    '我不需依賴他人的認同，我就是我最大的支持。',
    '我轉化焦慮為行動，轉化期待為信念。',
    '我以感恩與信任，信任自己的旅程。',
  ]
  const today = new Date().getDate()
  const msg = AFFIRMATIONS[today % AFFIRMATIONS.length]

  const { data: subs } = await supabase.from('push_subscriptions').select('*')
  if (!subs || subs.length === 0) {
    return new Response('沒有訂閱者', { status: 200 })
  }

  const results = await Promise.allSettled(
    subs.map(async sub => {
      const payload = JSON.stringify({
        title: '🧘‍♀️ 今日肯定句',
        body: msg,
      })
      await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          Authorization: `key=${vapidKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: sub.endpoint,
          notification: {
            title: '🧘‍♀️ 今日肯定句',
            body: msg,
          },
        }),
      })
    })
  )

  const success = results.filter(r => r.status === 'fulfilled').length
  return new Response(`✅ 發送成功：${success} 位訂閱者`, { status: 200 })
})


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-affirmation-test' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
