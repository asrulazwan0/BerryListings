import { PrismaClient } from '@prisma/client';
import generateUniqueId from '../src/utils/unique-id.js';
import { ROLE_PERMISSIONS } from '../src/utils/permissions.js';

const prisma = new PrismaClient();

// Unsplash CDN URLs — high-quality free photos (direct hotlinks)
const UNSPLASH_URLS = {
  house: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
  ],
  condo: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  ],
  townhome: [
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
  ],
  interior: [
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
    'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  ],
};

// Local images (from our Unsplash download)
const LOCAL_IMAGES = {
  house: ['/images/modern-house-exterior-01.jpg', '/images/modern-house-exterior-02.jpg', '/images/modern-house-exterior-03.jpg'],
  condo: ['/images/luxury-condo-building-01.jpg', '/images/luxury-condo-building-02.jpg', '/images/luxury-condo-building-03.jpg'],
  townhome: ['/images/townhouse-exterior-01.jpg', '/images/townhouse-exterior-02.jpg', '/images/townhouse-exterior-03.jpg'],
  interior: ['/images/apartment-interior-01.jpg', '/images/apartment-interior-02.jpg', '/images/modern-kitchen-01.jpg'],
};

const properties = [
  { title: 'Sunset Villa', type: 'HOUSE', status: 'ACTIVE', price: 850000, city: 'Kuala Lumpur', bedrooms: 5, bathrooms: 3.5, sqft: 3200, lot: 0.35, year: 2022, desc: 'Stunning modern villa with panoramic sunset views. Floor-to-ceiling windows, infinity pool, and a chef\'s kitchen with Italian marble countertops.', amenities: ['Pool', 'Garden', 'Smart Home', 'EV Charger', 'Security System'], imageType: 'url' },
  { title: 'The Pearl Residences #12A', type: 'CONDO', status: 'ACTIVE', price: 620000, city: 'Petaling Jaya', bedrooms: 3, bathrooms: 2, sqft: 1450, lot: null, year: 2023, desc: 'Premium corner unit on the 12th floor. Open-concept living with city skyline views. Resort-style amenities including gym, pool, and concierge.', amenities: ['Gym', 'Pool', 'Concierge', 'Covered Parking', 'Rooftop Garden'], imageType: 'local' },
  { title: 'Heritage Townhome #7', type: 'TOWNHOME', status: 'ACTIVE', price: 480000, city: 'Shah Alam', bedrooms: 4, bathrooms: 2.5, sqft: 2100, lot: 0.12, year: 2020, desc: 'Charming 3-storey townhome in a gated community. Private garden, modern fittings, walking distance to LRT and shopping.', amenities: ['Gated Community', 'Private Garden', 'Near LRT', 'Children\'s Playground'], imageType: 'url' },
  { title: 'Greenfield Lot 42', type: 'LAND', status: 'ACTIVE', price: 280000, city: 'Cyberjaya', bedrooms: 0, bathrooms: 0, sqft: 0, lot: 0.5, year: null, desc: 'Prime half-acre residential lot in fast-growing Cyberjaya. Ready to build with utilities at the boundary. Close to universities and tech parks.', amenities: ['Utilities Ready', 'Flat Terrain', 'Gated Access'], imageType: 'local' },
  { title: 'Maple Residence', type: 'HOUSE', status: 'ACTIVE', price: 1200000, city: 'Mont Kiara', bedrooms: 6, bathrooms: 5, sqft: 4800, lot: 0.5, year: 2024, desc: 'Luxurious 6-bedroom bungalow in the heart of Mont Kiara. Private cinema, wine cellar, and landscaped tropical garden with koi pond.', amenities: ['Private Cinema', 'Wine Cellar', 'Koi Pond', 'Maid\'s Quarters', '6-Car Garage', 'Sauna'], imageType: 'url' },
  { title: 'SkyLoft @ KLCC', type: 'CONDO', status: 'ACTIVE', price: 950000, city: 'Kuala Lumpur', bedrooms: 2, bathrooms: 2, sqft: 1100, lot: null, year: 2025, desc: 'Brand-new luxury duplex penthouse with direct KLCC views. Designer interiors by award-winning studio. Walking distance to Pavilion and KLCC Park.', amenities: ['Duplex Layout', 'Designer Interior', 'KLCC View', 'Valet Parking', 'Rooftop Infinity Pool'], imageType: 'local' },
  { title: 'Riverside Townhome 3B', type: 'TOWNHOME', status: 'PENDING', price: 550000, city: 'Putrajaya', bedrooms: 4, bathrooms: 3, sqft: 2400, lot: 0.15, year: 2021, desc: 'Waterfront townhome overlooking Putrajaya Lake. Modern minimalist design with an emphasis on natural light and open spaces.', amenities: ['Lake View', 'Minimalist Design', 'Solar Panels', 'Bicycle Storage', 'Community Pool'], imageType: 'url' },
  { title: 'Meadow Land Phase 2', type: 'LAND', status: 'ACTIVE', price: 150000, city: 'Semenyih', bedrooms: 0, bathrooms: 0, sqft: 0, lot: 0.25, year: null, desc: 'Affordable residential land in upcoming Semenyih township. Near new MRT extension, schools, and retail. Perfect for first-time home builders.', amenities: ['MRT Access', 'Near Schools', 'Flat Lot'], imageType: 'local' },
  { title: 'The Ascent Tower A-21', type: 'CONDO', status: 'DRAFT', price: 780000, city: 'Bangsar', bedrooms: 3, bathrooms: 2, sqft: 1300, lot: null, year: 2024, desc: 'High-floor unit in Bangsar\'s newest landmark tower. Panoramic 270° views, smart home system, and exclusive resident lounge on the 40th floor.', amenities: ['Smart Home', '270° View', 'Resident Lounge', 'Yoga Studio', 'Pet-Friendly'], imageType: 'url' },
  { title: 'Jasmine Garden Bungalow', type: 'HOUSE', status: 'SOLD', price: 1680000, city: 'Damansara Heights', bedrooms: 5, bathrooms: 4, sqft: 4500, lot: 0.6, year: 2019, desc: 'Classic colonial-style bungalow with modern renovations. Mature jasmine garden, swimming pool, and a separate guest house. Sold above asking.', amenities: ['Swimming Pool', 'Guest House', 'Mature Garden', 'Colonial Architecture', 'Separate Staff Quarters'], imageType: 'local' },
];

