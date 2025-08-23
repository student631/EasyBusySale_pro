import { NextResponse } from 'next/server';

type AdItem = {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  price: string;
  description: string;
  location: string;
  condition: string;
  images?: string[]; // base64 data URLs or remote URLs
  createdAt: string;
};

// In-memory store (resets on server restart)
const adsStore: AdItem[] = [];

export async function GET() {
  return NextResponse.json({ ads: adsStore });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requiredFields = ['title', 'category', 'price', 'description', 'location'];
    for (const field of requiredFields) {
      if (!body?.[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    const newAd: AdItem = {
      id: Math.random().toString(36).slice(2),
      title: String(body.title),
      category: String(body.category),
      subcategory: body.subcategory ? String(body.subcategory) : undefined,
      price: String(body.price),
      description: String(body.description),
      location: String(body.location),
      condition: body.condition ? String(body.condition) : 'new',
      images: Array.isArray(body.images) ? body.images.slice(0, 5).map(String) : [],
      createdAt: new Date().toISOString(),
    };

    adsStore.unshift(newAd);
    return NextResponse.json({ ad: newAd }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}


