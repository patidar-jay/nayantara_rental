import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import ws from 'ws';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws }
});

const DIR = 'C:\\\\Users\\\\patid\\\\.gemini\\\\antigravity\\\\brain\\\\e848f962-38b4-4eaf-9145-6f4f2cff3749';

const mapping = [
  { slug: "red-embroidered-bridal-lehenga", file: "prod_1_red_lehenga_1780904144983.png" },
  { slug: "maroon-gold-bridal-ensemble", file: "prod_2_maroon_lehenga_1780904157332.png" },
  { slug: "pastel-pink-lehenga-set", file: "prod_3_pink_lehenga_1780904170477.png" },
  { slug: "banarasi-silk-saree", file: "prod_4_banarasi_saree_1780904183119.png" },
  { slug: "emerald-green-organza-saree", file: "prod_5_green_saree_1780904196844.png" },
  { slug: "navy-blue-sequin-saree", file: "prod_6_blue_saree_1780904209565.png" },
  { slug: "royal-kundan-bridal-set", file: "prod_7_royal_kundan_1780904221736.png" },
  { slug: "temple-gold-necklace-set", file: "prod_8_temple_gold_1780904244484.png" },
  { slug: "pearl-diamond-choker-set", file: "prod_9_pearl_choker_1780904256836.png" },
  { slug: "champagne-gold-gown", file: "reception_gowns_cat_1780902802952.png" },
  { slug: "wine-red-evening-gown", file: "reception_gowns_cat_1780902802952.png" },
  { slug: "midnight-blue-mermaid-gown", file: "reception_gowns_cat_1780902802952.png" },
  { slug: "designer-anarkali-suit", file: "indo_western_cat_1780902816425.png" },
  { slug: "fusion-sharara-set", file: "indo_western_cat_1780902816425.png" },
  { slug: "embroidered-cape-gown", file: "indo_western_cat_1780902816425.png" },
  { slug: "bridal-dupatta-collection", file: "wedding_accessories_cat_1780902829417.png" },
  { slug: "designer-bridal-clutch", file: "wedding_accessories_cat_1780902829417.png" },
  { slug: "bridal-footwear-set", file: "wedding_accessories_cat_1780902829417.png" },
  { slug: "sony-alpha-a7-iv", file: "wedding_accessories_cat_1780902829417.png" },
  { slug: "banarasi-saaree", file: "designer_sarees_cat_1780902776832.png" },
  { slug: "sony-fe-24-70-gm2", file: "wedding_accessories_cat_1780902829417.png" }
];

async function run() {
  console.log('Fetching products...');
  const { data: products, error } = await supabase.from('products').select('id, name, slug');
  if (error || !products) {
    console.error('Failed to fetch products', error);
    return;
  }

  for (const item of mapping) {
    const product = products.find(p => p.slug === item.slug);
    if (!product) {
      console.log(`Product not found for slug: ${item.slug}`);
      continue;
    }

    const filePath = path.join(DIR, item.file);
    if (!fs.existsSync(filePath)) {
      console.log(`File missing: ${filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const bucketFileName = `${product.id}/${Date.now()}.png`;

    console.log(`Uploading for ${product.name}...`);
    const { error: uploadError } = await supabase.storage
      .from('product-media')
      .upload(bucketFileName, fileBuffer, { contentType: 'image/png', upsert: false });

    if (uploadError) {
      console.error(`Upload failed for ${product.slug}:`, uploadError);
      continue;
    }

    const { data: publicData } = supabase.storage.from('product-media').getPublicUrl(bucketFileName);
    const publicUrl = publicData.publicUrl;

    const { error: insertError } = await supabase.from('product_media').insert({
      product_id: product.id,
      media_url: publicUrl,
      media_type: 'image',
      sort_order: 0,
      alt_text: product.name
    });

    if (insertError) {
      console.error(`DB insert failed for ${product.slug}:`, insertError);
    } else {
      console.log(`✅ Uploaded & inserted for ${product.name}`);
    }
  }
  console.log('Done uploading product images!');
}

run();
