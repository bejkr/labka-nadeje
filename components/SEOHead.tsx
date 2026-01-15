import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
    title: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article' | 'profile';
    url?: string;
    petDetails?: {
        name: string;
        breed: string;
        shelterName?: string;
    };
}

const SEOHead: React.FC<SEOHeadProps> = ({
    title,
    description = "Nájdite svojho nového najlepšieho priateľa. Labka Nádeje spája útulky so záujemcami o adopciu po celom Slovensku.",
    image = "https://labkanadeje.sk/og-image.jpg", // Default OG Image
    type = "website",
    url = window.location.href,
    petDetails
}) => {
    // Ensure title always has suffix
    const fullTitle = title.includes("Labka") ? title : `${title} | Labka Nádeje`;

    // Construct Dynamic OG Image URL if pet details are present
    let finalImage = image;
    if (petDetails && image !== "https://labkanadeje.sk/og-image.jpg") {
        const supabaseUrl = 'https://qcwoyklifcekulkhrqmz.supabase.co'; // Using the URL from supabaseClient.ts
        const params = new URLSearchParams({
            name: petDetails.name,
            breed: petDetails.breed,
            image: image, // Pass the pet's photo URL
            shelter: petDetails.shelterName || 'Labka Nádeje'
        });
        finalImage = `${supabaseUrl}/functions/v1/og-image?${params.toString()}`;
    }

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={finalImage} />
        </Helmet>
    );
};

export default SEOHead;
