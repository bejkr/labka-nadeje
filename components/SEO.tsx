import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
}

const SEO: React.FC<SEOProps> = ({
    title = 'LabkaNádeje - Adopcia Zvierat',
    description = 'Nájdite svojho verného priateľa. Platforma spájajúca útulky a milovníkov zvierat.',
    image = '/og-image.jpg', // Assuming a default OG image exists or will be added
    url = 'https://labkanadeje.sk', // Production URL
    type = 'website'
}) => {
    const siteTitle = title === 'LabkaNádeje - Adopcia Zvierat' ? title : `${title} | LabkaNádeje`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={siteTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;
