
import React from 'https://esm.sh/react@18.2.0';
import { ImageResponse } from 'https://deno.land/x/og_edge@0.0.4/mod.ts';

export default async function handler(req: Request) {
    const url = new URL(req.url);
    const params = url.searchParams;

    const name = params.get('name') || 'Labka';
    const breed = params.get('breed') || 'Hľadá domov';
    const imageUrl = params.get('image') ? decodeURIComponent(params.get('image')!) : null;
    const shelterName = params.get('shelter') || 'Labka Nádeje';

    const h = React.createElement;

    return new ImageResponse(
        h('div', {
            style: {
                height: '100%',
                width: '100%',
                display: 'flex',
                backgroundColor: '#f9f9f9',
                fontFamily: 'sans-serif',
            }
        }, [
            // LEFT SIDE
            h('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    width: '40%',
                    padding: '40px',
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid #e5e7eb',
                }
            }, [
                // Logo
                h('div', {
                    style: {
                        display: 'flex', alignItems: 'center', marginBottom: '20px', color: '#ea580c', fontWeight: 700, fontSize: '24px'
                    }
                }, [
                    // SVG Path roughly approximated or just text for safety/speed, but let's try the SVG if possible.
                    // Using a simple unicode paw or just text is safer for createElement, but let's try nesting.
                    // actually just text "🐾 Labka Nádeje" is fine for the logo header
                    '🐾 Labka Nádeje'
                ]),
                // Name
                h('div', {
                    style: { fontSize: '48px', fontWeight: 900, color: '#111827', lineHeight: 1.1, marginBottom: '10px' }
                }, name),
                // Breed
                h('div', {
                    style: { fontSize: '24px', color: '#4b5563', marginBottom: '40px' }
                }, breed),
                // Shelter Tag
                h('div', {
                    style: { display: 'flex', alignItems: 'center', padding: '10px 20px', backgroundColor: '#fff7ed', borderRadius: '50px', color: '#ea580c', fontWeight: 600, fontSize: '18px', width: 'fit-content' }
                }, shelterName)
            ]),

            // RIGHT SIDE
            h('div', {
                style: {
                    display: 'flex',
                    width: '60%',
                    backgroundColor: '#ffedd5',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative' // for badge
                }
            }, [
                imageUrl ? h('img', {
                    src: imageUrl,
                    width: '100%',
                    height: '100%',
                    style: { objectFit: 'cover' }
                }) : h('div', { style: { fontSize: '30px', color: '#ea580c', fontWeight: 'bold' } }, 'Foto čoskoro...'),

                // Badge
                h('div', {
                    style: {
                        position: 'absolute',
                        bottom: '40px',
                        right: '40px',
                        backgroundColor: '#ea580c',
                        color: 'white',
                        padding: '15px 30px',
                        borderRadius: '50px',
                        fontSize: '24px',
                        fontWeight: 900,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }
                }, 'Hľadám domov')
            ])
        ]),
        {
            width: 1200,
            height: 630,
        }
    );
}

Deno.serve(handler);
