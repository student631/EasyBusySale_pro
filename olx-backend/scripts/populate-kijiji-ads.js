const { Pool } = require('pg');
require('dotenv').config({ path: '../config.env' });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'olx_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Sample ads data inspired by Kijiji categories
const sampleAds = [
  // Cars & Vehicles
  {
    title: '2019 Honda Civic EX - Excellent Condition',
    description: 'One owner, low mileage Honda Civic in excellent condition. Recent oil change, winter tires included.',
    price: 22500,
    category: 'vehicles',
    location: 'Toronto, ON',
    images: ['https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop'],
    user_id: 1
  },
  {
    title: '2020 Toyota RAV4 LE AWD',
    description: 'Reliable SUV with all-wheel drive. Perfect for Canadian winters. Well maintained.',
    price: 32900,
    category: 'vehicles',
    location: 'Vancouver, BC',
    images: ['https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=400&h=300&fit=crop'],
    user_id: 1
  },
  {
    title: '2018 Ford F-150 XLT Pickup Truck',
    description: 'Heavy duty pickup truck, perfect for work or play. 4x4 capability, towing package.',
    price: 38500,
    category: 'vehicles',
    location: 'Calgary, AB',
    images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'],
    user_id: 1
  },

  // Real Estate
  {
    title: 'Spacious 2BR Apartment Downtown',
    description: 'Modern 2-bedroom apartment in the heart of downtown. Close to transit, shops, and restaurants.',
    price: 2200,
    category: 'real-estate',
    location: 'Montreal, QC',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'],
    user_id: 1
  },
  {
    title: 'Beautiful 3BR House for Rent',
    description: 'Family-friendly neighborhood, large backyard, updated kitchen, 2-car garage.',
    price: 2800,
    category: 'real-estate',
    location: 'Ottawa, ON',
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'],
    user_id: 1
  },

  // Electronics & Technology
  {
    title: 'iPhone 14 Pro Max 256GB - Like New',
    description: 'Barely used iPhone 14 Pro Max in Space Black. Includes original box, charger, and screen protector.',
    price: 1200,
    category: 'electronics',
    location: 'Toronto, ON',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'],
    user_id: 1
  },
  {
    title: 'MacBook Pro 16" M1 Max (2021)',
    description: 'Professional laptop in excellent condition. Perfect for video editing, programming, and design work.',
    price: 2800,
    category: 'electronics',
    location: 'Vancouver, BC',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop'],
    user_id: 1
  },
  {
    title: 'Samsung 65" 4K Smart TV',
    description: 'Crystal clear 4K display with smart TV features. Wall mount included.',
    price: 800,
    category: 'electronics',
    location: 'Calgary, AB',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop'],
    user_id: 1
  },

  // Furniture & Home
  {
    title: 'Modern Sectional Sofa - Grey',
    description: 'Comfortable L-shaped sectional sofa in excellent condition. Perfect for family room.',
    price: 1200,
    category: 'furniture',
    location: 'Toronto, ON',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'],
    user_id: 1
  },
  {
    title: 'Dining Table Set with 6 Chairs',
    description: 'Solid wood dining table with matching chairs. Great for family dinners.',
    price: 900,
    category: 'furniture',
    location: 'Montreal, QC',
    images: ['https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=400&h=300&fit=crop'],
    user_id: 1
  },

  // Jobs
  {
    title: 'Software Developer - Remote',
    description: 'Full-stack developer position with competitive salary. React, Node.js experience required.',
    price: 85000,
    category: 'jobs',
    location: 'Toronto, ON',
    images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop'],
    user_id: 1
  },
  {
    title: 'Marketing Manager - Healthcare',
    description: 'Seeking experienced marketing manager for growing healthcare company.',
    price: 70000,
    category: 'jobs',
    location: 'Vancouver, BC',
    images: ['https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=300&fit=crop'],
    user_id: 1
  },

  // Sports & Recreation
  {
    title: 'Mountain Bike - Trek X-Caliber 8',
    description: 'Excellent condition mountain bike, perfect for trails and city riding.',
    price: 1100,
    category: 'sports',
    location: 'Calgary, AB',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
    user_id: 1
  },
  {
    title: 'Hockey Gear Set - Adult Large',
    description: 'Complete hockey equipment set including helmet, pads, skates, and stick.',
    price: 450,
    category: 'sports',
    location: 'Montreal, QC',
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'],
    user_id: 1
  },

  // Fashion & Clothing
  {
    title: 'Canada Goose Winter Jacket - XL',
    description: 'Authentic Canada Goose parka in excellent condition. Perfect for harsh winters.',
    price: 600,
    category: 'clothing',
    location: 'Toronto, ON',
    images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop'],
    user_id: 1
  },
  {
    title: 'Designer Handbag Collection',
    description: 'Authentic designer handbags from various luxury brands. Excellent condition.',
    price: 800,
    category: 'clothing',
    location: 'Vancouver, BC',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop'],
    user_id: 1
  },

  // Pets
  {
    title: 'Golden Retriever Puppies',
    description: 'Beautiful Golden Retriever puppies looking for loving homes. Vaccinated and health checked.',
    price: 1500,
    category: 'pets',
    location: 'Ottawa, ON',
    images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop'],
    user_id: 1
  },
  {
    title: 'Cat Supplies Bundle',
    description: 'Complete set of cat supplies including carrier, food bowls, toys, and scratching post.',
    price: 120,
    category: 'pets',
    location: 'Montreal, QC',
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop'],
    user_id: 1
  },

  // Services
  {
    title: 'Professional House Cleaning Service',
    description: 'Reliable and thorough house cleaning service. Licensed and insured.',
    price: 150,
    category: 'services',
    location: 'Toronto, ON',
    images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'],
    user_id: 1
  },
  {
    title: 'Web Development Services',
    description: 'Custom websites and web applications. Free consultation available.',
    price: 2500,
    category: 'services',
    location: 'Vancouver, BC',
    images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'],
    user_id: 1
  },

  // Books & Media
  {
    title: 'Vintage Vinyl Record Collection',
    description: 'Rare vinyl records from the 60s-80s. Classic rock, jazz, and blues albums.',
    price: 350,
    category: 'books',
    location: 'Calgary, AB',
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'],
    user_id: 1
  },
  {
    title: 'University Textbooks - Engineering',
    description: 'Collection of engineering textbooks in excellent condition. Various subjects.',
    price: 200,
    category: 'books',
    location: 'Montreal, QC',
    images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'],
    user_id: 1
  }
];

