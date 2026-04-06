import { Property } from "../types";

export const mockProperties: Property[] = [
  // Featured Properties
  {
    id: "f1",
    title: "The Glass Pavilion",
    location: "Beverly Hills, California",
    price: 5250000,
    beds: 5,
    baths: 4.5,
    area: 4200,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: true,
    tag: "Exclusive",
    type: "FOR SALE",
  },
  {
    id: "f2",
    title: "Azure Heights Penthouse",
    location: "Downtown, Vancouver",
    price: 3800000,
    beds: 3,
    baths: 3,
    area: 2100,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: true,
    tag: "New Arrival",
    type: "FOR SALE",
  },
  
  // Standard Properties
  {
    id: "p1",
    title: "Modern Family Home",
    location: "123 Pine St, Seattle",
    price: 850000,
    beds: 3,
    baths: 2,
    area: 120, // assuming sqm or standardizing
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR SALE",
  },
  {
    id: "p2",
    title: "Urban Loft",
    location: "456 Elm Ave, Portland",
    price: 3200,
    beds: 1,
    baths: 1,
    area: 85,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR RENT",
  },
  {
    id: "p3",
    title: "Highland Retreat",
    location: "789 Mountain Rd, Bend",
    price: 620000,
    beds: 2,
    baths: 2,
    area: 98,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR SALE",
  },
  {
    id: "p4",
    title: "Sea View Penthouse",
    location: "321 Ocean Dr, Miami",
    price: 4500,
    beds: 3,
    baths: 3,
    area: 180,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR RENT",
  },
  {
    id: "p5",
    title: "Central Studio",
    location: "555 Main St, Chicago",
    price: 550000,
    beds: 1,
    baths: 1,
    area: 50,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR SALE",
  },
  {
    id: "p6",
    title: "Garden Villa",
    location: "999 Oak Ln, Austin",
    price: 2800,
    beds: 2,
    baths: 2,
    area: 110,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR RENT",
  },
  {
    id: "p7",
    title: "Sunset Terrace",
    location: "77 Hillcrest Blvd, San Diego",
    price: 1250000,
    beds: 4,
    baths: 3,
    area: 220,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR SALE",
  },
  {
    id: "p8",
    title: "Midtown Loft Suite",
    location: "88 W 42nd St, New York",
    price: 6500,
    beds: 2,
    baths: 2,
    area: 130,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR RENT",
  },
  {
    id: "p9",
    title: "Lakefront Lodge",
    location: "12 Lakeview Dr, Lake Tahoe",
    price: 2100000,
    beds: 5,
    baths: 4,
    area: 310,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR SALE",
  },
  {
    id: "p10",
    title: "The Nordic Flat",
    location: "34 Maple Ave, Minneapolis",
    price: 3800,
    beds: 2,
    baths: 1,
    area: 90,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR RENT",
  },
  {
    id: "p11",
    title: "Desert Oasis Villa",
    location: "500 Cactus Rd, Scottsdale",
    price: 1875000,
    beds: 4,
    baths: 3.5,
    area: 280,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR SALE",
  },
  {
    id: "p12",
    title: "Rivercrest Apartment",
    location: "210 River St, Nashville",
    price: 2400,
    beds: 1,
    baths: 1,
    area: 72,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR RENT",
  },
  {
    id: "p13",
    title: "Pacific Rim Townhouse",
    location: "650 Harbor View, San Francisco",
    price: 1650000,
    beds: 3,
    baths: 2.5,
    area: 175,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR SALE",
  },
  {
    id: "p14",
    title: "The Montclair Estate",
    location: "18 Elmwood Pl, Denver",
    price: 975000,
    beds: 4,
    baths: 3,
    area: 230,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR SALE",
  },
  {
    id: "p15",
    title: "Sky Garden Penthouse",
    location: "1 Skyline Tower, Boston",
    price: 9200,
    beds: 3,
    baths: 3,
    area: 200,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR RENT",
  },
  {
    id: "p16",
    title: "Vineyard Manor",
    location: "2040 Wine Country Rd, Napa",
    price: 4200000,
    beds: 6,
    baths: 5,
    area: 520,
    images: [
      "",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd802404?w=800&auto=format&fit=crop"
    ],
    isFeatured: false,
    type: "FOR SALE",
  },
];
