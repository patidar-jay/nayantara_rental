import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import ws from 'ws';

// Read .env manually
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws },
});

const images = [
  { slug: 'bridal-lehengas', file: 'C:\\Users\\patid\\.gemini\\antigravity\\brain\\e848f962-38b4-4eaf-9145-6f4f2cff3749\\bridal_lehengas_cat_1780902762097.png' },
  { slug: 'designer-sarees', file: 'C:\\Users\\patid\\.gemini\\antigravity\\brain\\e848f962-38b4-4eaf-9145-6f4f2cff3749\\designer_sarees_cat_1780902776832.png' },
  { slug: 'wedding-jewellery', file: 'C:\\Users\\patid\\.gemini\\antigravity\\brain\\e848f962-38b4-4eaf-9145-6f4f2cff3749\\wedding_jewellery_cat_1780902790500.png' },
  { slug: 'reception-gowns', file: 'C:\\Users\\patid\\.gemini\\antigravity\\brain\\e848f962-38b4-4eaf-9145-6f4f2cff3749\\reception_gowns_cat_1780902802952.png' },
  { slug: 'indo-western', file: 'C:\\Users\\patid\\.gemini\\antigravity\\brain\\e848f962-38b4-4eaf-9145-6f4f2cff3749\\indo_western_cat_1780902816425.png' },
  { slug: 'wedding-accessories', file: 'C:\\Users\\patid\\.gemini\\antigravity\\brain\\e848f962-38b4-4eaf-9145-6f4f2cff3749\\wedding_accessories_cat_1780902829417.png' }
];

async function run() {
  console.log('Uploading 6 category images...');
  let sql = 'BEGIN;\n\n';

  for (const item of images) {
    if (!fs.existsSync(item.file)) {
      console.error(`File not found: ${item.file}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(item.file);
    const fileName = `categories/${item.slug}-${Date.now()}.png`;

    const { data, error } = await supabase.storage
      .from('product-media')
      .upload(fileName, fileBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (error) {
      console.error(`Failed to upload ${item.slug}:`, error.message);
      continue;
    }

    const { data: publicData } = supabase.storage
      .from('product-media')
      .getPublicUrl(fileName);

    const publicUrl = publicData.publicUrl;
    
    const { error: dbError } = await supabase
      .from('categories')
      .update({ image_url: publicUrl })
      .eq('slug', item.slug);

    if (dbError) {
      console.error(`❌ Failed to update DB for ${item.slug}:`, dbError.message);
    } else {
      console.log(`✅ Uploaded & Updated ${item.slug} -> ${publicUrl}`);
    }
  }

  console.log('\nAll done!');
}

run();