// Generate additional ads to reach 200+
function generateMoreAds() {
  const cities = ['Toronto, ON', 'Vancouver, BC', 'Montreal, QC', 'Calgary, AB', 'Ottawa, ON', 'Winnipeg, MB', 'Quebec City, QC', 'Halifax, NS'];
  const categories = ['vehicles', 'real-estate', 'electronics', 'furniture', 'jobs', 'sports', 'clothing', 'pets', 'services', 'books'];

  const templates = {
    vehicles: [
      { title: '2020 Mazda CX-5 GS AWD', desc: 'Reliable compact SUV with all-wheel drive. Great fuel economy.' },
      { title: '2018 BMW 3 Series 330i', desc: 'Luxury sedan with premium features. Well maintained.' },
      { title: '2021 Jeep Wrangler Unlimited', desc: 'Adventure-ready SUV perfect for off-road exploration.' }
    ],
    electronics: [
      { title: 'iPad Pro 12.9" with Apple Pencil', desc: 'Professional tablet perfect for creative work.' },
      { title: 'Gaming PC - RTX 3080', desc: 'High-performance gaming computer with latest graphics.' },
      { title: 'Sony WH-1000XM4 Headphones', desc: 'Premium noise-canceling headphones in mint condition.' }
    ],
    furniture: [
      { title: 'Queen Size Bed Frame', desc: 'Solid wood bed frame in excellent condition.' },
      { title: 'Office Desk with Drawers', desc: 'Spacious desk perfect for home office setup.' },
      { title: 'Vintage Coffee Table', desc: 'Unique mid-century modern coffee table.' }
    ]
  };

  const additionalAds = [];
  for (let i = 0; i < 180; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const template = templates[category] || templates.electronics;
    const item = template[Math.floor(Math.random() * template.length)];

    additionalAds.push({
      title: `${item.title} #${i + 1}`,
      description: item.desc,
      price: Math.floor(Math.random() * 5000) + 50,
      category: category,
      location: city,
      images: ['https://images.unsplash.com/photo-1560472354-7cd4f7e4c1c8?w=400&h=300&fit=crop'],
      user_id: 1
    });
  }

  return additionalAds;
}

async function populateAds() {
  try {
    console.log('🚀 Starting to populate Kijiji-style ads...');

    // Combine sample ads with generated ones
    const allAds = [...sampleAds, ...generateMoreAds()];
    console.log(`📊 Total ads to insert: ${allAds.length}`);

    // First, create a default user if it doesn't exist
    const userResult = await pool.query(`
      INSERT INTO users (username, email, password_hash, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['system', 'system@kijiji.local', 'hashed_password']);

    // Insert ads
    let insertedCount = 0;
    for (const ad of allAds) {
      try {
        await pool.query(`
          INSERT INTO advertisements (
            title, description, price, category, location,
            images, user_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        `, [
          ad.title,
          ad.description,
          ad.price,
          ad.category,
          ad.location,
          JSON.stringify(ad.images),
          ad.user_id
        ]);
        insertedCount++;

        if (insertedCount % 50 === 0) {
          console.log(`✅ Inserted ${insertedCount} ads so far...`);
        }
      } catch (err) {
        console.log(`⚠️ Error inserting ad "${ad.title}":`, err.message);
      }
    }

    console.log(`🎉 Successfully inserted ${insertedCount} ads!`);
    console.log('📝 Categories populated:');

    // Show category counts
    const categoryStats = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM advertisements
      GROUP BY category
      ORDER BY count DESC
    `);

    categoryStats.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count} ads`);
    });

  } catch (error) {
    console.error('❌ Error populating ads:', error);
  } finally {
    await pool.end();
  }
}

// Run the population script
if (require.main === module) {
  populateAds();
}

module.exports = { populateAds };