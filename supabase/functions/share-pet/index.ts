
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { searchParams } = new URL(req.url)
  const petId = searchParams.get('id')

  if (!petId) {
    return new Response('Missing pet ID', { status: 400 })
  }

  // Init client
  // Init client with SERVICE ROLE to bypass RLS (since pets might be protected)
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Fetch pet
  const { data: pet, error } = await supabase
    .from('pets')
    .select('name, breed, age, description, image_url')
    .eq('id', petId)
    .single()

  if (error || !pet) {
    return new Response('Pet not found', { status: 404 })
  }

  // Construct Meta Tags
  const title = `${pet.name} hľadá domov | LabkaNádeje`
  const desc = `Adoptujte si ${pet.name}! ${pet.breed}, ${pet.age} rokov. ${pet.description ? pet.description.substring(0, 150) : ''}...`
  let imageUrl = pet.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'

  // Ensure absolute URL
  if (imageUrl && !imageUrl.startsWith('http')) {
    // Assuming 'pets' bucket if relative path
    imageUrl = `${supabaseUrl}/storage/v1/object/public/pets/${imageUrl}`
  }

  // FIX: Added /#/ for correct HashRouter redirection
  const targetUrl = `https://labkanadeje.sk/#/pets/${petId}` // Fixed for HashRouter

  // HTML Response
  const html = `
    <!DOCTYPE html>
    <html lang="sk">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${desc}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:url" content="${targetUrl}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image">
      
      <!-- Redirect for humans -->
      <script>
        window.location.href = "${targetUrl}";
      </script>
    </head>
    <body>
      <h1>${title}</h1>
      <p>${desc}</p>
      <img src="${imageUrl}" alt="${pet.name}" style="max-width: 500px;" />
      <p>Presmerovanie na detail zvieratka...</p>
    </body>
    </html>
  `

  return new Response(html, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html' },
  })
})
