import { createClient } from '@supabase/supabase-js'
import { mockProperties } from '../data/mockProperties'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  const formattedProperties = mockProperties.map(p => ({
    id: p.id,
    title: p.title,
    location: p.location,
    price: p.price,
    beds: p.beds,
    baths: p.baths,
    area: p.area,
    images: p.images,
    is_featured: p.isFeatured,
    tag: p.tag || null,
    type: p.type
  }));

  const { data, error } = await supabase.from('properties').upsert(formattedProperties)
  if (error) {
    console.error('Error inserting properties:', error)
  } else {
    console.log('Successfully seeded properties')
  }
}

seed()
