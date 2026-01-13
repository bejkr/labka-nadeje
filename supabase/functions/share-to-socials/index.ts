import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { pet_id } = await req.json()

        if (!pet_id) {
            return new Response(JSON.stringify({ error: 'Missing pet_id' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 1. Get Pet Data
        const { data: pet, error: petError } = await supabase
            .from('pets')
            .select('*, profiles:shelter_id(name, shelter_data)')
            .eq('id', pet_id)
            .single()

        if (petError || !pet) {
            return new Response(JSON.stringify({ error: 'Pet not found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 2. Real Social Media Posting
        const shelterData = pet.profiles?.shelter_data as any;
        const fbAuth = shelterData?.socialsAuth?.facebook;

        const results: any[] = [];

        // --- FACEBOOK POSTING ---
        if (fbAuth?.linked && fbAuth?.accessToken && fbAuth?.pageId) {
            console.log(`[Social Share] Posting to Facebook Page ${fbAuth.pageName}...`);

            try {
                // We'll post a photo (if valid URL) or just a status update
                // If imageUrl is present, we use /photos endpoint, otherwise /feed
                const endpoint = pet.imageUrl
                    ? `https://graph.facebook.com/${fbAuth.pageId}/photos`
                    : `https://graph.facebook.com/${fbAuth.pageId}/feed`;

                const body: any = {
                    access_token: fbAuth.accessToken,
                    message: `🐾 Nový prírastok: ${pet.name} 🐾\n\n${pet.breed}, ${pet.age} rokov.\n${pet.description || ''}\n\nViac info na Labke Nádeje! ❤️`,
                };

                if (pet.imageUrl) {
                    body.url = pet.imageUrl;
                }

                const fbRes = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                const fbData = await fbRes.json();

                if (!fbRes.ok) {
                    console.error('[Social Share] Facebook API Error:', fbData);
                    results.push({ platform: 'Facebook', status: 'error', error: fbData.error?.message });
                } else {
                    console.log('[Social Share] Facebook Post Success:', fbData.id);
                    results.push({ platform: 'Facebook', status: 'success', postId: fbData.id });
                }

            } catch (err) {
                console.error('[Social Share] Facebook Network Error:', err);
                results.push({ platform: 'Facebook', status: 'error', error: err.message });
            }
        } else {
            console.log('[Social Share] Facebook not connected or missing token.');
            results.push({ platform: 'Facebook', status: 'skipped', reason: 'No token' });
        }

        // --- INSTAGRAM POSTING ---
        // (Placeholder for future implementation)
        results.push({ platform: 'Instagram', status: 'skipped', reason: 'Not implemented' });

        console.log(`[Social Share] Completed with results:`, results);

        return new Response(
            JSON.stringify({
                success: true,
                message: `Shared to ${results.filter(r => r.status === 'success').length} platforms`,
                details: results
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
