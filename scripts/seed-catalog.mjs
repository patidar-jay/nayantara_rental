// ============================================================================
// Seed Script — Premium Catalog for Nayantara Rentals
// Run: node scripts/seed-catalog.mjs
// 
// Creates categories + products + product_media records directly in Supabase.
// Uses reference image product photos as initial catalog images.
// Everything is admin-editable after seeding.
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Supabase Config (reads from .env)
// ---------------------------------------------------------------------------

const dotenvPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(dotenvPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: Missing VITE_SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('To seed the database and upload images, we need to bypass Row Level Security (RLS).');
  console.error('Please add your Service Role Key to the .env file like this:');
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY=your-secret-service-role-key');
  console.error('\nYou can find it in your Supabase Dashboard -> Project Settings -> API.\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: ws },
  auth: { persistSession: false, autoRefreshToken: false },
});
const BUCKET = 'product-media';

// ---------------------------------------------------------------------------
// Reference Image Paths
// ---------------------------------------------------------------------------

const REF_DIR = path.resolve(process.cwd(), 'reference_images');
const refImages = fs.readdirSync(REF_DIR)
  .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))
  .sort();

console.log(`📁 Found ${refImages.length} reference images`);

// ---------------------------------------------------------------------------
// Upload helper — uploads a local file to Supabase Storage
// ---------------------------------------------------------------------------

async function uploadImage(localPath, storagePath) {
  const fileBuffer = fs.readFileSync(localPath);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.warn(`  ⚠️  Upload warning for ${storagePath}: ${error.message}`);
    // Try to get public URL anyway (file might already exist)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const CATEGORIES = [
  {
    name: 'Bridal Lehengas',
    slug: 'bridal-lehengas',
    description: 'Exquisite bridal lehengas featuring intricate embroidery, premium fabrics and timeless wedding aesthetics.',
    sort_order: 1,
  },
  {
    name: 'Designer Sarees',
    slug: 'designer-sarees',
    description: 'Elegant designer sarees for every occasion — from silk to georgette, traditional to contemporary.',
    sort_order: 2,
  },
  {
    name: 'Wedding Jewellery',
    slug: 'wedding-jewellery',
    description: 'Stunning kundan, polki and temple jewellery sets to complete your bridal look.',
    sort_order: 3,
  },
  {
    name: 'Reception Gowns',
    slug: 'reception-gowns',
    description: 'Glamorous reception gowns and evening wear for your special celebrations.',
    sort_order: 4,
  },
  {
    name: 'Indo-Western',
    slug: 'indo-western',
    description: 'Contemporary Indo-Western fusion outfits blending traditional elegance with modern style.',
    sort_order: 5,
  },
  {
    name: 'Wedding Accessories',
    slug: 'wedding-accessories',
    description: 'Complete your look with premium dupattas, clutches, footwear and styling accessories.',
    sort_order: 6,
  },
];

// ---------------------------------------------------------------------------
// Products (18 premium products across 6 categories)
// ---------------------------------------------------------------------------

