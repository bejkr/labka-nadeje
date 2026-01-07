import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    const { searchParams } = new URL(req.url)
    const petId = searchParams.get('id')

    if (!petId) return new Response('DEBUG: Missing pet ID parameter (?id=...)', { status: 400 })

    // Init client
    // Init client with ANON KEY (Pets should be public)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl) return new Response('DEBUG: Missing SUPABASE_URL env var', { status: 500 })
    if (!supabaseAnonKey) return new Response('DEBUG: Missing SUPABASE_ANON_KEY env var', { status: 500 })

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Check if UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(petId);

    // Fetch pet
    let query = supabase
      .from('pets')
      .select('name, breed, age, description, image_url')

    if (isUuid) {
      query = query.eq('id', petId)
    } else {
      query = query.eq('slug', petId)
    }

    const { data: pet, error } = await query.single()

    if (error) return new Response(`DEBUG: DB Error - ${error.message}`, { status: 500 })
    if (!pet) return new Response('DEBUG: Pet not found in DB', { status: 404 })

    // Construct Meta Tags
    const title = `${pet.name} hľadá domov | LabkaNádeje`
    const desc = `Adoptujte si ${pet.name}! ${pet.breed}, ${pet.age} rokov. ${pet.description ? pet.description.substring(0, 150) : ''}...`

    let imageUrl = pet.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'

    // Ensure absolute URL
    if (imageUrl && !imageUrl.startsWith('http')) {
      // Assuming 'pets' bucket if relative path
      imageUrl = `${supabaseUrl}/storage/v1/object/public/pets/${imageUrl}`
    }

    // FIX: Use query param for redirect to avoid hash stripping in FB/IG
    // We pass the ORIGIN ID/SLUG back to the redirect param
    const targetUrl = `https://labkanadeje.sk/?pet_redirect=${petId}`

    // HTML Response
    const html = `
      <!DOCTYPE html>
      <html lang="sk">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${desc}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="${targetUrl}" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image">
        
        <!-- FLUSH REDIRECT -->
        <meta http-equiv="refresh" content="0;url=${targetUrl}" />
        <script>window.location.replace("${targetUrl}");</script>

        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #ffffff;
            color: #333;
          }
          .loader {
            width: 48px;
            height: 48px;
            border: 5px solid #f3f4f6;
            border-bottom-color: #F97316; /* Brand orange color or similar */
            border-radius: 50%;
            animation: rotation 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          p { margin-top: 10px; color: #666; }
          a { color: #F97316; text-decoration: none; font-weight: bold; }
          .hidden-preview { display: none; }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <p>Presmerovávam na LabkaNádeje...</p>
        <p><small>Ak vás nepresmeruje automaticky, <a href="${targetUrl}">kliknite sem</a>.</small></p>
        
        <!-- Hidden content for crawlers/previews if script fails to strip it, though usually meta tags are enough -->
        <div class="hidden-preview">
          <h1>${title}</h1>
          <p>${desc}</p>
          <img src="${imageUrl}" alt="${pet.name}" />
        </div>
      </body>
      </html>
    `

    return new Response(html, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    })
  } catch (err: any) {
    // RETURN THE ACTUAL ERROR
    return new Response(`DEBUG: Crash - ${err.message}\nStack: ${err.stack}`, { status: 500 })
  }
})
