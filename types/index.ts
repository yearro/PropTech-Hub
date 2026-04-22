export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string | null;
  last_login: string | null;
  phone: string | null;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  isFeatured: boolean;
  tag?: string; 
  type: 'House' | 'Apartment' | 'Villa' | 'Penthouse' | 'Townhouse' | 'Condo' | string;
  slug?: string;
  images: string[];
  agent_id?: string;
  agent?: Profile;
}