const PRODUCTS = [
  // ---- Bridal Lehengas (3 products) ----
  {
    category_slug: 'bridal-lehengas',
    name: 'Red Embroidered Bridal Lehenga',
    slug: 'red-embroidered-bridal-lehenga',
    description: 'A magnificent red bridal lehenga adorned with intricate zari and sequin embroidery. Crafted from premium velvet and silk, this timeless piece features traditional motifs with contemporary detailing. Perfect for the modern bride who wants to make a grand statement on her wedding day.',
    rental_price_per_day: 4500,
    total_quantity: 3,
    is_featured: true,
    sort_order: 1,
    specifications: { Fabric: 'Silk Velvet', Work: 'Zari & Sequin Embroidery', Color: 'Royal Red', Weight: '3.5 kg', Dupatta: 'Included', Blouse: 'Semi-stitched' },
    ref_image_idx: 0, // Use first reference image
  },
  {
    category_slug: 'bridal-lehengas',
    name: 'Maroon Gold Bridal Ensemble',
    slug: 'maroon-gold-bridal-ensemble',
    description: 'An opulent maroon and gold bridal lehenga with hand-embroidered floral patterns. Features a heavy cancan underskirt for the perfect silhouette and a matching dupatta with gold border work. A showstopper piece for the bride who dreams of royalty.',
    rental_price_per_day: 5500,
    total_quantity: 2,
    is_featured: true,
    sort_order: 2,
    specifications: { Fabric: 'Raw Silk', Work: 'Hand Embroidery', Color: 'Maroon & Gold', Weight: '4 kg', Dupatta: 'Heavy Border', Blouse: 'Customizable' },
    ref_image_idx: 1,
  },
  {
    category_slug: 'bridal-lehengas',
    name: 'Pastel Pink Lehenga Set',
    slug: 'pastel-pink-lehenga-set',
    description: 'A dreamy pastel pink lehenga with delicate thread work and pearl embellishments. Lightweight yet luxurious, this piece is perfect for day weddings and engagement ceremonies. The subtle color palette exudes elegance and grace.',
    rental_price_per_day: 3800,
    total_quantity: 4,
    is_featured: false,
    sort_order: 3,
    specifications: { Fabric: 'Net & Satin', Work: 'Thread & Pearl', Color: 'Pastel Pink', Weight: '2.5 kg', Dupatta: 'Included', Blouse: 'Stitched' },
    ref_image_idx: 2,
  },

  // ---- Designer Sarees (3 products) ----
  {
    category_slug: 'designer-sarees',
    name: 'Banarasi Silk Saree',
    slug: 'banarasi-silk-saree',
    description: 'A timeless Banarasi silk saree with rich gold zari weaving and traditional butta motifs. This heritage piece represents centuries of weaving artistry and is perfect for weddings, pujas, and festive celebrations.',
    rental_price_per_day: 2200,
    total_quantity: 5,
    is_featured: true,
    sort_order: 4,
    specifications: { Fabric: 'Pure Banarasi Silk', Work: 'Zari Weaving', Color: 'Red & Gold', Length: '6.3 meters', Blouse: '0.8m Unstitched' },
    ref_image_idx: 3,
  },
  {
    category_slug: 'designer-sarees',
    name: 'Emerald Green Organza Saree',
    slug: 'emerald-green-organza-saree',
    description: 'A stunning emerald green organza saree with hand-painted floral motifs and crystal embellishments. The sheer fabric drapes beautifully, creating an ethereal silhouette perfect for cocktail parties and evening events.',
    rental_price_per_day: 1800,
    total_quantity: 3,
    is_featured: false,
    sort_order: 5,
    specifications: { Fabric: 'Organza', Work: 'Hand Painted', Color: 'Emerald Green', Length: '6 meters', Blouse: 'Pre-stitched' },
    ref_image_idx: 4,
  },
  {
    category_slug: 'designer-sarees',
    name: 'Navy Blue Sequin Saree',
    slug: 'navy-blue-sequin-saree',
    description: 'A contemporary navy blue saree featuring all-over sequin work and a contrasting gold border. Lightweight and easy to drape, this glamorous piece is ideal for reception parties and formal celebrations.',
    rental_price_per_day: 2000,
    total_quantity: 4,
    is_featured: false,
    sort_order: 6,
    specifications: { Fabric: 'Georgette', Work: 'Sequin', Color: 'Navy Blue', Length: '6 meters', Blouse: 'Ready-made' },
    ref_image_idx: 5,
  },

  // ---- Wedding Jewellery (3 products) ----
  {
    category_slug: 'wedding-jewellery',
    name: 'Royal Kundan Bridal Set',
    slug: 'royal-kundan-bridal-set',
    description: 'A magnificent kundan bridal jewellery set featuring a statement necklace, matching earrings, tikka and bangles. Each piece is meticulously crafted with premium kundan stones set in gold-plated brass.',
    rental_price_per_day: 3500,
    total_quantity: 3,
    is_featured: true,
    sort_order: 7,
    specifications: { Material: 'Gold-Plated Brass', Stones: 'Kundan & Pearls', Pieces: 'Necklace, Earrings, Tikka, Bangles', Weight: '350g total' },
    ref_image_idx: 6,
  },
  {
    category_slug: 'wedding-jewellery',
    name: 'Temple Gold Necklace Set',
    slug: 'temple-gold-necklace-set',
    description: 'A traditional South Indian temple jewellery set with intricate deity motifs and ruby-emerald accents. Perfect for traditional weddings, temple ceremonies and cultural events.',
    rental_price_per_day: 2800,
    total_quantity: 4,
    is_featured: false,
    sort_order: 8,
    specifications: { Material: 'Antique Gold Plated', Stones: 'Ruby & Emerald', Pieces: 'Long Necklace, Jhumkas, Kamarbandh' },
    ref_image_idx: 7,
  },
  {
    category_slug: 'wedding-jewellery',
    name: 'Pearl & Diamond Choker Set',
    slug: 'pearl-diamond-choker-set',
    description: 'An elegant pearl and American diamond choker set with matching studs and maang tikka. The perfect blend of tradition and modernity for contemporary brides.',
    rental_price_per_day: 2500,
    total_quantity: 3,
    is_featured: false,
    sort_order: 9,
    specifications: { Material: 'Silver Plated', Stones: 'Freshwater Pearls & AD', Pieces: 'Choker, Studs, Tikka' },
    ref_image_idx: 8,
  },

  // ---- Reception Gowns (3 products) ----
  {
    category_slug: 'reception-gowns',
    name: 'Champagne Gold Gown',
    slug: 'champagne-gold-gown',
    description: 'A breathtaking champagne gold reception gown with a fitted bodice and flowing train. Adorned with crystal beading and delicate lacework, this gown brings Hollywood glamour to your celebration.',
    rental_price_per_day: 3200,
    total_quantity: 2,
    is_featured: true,
    sort_order: 10,
    specifications: { Fabric: 'Satin & Tulle', Work: 'Crystal Beading', Color: 'Champagne Gold', Style: 'A-line with Train' },
    ref_image_idx: 9,
  },
  {
    category_slug: 'reception-gowns',
    name: 'Wine Red Evening Gown',
    slug: 'wine-red-evening-gown',
    description: 'A dramatic wine red evening gown featuring a sweetheart neckline, corset bodice and a luxurious flared skirt. The rich color and premium fabric make this an unforgettable choice for receptions and galas.',
    rental_price_per_day: 2800,
    total_quantity: 3,
    is_featured: false,
    sort_order: 11,
    specifications: { Fabric: 'Velvet & Net', Work: 'Sequin Border', Color: 'Wine Red', Style: 'Ball Gown' },
    ref_image_idx: 10,
  },
  {
    category_slug: 'reception-gowns',
    name: 'Midnight Blue Mermaid Gown',
    slug: 'midnight-blue-mermaid-gown',
    description: 'A stunning midnight blue mermaid-silhouette gown with all-over sequin work and a dramatic fishtail. Perfect for cocktail receptions and evening celebrations.',
    rental_price_per_day: 2600,
    total_quantity: 3,
    is_featured: false,
    sort_order: 12,
    specifications: { Fabric: 'Lycra & Net', Work: 'Sequin', Color: 'Midnight Blue', Style: 'Mermaid' },
    ref_image_idx: 11,
  },

  // ---- Indo-Western (3 products) ----
  {
    category_slug: 'indo-western',
    name: 'Designer Anarkali Suit',
    slug: 'designer-anarkali-suit',
    description: 'A contemporary designer Anarkali suit with modern geometric embroidery and a flowing silhouette. Features palazzo pants and a statement dupatta for a fusion look that bridges tradition and trend.',
    rental_price_per_day: 1800,
    total_quantity: 5,
    is_featured: true,
    sort_order: 13,
    specifications: { Fabric: 'Georgette', Work: 'Machine Embroidery', Color: 'Ivory & Gold', Style: 'Floor-length Anarkali' },
    ref_image_idx: 0,
  },
  {
    category_slug: 'indo-western',
    name: 'Fusion Sharara Set',
    slug: 'fusion-sharara-set',
    description: 'A trendy fusion sharara set with a crop top, high-waist sharara and cape jacket. The perfect outfit for sangeet, mehendi and cocktail parties. Modern cuts with traditional embellishments.',
    rental_price_per_day: 2200,
    total_quantity: 4,
    is_featured: false,
    sort_order: 14,
    specifications: { Fabric: 'Crepe & Net', Work: 'Mirror & Thread', Color: 'Teal Green', Style: 'Crop Top + Sharara + Cape' },
    ref_image_idx: 1,
  },
  {
    category_slug: 'indo-western',
    name: 'Embroidered Cape Gown',
    slug: 'embroidered-cape-gown',
    description: 'A striking cape-style gown with heavy embroidery on the cape and a sleek inner column dress. This Indo-Western masterpiece is perfect for making a dramatic entrance at any celebration.',
    rental_price_per_day: 2800,
    total_quantity: 3,
    is_featured: false,
    sort_order: 15,
    specifications: { Fabric: 'Silk & Net', Work: 'Zari & Stone', Color: 'Dusty Rose', Style: 'Cape Gown' },
    ref_image_idx: 2,
  },

  // ---- Wedding Accessories (3 products) ----
  {
    category_slug: 'wedding-accessories',
    name: 'Bridal Dupatta Collection',
    slug: 'bridal-dupatta-collection',
    description: 'A premium bridal dupatta with heavy four-side border work and scattered motifs. Available in multiple colors to complement any bridal lehenga. Made from finest net fabric with gold zari work.',
    rental_price_per_day: 800,
    total_quantity: 8,
    is_featured: false,
    sort_order: 16,
    specifications: { Fabric: 'Net', Work: 'Zari Border', Size: '2.5m × 1m', Weight: '400g' },
    ref_image_idx: 3,
  },
  {
    category_slug: 'wedding-accessories',
    name: 'Designer Bridal Clutch',
    slug: 'designer-bridal-clutch',
    description: 'A luxurious embroidered clutch with zardozi work and pearl detailing. Features an elegant chain strap and spacious interior. The perfect accessory for brides and wedding guests.',
    rental_price_per_day: 500,
    total_quantity: 6,
    is_featured: false,
    sort_order: 17,
    specifications: { Material: 'Silk & Velvet', Work: 'Zardozi', Size: '25cm × 15cm', Strap: 'Detachable Chain' },
    ref_image_idx: 4,
  },
  {
    category_slug: 'wedding-accessories',
    name: 'Bridal Footwear Set',
    slug: 'bridal-footwear-set',
    description: 'Elegant bridal juttis handcrafted with intricate embroidery and pearl work. Comfortable padded sole for all-day wear. Available in multiple sizes to match your bridal outfit perfectly.',
    rental_price_per_day: 600,
    total_quantity: 10,
    is_featured: false,
    sort_order: 18,
    specifications: { Material: 'Leather & Silk', Work: 'Embroidery & Pearls', Sizes: '36-42', Style: 'Traditional Jutti' },
    ref_image_idx: 5,
  },
];

