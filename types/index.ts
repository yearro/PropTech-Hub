export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  imageUrl: string;
  isFeatured: boolean;
  tag?: string; 
  type: 'FOR SALE' | 'FOR RENT';
  slug?: string;
  images?: string[];
}
