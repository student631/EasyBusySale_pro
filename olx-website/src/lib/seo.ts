import type { Metadata } from 'next';

export const SITE_NAME = 'EasyBuySale';
export const SITE_TAGLINE = 'Buy & Sell Anything, Anytime, Anywhere';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const SITE_DESCRIPTION = 'EasyBuySale - Your trusted marketplace to buy and sell everything. From electronics to vehicles, real estate to fashion - find great deals or sell items quickly and easily.';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export function generateMetadata({
  title,
  description = SITE_DESCRIPTION,
  keywords = [],
  image = `${SITE_URL}/og-image.jpg`,
  url = SITE_URL,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
}: SEOProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - ${SITE_TAGLINE}`;

  const defaultKeywords = [
    'buy sell marketplace',
    'classified ads',
    'online shopping',
    'sell items online',
    'buy used items',
    'local marketplace',
    'EasyBuySale',
  ];

  const allKeywords = [...defaultKeywords, ...keywords];

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: author ? [{ name: author }] : [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    applicationName: SITE_NAME,

    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_US',
      type,
      publishedTime,
      modifiedTime,
    },

    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@EasyBuySale',
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    alternates: {
      canonical: url,
    },
  };
}

// Generate SEO-friendly title for ads
export function generateAdTitle(title: string, category: string, location: string): string {
  return `${title} - ${category} for Sale in ${location}`;
}

// Generate SEO-friendly description for ads
export function generateAdDescription(title: string, price: string, description: string, category: string): string {
  const shortDesc = description.length > 150
    ? description.substring(0, 150) + '...'
    : description;

  return `Buy ${title} online at ${price}. ${shortDesc} Find great deals on ${category} at EasyBuySale - Your trusted marketplace.`;
}

// Generate keywords for ads
export function generateAdKeywords(title: string, category: string, location: string, condition: string): string[] {
  const titleWords = title.toLowerCase().split(' ');
  return [
    ...titleWords,
    category.toLowerCase(),
    location.toLowerCase(),
    condition,
    'buy',
    'sell',
    'online',
    'marketplace',
    'classified ads',
    `${category} for sale`,
    `buy ${category}`,
    `${location} marketplace`,
  ];
}

// Generate structured data (JSON-LD) for ads
export function generateAdStructuredData(ad: {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  created_at: string;
  seller_name?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: ad.title,
    description: ad.description,
    image: ad.images,
    offers: {
      '@type': 'Offer',
      price: ad.price,
      priceCurrency: 'PKR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Person',
        name: ad.seller_name || 'EasyBuySale Seller',
      },
    },
    category: ad.category,
    url: `${SITE_URL}/ad/${ad.id}`,
  };
}
