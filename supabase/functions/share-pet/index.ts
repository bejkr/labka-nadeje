import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url)
    const petQuery = url.searchParams.get('id')

    if (!petQuery) {
      return new Response('No ID provided', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    let pet = null
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(petQuery)

    if (isUuid) {
      const { data } = await supabase.from('pets').select('*').eq('id', petQuery).single()
      pet = data
    } else {
      const { data } = await supabase.from('pets').select('*').eq('slug', petQuery).single()
      pet = data
    }

    if (!pet) {
      return new Response('Pet not found', { status: 404 })
    }

    const title = `${pet.name} hľadá domov | LabkaNádeje`
    const desc = `Adoptujte si ${pet.name}! ${pet.breed}, ${pet.age} rokov. ${pet.description ? pet.description.substring(0, 150) + '...' : ''}`
    const imageUrl = pet.image_url
    const targetUrl = `https://labkanadeje.sk/?pet_redirect=${petQuery}`

    // We are temporarily disabling the HTML preview page because the runtime 
    // is forcing text/plain, causing users to see raw code.
    // We will redirect properly, which fixes the UX but loses the social card preview.
    return Response.redirect(targetUrl, 302)
  } catch (err: any) {
    // Return error as JSON so we can debug if needed
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
})
