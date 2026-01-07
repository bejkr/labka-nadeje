import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface Pet {
    id: string;
    name: string;
    type: string;
    breed: string;
    location: string;
    image_url: string;
    description: string;
}

interface Alert {
    id: string;
    user_id: string;
    filters: {
        types?: string[];
        breeds?: string[];
        locations?: string[];
    };
    profiles: {
        email: string;
        email_notifications_enabled: boolean;
    };
}

serve(async (req) => {
    try {
        const payload = await req.json();
        const pet = payload.record as Pet;

        if (!pet) {
            return new Response("No pet record found in payload", { status: 400 });
        }

        // 1. Fetch all alerts with their user profiles
        const { data: alerts, error } = await supabase
            .from("pet_alerts")
            .select("*, profiles!inner(email, email_notifications_enabled)");

        if (error) {
            console.error("Error fetching alerts:", error);
            return new Response("Error fetching alerts", { status: 500 });
        }

        const matches: Alert[] = [];

        // 2. Filter alerts in memory (easier than complex SQL for JSONB arrays)
        for (const alert of alerts as unknown as Alert[]) {
            // Skip if user disabled notifications
            if (!alert.profiles.email_notifications_enabled) continue;

            const f = alert.filters;
            let isMatch = true;

            // Type match (exact)
            if (f.types && f.types.length > 0 && !f.types.includes(pet.type)) {
                isMatch = false;
            }

            // Location match (partial/exact)
            if (isMatch && f.locations && f.locations.length > 0) {
                const petLoc = pet.location.toLowerCase();
                const locationMatch = f.locations.some(l => petLoc.includes(l.toLowerCase()));
                if (!locationMatch) isMatch = false;
            }

            // Breed match (partial/exact)
            if (isMatch && f.breeds && f.breeds.length > 0) {
                const petBreed = pet.breed.toLowerCase();
                const breedMatch = f.breeds.some(b => petBreed.includes(b.toLowerCase()));
                if (!breedMatch) isMatch = false;
            }

            if (isMatch) {
                matches.push(alert);
            }
        }

        console.log(`Found ${matches.length} matching alerts for pet ${pet.name}`);

        if (matches.length === 0) {
            return new Response("No matching alerts", { status: 200 });
        }

        // 3. Send Emails via Resend
        if (!RESEND_API_KEY) {
            console.error("RESEND_API_KEY is not set");
            return new Response("Configuration Error: Missing API Key", { status: 500 });
        }

        const results = await Promise.all(matches.map(async (match) => {
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: "Labka Nádeje <noreply@labkanadeje.sk>", // User needs to verify domain or use resend testing domain
                    to: [match.profiles.email],
                    subject: `Nové zvieratko na adopciu: ${pet.name} 🐾`,
                    html: `
                    <h1>Našli sme zvieratko, ktoré by sa vám mohlo páčiť!</h1>
                    <p>Máme nové zvieratko, ktoré zodpovedá vášmu hľadaniu <strong>"${match.name || 'Upozornenie'}"</strong>.</p>
                    
                    <div style="border: 1px solid #eee; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <img src="${pet.image_url}" style="width: 100%; max-width: 300px; border-radius: 10px;" />
                        <h2>${pet.name}</h2>
                        <p><strong>Druh:</strong> ${pet.type}</p>
                        <p><strong>Plemeno:</strong> ${pet.breed}</p>
                        <p><strong>Lokalita:</strong> ${pet.location}</p>
                        <p>${pet.description.substring(0, 100)}...</p>
                        <a href="https://labkanadeje.sk/#/pets/${pet.id}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Zobraziť zvieratko</a>
                    </div>
                `
                }),
            });
            return res.status;
        }));

        return new Response(JSON.stringify({ matches: matches.length, sent: results.length }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
