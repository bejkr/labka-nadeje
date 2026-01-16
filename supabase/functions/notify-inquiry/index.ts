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

        // Client for RLS-enabled operations (e.g., fetching inquiries, pets, profiles)
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
        // Admin client for auth operations (e.g., creating users)
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        });

        const body = await req.json().catch(() => ({}))
        const { inquiry_id, inquiry_data } = body;

        console.log("Processing Inquiry. ID:", inquiry_id);

        // 1. Resolve Applicant ID (Auto-Registration)
        let userId = inquiry_data?.applicant_id;
        const userEmail = inquiry_data?.email;

        if (!userId && userEmail) {
            console.log("Applicant ID missing. Attempting auto-registration for:", userEmail);

            // A. Check if user exists in Profiles
            const { data: existingProfile } = await supabaseClient
                .from('profiles')
                .select('id')
                .eq('email', userEmail)
                .single();

            if (existingProfile) {
                console.log("Found existing profile:", existingProfile.id);
                userId = existingProfile.id;
            } else {
                // B. Create New User
                console.log("Creating new user...");
                const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: userEmail,
                    email_confirm: true,
                    user_metadata: {
                        name: inquiry_data.applicant_name || 'Záujemca',
                        role: 'user'
                    }
                });

                if (createError) {
                    console.error("User creation failed (likely exists but no profile):", createError.message);
                    // If error is "User already registered", we technically need their ID.
                    // But if they have no profile, we can't find them easily without listUsers scan.
                    // For now, leave userId null if creation fails.
                } else if (newUser?.user) {
                    console.log("Created new user:", newUser.user.id);
                    userId = newUser.user.id;

                    // Verify Profile Exists (Trigger should handle it, but be safe)
                    // We can manually insert profile if we want to be 100% sure
                }
            }

            // C. Update Inquiry with new User ID
            if (userId && inquiry_id) {
                const { error: updateError } = await supabaseClient
                    .from('inquiries')
                    .update({ applicant_id: userId })
                    .eq('id', inquiry_id);

                if (updateError) console.error("Failed to link inquiry to user:", updateError);
                else console.log("Linked inquiry", inquiry_id, "to user", userId);
            }
        }

        // 2. Fetch Inquiry Data for Email (Standard Logic)
        let inquiry = null;
        let shelter = null;
        let pet = null;

        // Try fetch by ID first (now that it exists/inserted)
        if (inquiry_id) {
            const { data, error } = await supabaseClient
                .from('inquiries')
                .select(`*, pets (name, image_url), shelter:shelter_id (email, name, email_notifications_enabled)`)
                .eq('id', inquiry_id)
                .single();

            if (!error && data) {
                inquiry = data;
                pet = data.pets;
                shelter = data.shelter;
            }
        }

        // Fallback to provided data if fetch failed (e.g. latency/RLS oddity)
        if (!inquiry && inquiry_data) {
            inquiry = inquiry_data;
            if (inquiry.pet_id) {
                const { data: petData } = await supabaseClient.from('pets').select('name, image_url').eq('id', inquiry.pet_id).single();
                pet = petData;
            }
            if (inquiry.shelter_id) {
                const { data: shelterData } = await supabaseClient.from('profiles').select('email, name, email_notifications_enabled').eq('id', inquiry.shelter_id).single();
                shelter = shelterData;
            }
        }

        if (!inquiry || !shelter) {
            console.error("Inquiry or Shelter not found.");
            return new Response(JSON.stringify({ error: "Data missing" }), { status: 400, headers: corsHeaders });
        }

        const petName = pet?.name || 'Zvieratko';
        const applicantName = inquiry.applicant_name || 'Záujemca';

        if (shelter.email_notifications_enabled === false) {
            return new Response(JSON.stringify({ message: "Notifications disabled" }), { headers: corsHeaders });
        }

        if (!resendApiKey) throw new Error("Missing Resend API Key");

        // Send Email
        const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
                from: 'LabkaNádeje <notifikacie@labkanadeje.sk>',
                to: shelter.email,
                subject: `Nový záujem o ${petName}`,
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                    <h2 style="color: #4f46e5; margin-top: 0;">Nový adoptívny dopyt 🐾</h2>
                    <p>Ahoj <b>${shelter.name}</b>,</p>
                    <p>Používateľ <b>${applicantName}</b> prejavil záujem o zvieratko <b>${petName}</b>.</p>
                    
                    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px 0;"><b>Správa od záujemcu:</b></p>
                        <p style="margin: 0; font-style: italic; color: #4b5563;">"${inquiry.message}"</p>
                    </div>

                    <div style="background-color: #f3f4f6; padding: 12px; border-radius: 8px; font-size: 14px; color: #374151;">
                        <p style="margin: 5px 0;">📧 Email: ${inquiry.email}</p>
                        <p style="margin: 5px 0;">📞 Telefón: ${inquiry.phone || 'Neuvedený'}</p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                      <a href="https://labkanadeje.sk/#/shelter/dashboard" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Zobraziť v Dashboarde</a>
                    </div>
                  </div>
                `,
            }),
        });

        const emailData = await emailRes.json();
        return new Response(JSON.stringify(emailData), { headers: corsHeaders });

    } catch (err: any) {
        console.error("Handler error:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
})