// ---------------------------------------------------------------------------
// MAIN SEED FUNCTION
// ---------------------------------------------------------------------------

async function seed() {
  console.log('\n🌱 Starting Nayantara Rentals Catalog Seeding...\n');

  // =========================================================================
  // Step 1: Upload reference images to Supabase Storage
  // =========================================================================
  console.log('📸 Uploading reference images to Supabase Storage...');
  const uploadedUrls = [];

  for (let i = 0; i < refImages.length; i++) {
    const imgName = refImages[i];
    const localPath = path.join(REF_DIR, imgName);
    const storagePath = `catalog-seed/ref-${String(i).padStart(2, '0')}.png`;

    try {
      const url = await uploadImage(localPath, storagePath);
      uploadedUrls.push(url);
      console.log(`  ✅ [${i + 1}/${refImages.length}] ${imgName} → uploaded`);
    } catch (err) {
      console.error(`  ❌ Failed to upload ${imgName}:`, err.message);
      // Use a placeholder URL as fallback
      uploadedUrls.push(`https://placehold.co/600x800/1A1A24/C8A96B?text=${encodeURIComponent(imgName)}`);
    }
  }

  // =========================================================================
  // Step 2: Upsert Categories
  // =========================================================================
  console.log('\n📂 Creating categories...');

  const categoryMap = {}; // slug → id

  for (const cat of CATEGORIES) {
    // Check if category exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', cat.slug)
      .maybeSingle();

    if (existing) {
      categoryMap[cat.slug] = existing.id;
      console.log(`  ⏭️  ${cat.name} (already exists)`);
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          is_active: true,
          sort_order: cat.sort_order,
        })
        .select('id')
        .single();

      if (error) {
        console.error(`  ❌ Failed to create ${cat.name}:`, error.message);
        continue;
      }
      categoryMap[cat.slug] = data.id;
      console.log(`  ✅ ${cat.name}`);
    }
  }

  // =========================================================================
  // Step 3: Insert Products
  // =========================================================================
  console.log('\n👗 Creating products...');

  for (const prod of PRODUCTS) {
    const categoryId = categoryMap[prod.category_slug];
    if (!categoryId) {
      console.error(`  ❌ Category not found for: ${prod.name} (${prod.category_slug})`);
      continue;
    }

    // Check if product exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', prod.slug)
      .maybeSingle();

    let productId;

    if (existing) {
      productId = existing.id;
      console.log(`  ⏭️  ${prod.name} (already exists)`);
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert({
          category_id: categoryId,
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          specifications: prod.specifications,
          rental_price_per_day: prod.rental_price_per_day,
          total_quantity: prod.total_quantity,
          status: 'active',
          is_featured: prod.is_featured,
          sort_order: prod.sort_order,
        })
        .select('id')
        .single();

      if (error) {
        console.error(`  ❌ Failed to create ${prod.name}:`, error.message);
        continue;
      }
      productId = data.id;
      console.log(`  ✅ ${prod.name} (₹${prod.rental_price_per_day}/day)`);
    }

    // =====================================================================
    // Step 4: Insert Product Media (link reference images)
    // =====================================================================

    // Check if product already has media
    const { data: existingMedia } = await supabase
      .from('product_media')
      .select('id')
      .eq('product_id', productId);

    if (existingMedia && existingMedia.length > 0) {
      console.log(`     📸 Media already exists (${existingMedia.length} images)`);
      continue;
    }

    // Use the reference image assigned to this product
    const imgIdx = prod.ref_image_idx % uploadedUrls.length;
    const imageUrl = uploadedUrls[imgIdx];

    const { error: mediaError } = await supabase
      .from('product_media')
      .insert({
        product_id: productId,
        media_url: imageUrl,
        media_type: 'image',
        sort_order: 0,
        alt_text: prod.name,
      });

    if (mediaError) {
      console.error(`     ❌ Failed to add media for ${prod.name}:`, mediaError.message);
    } else {
      console.log(`     📸 Image linked`);
    }
  }

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Catalog seeding complete!');
  console.log(`   📂 ${CATEGORIES.length} categories`);
  console.log(`   👗 ${PRODUCTS.length} products`);
  console.log(`   📸 ${uploadedUrls.length} images uploaded`);
  console.log(`   ⭐ ${PRODUCTS.filter(p => p.is_featured).length} featured products`);
  console.log('='.repeat(60));
  console.log('\n✅ All products are now visible on the website and editable in the admin panel.\n');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
