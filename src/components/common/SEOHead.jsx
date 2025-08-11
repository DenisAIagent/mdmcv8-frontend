import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title = "Marketing Musical Professionnel | MDMC Music Ads",
  description = "Agence marketing musical spécialisée YouTube, Meta, TikTok. Boostez vos streams et découvrez votre audience avec nos experts en promotion d'artistes.",
  keywords = "marketing musical, promotion artiste, publicité YouTube musique, campagne Meta musique, TikTok musical, augmenter streams Spotify, marketing digital label",
  url = "https://www.mdmcmusicads.com",
  image = "https://www.mdmcmusicads.com/og-image.jpg",
  type = "website",
  schemaType = "LocalBusiness",
  additionalSchema = null,
  canonicalUrl = null,
  noindex = false,
  structuredData = null
}) => {
  
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": "MDMC Music Ads",
    "alternateName": "MDMC",
    "description": "Agence de marketing musical spécialisée dans la promotion d'artistes sur YouTube, Meta et TikTok",
    "url": "https://www.mdmcmusicads.com",
    "logo": "https://www.mdmcmusicads.com/assets/images/logo.png",
    "image": "https://www.mdmcmusicads.com/og-image.jpg",
    "telephone": "+33-1-XX-XX-XX-XX",
    "email": "contact@mdmcmusicads.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "FR",
      "addressLocality": "France"
    },
    "sameAs": [
      "https://www.linkedin.com/company/mdmc-music-ads",
      "https://blog.mdmcmusicads.com"
    ],
    "serviceType": "Marketing Musical",
    "areaServed": [
      {
        "@type": "Country",
        "name": "France"
      },
      {
        "@type": "Country", 
        "name": "Europe"
      },
      {
        "@type": "Country",
        "name": "États-Unis"
      },
      {
        "@type": "Country",
        "name": "Canada"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services Marketing Musical",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Publicité YouTube pour Artistes",
            "description": "Campagnes publicitaires YouTube optimisées pour augmenter vos streams et découvrir votre audience"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Meta Ads pour Musiciens",
            "description": "Promotion sur Facebook et Instagram pour artistes et labels indépendants"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Marketing TikTok Musical",
            "description": "Stratégies TikTok pour faire découvrir votre musique à une audience jeune"
          }
        }
      ]
    }
  };

  // Merge avec des données structurées additionnelles si fournies
  const finalStructuredData = structuredData || (additionalSchema ? 
    { ...defaultStructuredData, ...additionalSchema } : 
    defaultStructuredData
  );

  return (
    <Helmet>
      {/* Meta données de base */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="MDMC Music Ads - Agence Marketing Musical" />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="MDMC Music Ads" />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@mdmcmusicads" />
      <meta name="twitter:creator" content="@mdmcmusicads" />
      
      {/* Données structurées Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData, null, 2)}
      </script>
      
      {/* Meta techniques pour performance */}
      <meta name="theme-color" content="#e50914" />
      <meta name="msapplication-TileColor" content="#e50914" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Preconnect pour performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link rel="preconnect" href="https://blog.mdmcmusicads.com" />
      <link rel="preconnect" href="https://api.mdmcmusicads.com" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//youtube.com" />
      <link rel="dns-prefetch" href="//spotify.com" />
      <link rel="dns-prefetch" href="//tiktok.com" />
      <link rel="dns-prefetch" href="//facebook.com" />
      <link rel="dns-prefetch" href="//instagram.com" />
    </Helmet>
  );
};

export default SEOHead;