async function main() {
  // 1. Create admin user
  const email = process.env.ADMIN_USER;
  if (!email) { console.log('ADMIN_USER not set — skipping seed.'); return; }

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', isEnabled: true, permissions: ROLE_PERMISSIONS.ADMIN },
    create: { uuid: generateUniqueId(), email, role: 'ADMIN', isEnabled: true, permissions: ROLE_PERMISSIONS.ADMIN },
  });
  console.log(`Admin: ${admin.email} (${admin.uuid})`);

  // 2. Create a regular demo user for public browsing
  const demoEmail = 'demo@berrylistings.local';
  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { role: 'USER', isEnabled: true },
    create: { uuid: generateUniqueId(), email: demoEmail, role: 'USER', isEnabled: true },
  });
  console.log(`Demo user: ${demoUser.email}`);

  // 3. Delete old seeded properties (keep manual ones)
  await prisma.propertyPhoto.deleteMany({ where: { property: { agentId: admin.id } } });
  await prisma.property.deleteMany({ where: { agentId: admin.id } });

  // 4. Create properties
  for (const p of properties) {
    const isUrl = p.imageType === 'url';
    const photoSet = isUrl ? UNSPLASH_URLS : LOCAL_IMAGES;
    const typeKey = p.type.toLowerCase();
    const photos = (photoSet[typeKey] || photoSet.house).map((url, i) => ({ url, position: i }));
    // Add an interior photo as second image
    if (photos.length > 1) {
      const interiorUrl = isUrl ? UNSPLASH_URLS.interior[0] : LOCAL_IMAGES.interior[0];
      photos.splice(1, 0, { url: interiorUrl, position: 1 });
      photos.forEach((ph, i) => (ph.position = i));
    }

    const prop = await prisma.property.create({
      data: {
        uuid: generateUniqueId(),
        title: p.title,
        description: p.desc,
        price: p.price,
        type: p.type,
        status: p.status,
        addressLine: `${Math.floor(Math.random() * 200) + 1} Jalan Example`,
        city: p.city,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        sqft: p.sqft,
        lotSizeAcres: p.lot,
        yearBuilt: p.year,
        amenities: p.amenities,
        agentId: admin.id,
        photos: { create: photos },
      },
    });
    console.log(`  ${prop.title} (${p.type}, ${p.status}) — ${photos.length} photos (${p.imageType})`);
  }

  console.log(`\nDone. ${properties.length} properties seeded.`);
  console.log('Login: POST /api/v1/auth/dev-login { "email": "asrulazwan90@gmail.com" }');
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
