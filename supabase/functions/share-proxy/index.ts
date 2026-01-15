
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const petId = url.searchParams.get('id');

  if (!petId) {
    return new Response('Missing id', { status: 400 });
  }

  // Initialize Supabase Client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch Pet Data with Error Handling
  let pet = null;
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(petId);

    let query = supabase.from('pets').select('*, profiles:shelter_id(name)');

    if (isUuid) {
      query = query.eq('id', petId);
    } else {
      query = query.eq('slug', petId);
    }

    const { data, error } = await query.single();

    if (!error && data) {
      pet = data;
    }
  } catch (err) {
    console.error("Error fetching pet", err);
  }

  // Construct URLs
  // Use HashRouter format for the redirect to ensure the app loads the correct pet
  const appUrl = `https://labkanadeje.sk/#/pets/${petId}`;
  let ogImageUrl = 'https://labkanadeje.sk/og-image.jpg';
  let title = 'Labka Nádeje - Adopcia Zvierat';
  let description = 'Nájdite svojho nového najlepšieho priateľa.';

  // If pet found, use dynamic data
  if (pet) {
    // Construct dynamic OG Image URL (calling our other function)
    const ogImageParams = new URLSearchParams({
      name: pet.name,
      breed: pet.breed || 'Neznáme',
      image: pet.image_url || '',
      shelter: pet.profiles?.name || 'Labka Nádeje'
    });
    // We must use encodeURIComponent for params if manually constructing, but URLSearchParams handles it.
    // However, for the og:image content attribute, we need the full URL.
    ogImageUrl = `${supabaseUrl}/functions/v1/og-image?${ogImageParams.toString()}`;
    title = `${pet.name} hľadá domov | Labka Nádeje`;
    description = `${pet.breed}, ${pet.age} rokov. ${pet.description ? pet.description.substring(0, 100) : ''}...`;
  } else {
    console.log("Pet not found or error, using fallback.");
  }

  // Return Static HTML with Meta Tags
  const html = `
    <!DOCTYPE html>
    <html lang="sk">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>
        <meta property="og:type" content="website">
        <meta property="og:url" content="${appUrl}">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${ogImageUrl}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${ogImageUrl}">
        
        <!-- Redirect to App -->
        <meta http-equiv="refresh" content="0;url=${appUrl}">
        <script>window.location.href = "${appUrl}"</script>
      </head>
      <body>
        <p>Presmerovávam na detail zvieratka...</p>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8'
    },
  });
});
