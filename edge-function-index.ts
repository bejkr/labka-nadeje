
// FIX: Declare Deno for TypeScript
declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Robustné parsovanie body
    const body = await req.json().catch(() => ({}))
    console.log("Prijatý webhook body:", JSON.stringify(body))

    // Získanie ID s podporou rôznych formátov volania
    const message_id = body.message_id || body.record?.id
    
    // Validácia UUID formátu (jednoduchá kontrola dĺžky a nepovolenie "undefined" stringu)
    if (!message_id || message_id === "undefined" || String(message_id).length < 30) {
      console.error("KRITICKÉ: Neplatné message_id prijaté:", message_id)
      return new Response(JSON.stringify({ error: "Invalid message_id format" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Vrátime 200 aby pg_net neopakoval chybný request
      })
    }

    // Načítanie správy
    const { data: messageData, error: msgError } = await supabase
      .from('inquiry_messages')
      .select(`
        content,
        sender_id,
        inquiries (
          id,
          applicant_id,
          shelter_id,
          pets (name)
        )
      `)
      .eq('id', message_id)
      .single()

    if (msgError || !messageData) {
      throw new Error(`Správa ${message_id} nebola nájdená v DB.`)
    }

    const inquiry = messageData.inquiries
    const recipientId = messageData.sender_id === inquiry.applicant_id 
      ? inquiry.shelter_id 
      : inquiry.applicant_id

    // Načítanie profilu príjemcu
    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('email, name, email_notifications_enabled')
      .eq('id', recipientId)
      .single()

    if (profError || !profile) {
      throw new Error("Príjemca neexistuje.")
    }

    // Ak sú notifikácie vypnuté
    if (profile.email_notifications_enabled === false) {
      console.log(`Notifikácie pre ${profile.email} sú vypnuté.`)
      return new Response(JSON.stringify({ message: 'Disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    if (!resendApiKey) throw new Error("Chýba RESEND_API_KEY.")

    // Odoslanie cez Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'LabkaNádeje <notifikacie@labkanadeje.sk>',
        to: profile.email,
        subject: `Nová správa k zvieratku ${inquiry.pets.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 24px; padding: 40px;">
            <h2 style="color: #ea580c; margin-top: 0;">Máte novú správu!</h2>
            <p>Ahoj <b>${profile.name}</b>,</p>
            <p>V konverzácii ohľadom <b>${inquiry.pets.name}</b> pribudla nová správa:</p>
            <div style="background: #fff7ed; padding: 20px; border-radius: 16px; border-left: 4px solid #ea580c; font-style: italic; margin: 25px 0;">
              "${messageData.content}"
            </div>
            <div style="text-align: center;">
              <a href="https://labkanadeje.sk/#/profile" style="display: inline-block; background: #ea580c; color: white; padding: 14px 30px; border-radius: 12px; text-decoration: none; font-weight: bold;">Odpovedať v chate</a>
            </div>
          </div>
        `,
      }),
    })

    const emailData = await emailRes.json()
    console.log("Resend výsledok:", JSON.stringify(emailData))

    return new Response(JSON.stringify(emailData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (err) {
    console.error("ERROR:", err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
