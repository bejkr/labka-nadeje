
import { ImageResponse } from 'https://deno.land/x/og_edge@0.0.4/mod.ts';

export default async function handler(req: Request) {
    const url = new URL(req.url);
    const params = url.searchParams;

    const name = params.get('name') || 'Labka';
    const breed = params.get('breed') || 'Hľadá domov';
    const imageUrl = params.get('image');
    const shelterName = params.get('shelter') || 'Labka Nádeje';

    return new ImageResponse(
        (
            <div
        style= {{
        height: '100%',
        width: '100%',
        display: 'flex',
        backgroundColor: '#f9f9f9',
        fontFamily: 'sans-serif',
    }}
      >
    {/* Left Side: Content */ }
    < div
style = {{
    display: 'flex',
        flexDirection: 'column',
            justifyContent: 'center',
                width: '40%',
                    padding: '40px',
                        backgroundColor: '#ffffff',
                            borderRight: '1px solid #e5e7eb',
          }}
        >
    <div
            style={
    {
        display: 'flex',
            alignItems: 'center',
                marginBottom: '20px',
                    color: '#ea580c', // brand-600
                        fontWeight: 700,
                            fontSize: '24px',
            }
}
          >
    <svg
              width="32"
height = "32"
viewBox = "0 0 24 24"
fill = "none"
stroke = "currentColor"
stroke - width="2"
stroke - linecap="round"
stroke - linejoin="round"
style = {{ marginRight: '10px' }}
            >
    <path d="M10 5.172C10 3.782 8.845 2.5 7.18 2.5c-1.875 0-3.328 1.4-3.528 3.528-.106 1.127.394 2.193 1.253 2.872.26.206.551.416.895.637 1.205.772 1.343.837 1.343.837s.138-.07.695-.456c.71-.49 1.405-1.12 1.83-1.92.292-.55.332-1.257.332-1.827z" > </path>
        < path d = "M14 5.172C14 3.782 15.155 2.5 16.82 2.5c1.875 0 3.328 1.4 3.528 3.528.106 1.127-.394 2.193-1.253 2.872-.26.206-.551.416-.895.637-1.205.772-1.343.837-1.343.837s-.138-.07-.695-.456c-.71-.49-1.405-1.12-1.83-1.92-.292-.55-.332-1.257-.332-1.827z" > </path>
            < path d = "M9.167 12.396a3.298 3.298 0 0 0-3.298 3.298c0 2.27 2.167 4.14 5.234 6.786.195.168.397.332.597.5l.004.003c.27.228.536.425.796.617.26-.192.526-.39.796-.617l.004-.003c.2-.168.402-.332.597-.5 3.067-2.646 5.234-4.516 5.234-6.786a3.298 3.298 0 0 0-3.298-3.298 3.303 3.303 0 0 0-2.33 1 3.3 3.3 0 0 0-2.333-1 3.3 3.3 0 0 0-2-2.333z" > </path>
                </svg>
            Labka Nádeje
    </div>

    < div
style = {{
    fontSize: '48px',
        fontWeight: 900,
            color: '#111827',
                lineHeight: 1.1,
                    marginBottom: '10px',
            }}
          >
    { name }
    </div>

    < div
style = {{
    fontSize: '24px',
        color: '#4b5563',
            marginBottom: '40px',
            }}
          >
    { breed }
    </div>

    < div
style = {{
    display: 'flex',
        alignItems: 'center',
            padding: '10px 20px',
                backgroundColor: '#fff7ed',
                    borderRadius: '50px',
                        color: '#ea580c',
                            fontWeight: 600,
                                fontSize: '18px',
                                    width: 'fit-content',
            }}
          >
    { shelterName }
    </div>
    </div>

{/* Right Side: Image */ }
<div
          style={
    {
        display: 'flex',
            width: '60%',
                backgroundColor: '#ffedd5',
                    alignItems: 'center',
                        justifyContent: 'center',
                            overflow: 'hidden',
          }
}
        >
    {
        imageUrl?(
            <img
              src = { imageUrl }
              width = "100%"
              height = "100%"
              style = {{
                objectFit: 'cover',
            }}
    />
          ) : (
    <div
                style= {{
    fontSize: '30px',
        color: '#ea580c',
            fontWeight: 'bold',
                }}
             >
    Foto čoskoro...
</div>
          )}

{/* Badge Overlay */ }
<div
            style={
    {
        position: 'absolute',
            bottom: '40px',
                right: '40px',
                    backgroundColor: '#ea580c',
                        color: 'white',
                            padding: '15px 30px',
                                borderRadius: '50px',
                                    fontSize: '24px',
                                        fontWeight: 900,
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }
}
          >
    Hľadám domov
        </div>
        </div>
        </div>
    ),
{
    width: 1200,
        height: 630,
    },
  );
}
