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
}
