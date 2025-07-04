// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// supabase/functions/send-affirmation/index.ts
// supabase/functions/send-affirmation/index.ts
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const vapidKey = Deno.env.get('VAPID_PRIVATE_KEY')!
const client = createClient(supabaseUrl, supabaseServiceRoleKey)

const AFFIRMATIONS = [
  '當事情不如預期時，我選擇看見它的禮物。',
  '我釋放過度的期待，選擇信任自己的旅程。',
  '我接受變化，因為它帶來成長與可能。',
  '我不需依賴他人的認同，我就是我最大的支持。',
  '我轉化焦慮為行動，轉化期待為信念。',
  '我以感恩與信任，信任自己的旅程。'
]

serve(async () => {
  const now = new Date()
  const utcHour = now.getUTCHours()

  // 1. 查詢 user_profiles 表格中符合目前時間 (utcHour) 的時區偏移
  const { data: profiles, error } = await client
    .from('user_profiles')
    .select('id, timezone_offset')

  if (error) {
    console.error('讀取 user_profiles 錯誤', error)
    return new Response('Error reading profiles', { status: 500 })
  }

  // 2. 過濾出「當地時間為 9 點」的使用者
  const targetUsers = profiles.filter(p => {
    const localHour = (utcHour * 60 + now.getUTCMinutes()) + (p.timezone_offset ?? 0)
    return Math.floor(localHour / 60) === 9
  })

  // 3. 為這些使用者隨機挑一句肯定句，並送出通知（簡化為印出 user id）
  for (const user of targetUsers) {
    const index = Math.floor(Math.random() * AFFIRMATIONS.length)
    const sentence = AFFIRMATIONS[index]

    // 假設你有儲存 user_subscriptions（推播訂閱資訊），可以在這裡推送通知
    console.log(`🔔 應發送給 ${user.id}：${sentence}`)
  }

  return new Response(`✅ Sent affirmations to ${targetUsers.length} users`)
})



/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:0/functions/v1/send-affirmation' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
