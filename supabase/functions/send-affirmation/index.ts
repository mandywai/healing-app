// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// supabase-edge/functions/send-affirmation/index.ts

/// <reference types="https://deno.land/std@0.192.0/types.d.ts" />
/// <reference types="https://deno.land/x/supabase_edge_functions/types.ts" />


import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

Deno.serve(async (req) => {
  try {
    // 取得現在 UTC 時間
    const now = new Date()
    const utcHour = now.getUTCHours()

    // 查詢目前 offset 使當地時間為 9AM 的使用者
    const offsetMinutes = (9 - utcHour) * 60

    const { data: users, error } = await supabase
      .from("user_profiles")
      .select("id, timezone_offset")
      .eq("timezone_offset", offsetMinutes)

    if (error) throw error
    if (!users || users.length === 0) return new Response("No users to notify", { status: 200 })

    // 對每個使用者發送推播（假設有 push_subscriptions table）
    for (const user of users) {
      const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", user.id)

      for (const sub of subscriptions || []) {
        await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${Deno.env.get("FCM_SERVER_KEY")}`
          },
          body: JSON.stringify({
            to: sub.endpoint,
            notification: {
              title: "🧘‍♀️ 今日肯定句",
              body: "我選擇信任自己的旅程。",
              icon: "/icon-192x192.png"
            }
          })
        })
      }
    }

    return new Response("Push sent", { status: 200 })
  } catch (err) {
    console.error("Error:", err)
    return new Response("Error", { status: 500 })
  }
})


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-affirmation' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
