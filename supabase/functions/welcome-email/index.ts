// FIX: Declare Deno for TypeScript
declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY')

        // Parse body
        const { email, name, role } = await req.json().catch(() => ({}))

        if (!email || !name) {
            throw new Error("Missing email or name")
        }

        if (!resendApiKey) {
            console.error("Missing RESEND_API_KEY")
            return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            })
        }

        // Prepare email content based on role
        const isShelter = role === 'shelter'
        const subject = isShelter
            ? "Vitajte v rodine Labka Nádeje! 🐾"
            : "Vitajte v Labka Nádeje! 🐾"

        const htmlContent = isShelter
            ? `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e7ff; border-radius: 24px; padding: 40px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
             <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">Vitajte, ${name}!</h1>
             <p style="color: #6366f1; font-size: 18px; margin-top: 10px;">Sme radi, že ste sa k nám pridali.</p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Ďakujeme, že ste sa zaregistrovali ako útulok na platforme <b>Labka Nádeje</b>. 
            Naším cieľom je pomôcť vám nájsť milujúce domovy pre vašich zverencov rýchlejšie a jednoduchšie.
          </p>

          <div style="background-color: #e0e7ff; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <p style="margin: 0; color: #4338ca; font-weight: bold;">Čo môžete teraz robiť?</p>
            <ul style="color: #374151; margin-top: 10px;">
              <li>Vytvoriť profily pre vaše zvieratká</li>
              <li>Spravovať žiadosti o adopciu</li>
              <li>Komunikovať s potenciálnymi záujemcami</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="https://labkanadeje.sk/#/shelter" style="display: inline-block; background: #4f46e5; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px;">Prejsť do Dashboardu</a>
          </div>
          
          <p style="text-align: center; color: #9ca3af; font-size: 14px; margin-top: 40px;">
            S láskou, tím Labka Nádeje
          </p>
        </div>
      `
            : `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ffedd5; border-radius: 24px; padding: 40px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
             <h1 style="color: #ea580c; margin: 0; font-size: 28px;">Ahoj, ${name}!</h1>
             <p style="color: #f97316; font-size: 18px; margin-top: 10px;">Vitajte v komunite Labka Nádeje.</p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Ďakujeme za vašu registráciu. Sme tu, aby sme vám pomohli nájsť nového najlepšieho priateľa.
          </p>

          <div style="background-color: #fff7ed; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <p style="margin: 0; color: #9a3412; font-weight: bold;">Váš ďalší krok:</p>
            <p style="color: #374151; margin-top: 5px;">
              Prezrite si zvieratká, ktoré hľadajú domov, alebo si urobte náš kvíz zhody!
            </p>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="https://labkanadeje.sk/#/pets" style="display: inline-block; background: #ea580c; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px;">Pozrieť zvieratká</a>
          </div>
          
          <p style="text-align: center; color: #9ca3af; font-size: 14px; margin-top: 40px;">
            S láskou, tím Labka Nádeje
          </p>
        </div>
      `

        // Send email via Resend
        const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
                from: 'LabkaNádeje <team@labkanadeje.sk>', // Using a generic team email or the one configured in Resend
                to: email,
                subject: subject,
                html: htmlContent,
            }),
        })

        const emailData = await emailRes.json()
        console.log("Welcome email sent:", JSON.stringify(emailData))

        return new Response(JSON.stringify(emailData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        })

    } catch (err) {
        console.error("Welcome email error:", err.message)
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
        })
    }
})
