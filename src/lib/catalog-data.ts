export interface CategoryNavData {
  id: string
  name: string
  slug: string
  subgroups: {
    title: string
    slug: string
    items: { name: string; slug: string }[]
  }[]
  featuredCards: {
    title: string
    imageUrl: string
    link: string
  }[]
}

export interface CatalogProduct {
  id: string
  title: string
  slug: string
  category: string
  subcategory: string
  brand: string
  fabric?: string
  price: number
  comparePrice?: number
  isQuote?: boolean
  vendor: string
  rating: number
  wishlistCount: number
  featured?: boolean
  imageUrl: string
}

export const CATALOG_CATEGORIES: CategoryNavData[] = [
  {
    id: 'clothing',
    name: 'Clothing',
    slug: 'clothing',
    subgroups: [
      {
        title: "Women's Clothing",
        slug: 'womens-clothing',
        items: [
          { name: 'Dresses', slug: 'dresses' },
          { name: 'Skirts', slug: 'skirts' },
          { name: 'Pants & Capris', slug: 'pants-capris' },
          { name: 'Sweaters', slug: 'sweaters' },
        ],
      },
      {
        title: "Men's Clothing",
        slug: 'mens-clothing',
        items: [
          { name: 'Jackets & Coats', slug: 'jackets-coats' },
          { name: 'Sweaters', slug: 'mens-sweaters' },
          { name: 'Pants & Jeans', slug: 'pants-jeans' },
          { name: 'Shirts', slug: 'shirts' },
        ],
      },
      {
        title: "Kid's Clothing",
        slug: 'kids-clothing',
        items: [
          { name: 'Clothing Sets', slug: 'clothing-sets' },
          { name: 'T-Shirts & Tops', slug: 'kids-tops' },
          { name: 'Baby Outfits', slug: 'baby-outfits' },
        ],
      },
    ],
    featuredCards: [
      {
        title: "Women's Clothing..",
        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=clothing&subcategory=womens-clothing',
      },
      {
        title: 'Sweaters',
        imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=clothing&subcategory=sweaters',
      },
      {
        title: "Men's Clothing",
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=clothing&subcategory=mens-clothing',
      },
    ],
  },
  {
    id: 'shoes',
    name: 'Shoes',
    slug: 'shoes',
    subgroups: [
      {
        title: "Men's Shoes",
        slug: 'mens-shoes',
        items: [
          { name: 'Boots', slug: 'boots' },
          { name: 'Sneakers', slug: 'sneakers' },
          { name: 'Formal Loafers', slug: 'loafers' },
          { name: 'Sandals', slug: 'mens-sandals' },
        ],
      },
      {
        title: "Women's Shoes",
        slug: 'womens-shoes',
        items: [
          { name: 'High Heels', slug: 'heels' },
          { name: 'Flats & Ballerinas', slug: 'flats' },
          { name: 'Sneakers', slug: 'womens-sneakers' },
          { name: 'Ankle Boots', slug: 'ankle-boots' },
        ],
      },
      {
        title: 'Kids Shoes',
        slug: 'kids-shoes',
        items: [
          { name: 'School Shoes', slug: 'school-shoes' },
          { name: 'Casual Sneakers', slug: 'kids-sneakers' },
        ],
      },
    ],
    featuredCards: [
      {
        title: 'Boots Collection',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=shoes&subcategory=boots',
      },
      {
        title: 'Running Sneakers',
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=shoes&subcategory=sneakers',
      },
      {
        title: 'Leather Shoes',
        imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=shoes&subcategory=loafers',
      },
    ],
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    slug: 'home-living',
    subgroups: [
      {
        title: 'Furniture',
        slug: 'furniture',
        items: [
          { name: 'Living Room Sofas', slug: 'sofas' },
          { name: 'Dining Tables', slug: 'dining-tables' },
          { name: 'Ergonomic Chairs', slug: 'chairs' },
          { name: 'Bookshelves', slug: 'bookshelves' },
        ],
      },
      {
        title: 'Home Decor',
        slug: 'home-decor',
        items: [
          { name: 'Decorative Pillows', slug: 'decorative-pillows' },
          { name: 'Wall Art & Prints', slug: 'wall-art' },
          { name: 'Vases & Planters', slug: 'vases' },
          { name: 'Aroma Diffusers', slug: 'diffusers' },
        ],
      },
      {
        title: 'Kitchen & Dining',
        slug: 'kitchen-dining',
        items: [
          { name: 'Cookware Sets', slug: 'cookware' },
          { name: 'Ceramic Plates', slug: 'plates' },
          { name: 'Coffee Makers', slug: 'coffee-makers' },
        ],
      },
    ],
    featuredCards: [
      {
        title: 'Nordic Sofa',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=home-living&subcategory=furniture',
      },
      {
        title: 'Bohemian Pillows',
        imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=home-living&subcategory=home-decor',
      },
      {
        title: 'Kitchen Accents',
        imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=home-living&subcategory=kitchen-dining',
      },
    ],
  },
  {
    id: 'jewelry-accessories',
    name: 'Jewelry & Accessories',
    slug: 'jewelry-accessories',
    subgroups: [
      {
        title: 'Fine Jewelry',
        slug: 'fine-jewelry',
        items: [
          { name: 'Necklaces & Pendants', slug: 'necklaces' },
          { name: 'Earrings', slug: 'earrings' },
          { name: 'Rings & Bands', slug: 'rings' },
          { name: 'Bracelets', slug: 'bracelets' },
        ],
      },
      {
        title: 'Bags & Purses',
        slug: 'bags-purses',
        items: [
          { name: 'Leather Handbags', slug: 'handbags' },
          { name: 'Crossbody Bags', slug: 'crossbody' },
          { name: 'Backpacks', slug: 'backpacks' },
          { name: 'Wallets', slug: 'wallets' },
        ],
      },
      {
        title: 'Wearable Accents',
        slug: 'wearable-accents',
        items: [
          { name: 'Watches', slug: 'watches' },
          { name: 'Sunglasses', slug: 'sunglasses' },
          { name: 'Hats & Caps', slug: 'hats' },
        ],
      },
    ],
    featuredCards: [
      {
        title: 'Gold Pendants',
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=jewelry-accessories&subcategory=fine-jewelry',
      },
      {
        title: 'Luxury Handbags',
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=jewelry-accessories&subcategory=bags-purses',
      },
      {
        title: 'Vintage Chrono',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=jewelry-accessories&subcategory=wearable-accents',
      },
    ],
  },
  {
    id: 'toys-entertainment',
    name: 'Toys & Entertainment',
    slug: 'toys-entertainment',
    subgroups: [
      {
        title: 'Action & Figures',
        slug: 'action-figures',
        items: [
          { name: 'Collectible Figures', slug: 'figures' },
          { name: 'Die-cast Vehicles', slug: 'vehicles' },
          { name: 'Building Blocks', slug: 'lego' },
        ],
      },
      {
        title: 'Board Games & Puzzles',
        slug: 'games-puzzles',
        items: [
          { name: 'Strategy Games', slug: 'board-games' },
          { name: 'Jigsaw Puzzles', slug: 'puzzles' },
          { name: 'Card Games', slug: 'card-games' },
        ],
      },
      {
        title: 'Outdoor & Sports Toys',
        slug: 'outdoor-toys',
        items: [
          { name: 'Ride-on Toys', slug: 'ride-on' },
          { name: 'Drones & RC Cars', slug: 'rc-toys' },
        ],
      },
    ],
    featuredCards: [
      {
        title: 'Plush & Stuffed',
        imageUrl: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=toys-entertainment&subcategory=action-figures',
      },
      {
        title: 'Wooden Blocks',
        imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=toys-entertainment&subcategory=games-puzzles',
      },
      {
        title: 'Smart Gadget Toys',
        imageUrl: 'https://images.unsplash.com/photo-1508898578281-774ac4893c0c?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=toys-entertainment&subcategory=outdoor-toys',
      },
    ],
  },
  {
    id: 'graphics',
    name: 'Graphics & Photos',
    slug: 'graphics',
    subgroups: [
      {
        title: 'Vectors & Illustrations',
        slug: 'vectors-illustrations',
        items: [
          { name: 'Icon Packs', slug: 'icons' },
          { name: 'Logo Templates', slug: 'logos' },
          { name: 'Character Illustrations', slug: 'illustrations' },
          { name: 'Infographics', slug: 'infographics' },
        ],
      },
      {
        title: 'Stock Photos',
        slug: 'stock-photos',
        items: [
          { name: 'Commercial Photography', slug: 'commercial-photos' },
          { name: 'Food & Beverage', slug: 'food-photos' },
          { name: 'Nature & Landscapes', slug: 'nature-photos' },
        ],
      },
      {
        title: 'Print Mockups',
        slug: 'print-mockups',
        items: [
          { name: 'T-shirt Mockups', slug: 'apparel-mockups' },
          { name: 'Stationery & Branding', slug: 'branding-mockups' },
        ],
      },
    ],
    featuredCards: [
      {
        title: 'Vector Art Packs',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=graphics&subcategory=vectors-illustrations',
      },
      {
        title: 'Modern UI Mockups',
        imageUrl: 'https://images.unsplash.com/photo-1581291518655-952384377e77?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=graphics&subcategory=print-mockups',
      },
      {
        title: 'Fine Canvas Prints',
        imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=graphics&subcategory=stock-photos',
      },
    ],
  },
  {
    id: 'video-audio',
    name: 'Video & Audio',
    slug: 'video-audio',
    subgroups: [
      {
        title: 'Stock Footage',
        slug: 'stock-footage',
        items: [
          { name: '4K Drone Aerials', slug: 'drone-aerials' },
          { name: 'Timelapse & Hyperlapse', slug: 'timelapse' },
          { name: 'Green Screen Assets', slug: 'greenscreen' },
        ],
      },
      {
        title: 'Motion Graphics',
        slug: 'motion-graphics',
        items: [
          { name: 'After Effects Templates', slug: 'ae-templates' },
          { name: 'Premiere Pro Presets', slug: 'pr-presets' },
          { name: 'Stream Overlays', slug: 'stream-overlays' },
        ],
      },
      {
        title: 'Audio & Music',
        slug: 'audio-music',
        items: [
          { name: 'Royalty Free Music', slug: 'royalty-free-music' },
          { name: 'Sound FX Packs', slug: 'sfx' },
          { name: 'Podcast Intros', slug: 'podcast-audio' },
        ],
      },
    ],
    featuredCards: [
      {
        title: 'Cinematic 4K Clips',
        imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=video-audio&subcategory=stock-footage',
      },
      {
        title: 'Sound Design Kit',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=video-audio&subcategory=audio-music',
      },
      {
        title: 'Broadcast Titles',
        imageUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=video-audio&subcategory=motion-graphics',
      },
    ],
  },
  {
    id: 'template-source-code',
    name: 'Web Templates & Code',
    slug: 'template-source-code',
    subgroups: [
      {
        title: 'CMS & Frameworks',
        slug: 'cms-frameworks',
        items: [
          { name: 'Next.js & React Apps', slug: 'nextjs-templates' },
          { name: 'WordPress Themes', slug: 'wordpress-themes' },
          { name: 'Shopify Storefronts', slug: 'shopify-themes' },
        ],
      },
      {
        title: 'Mobile Apps',
        slug: 'mobile-apps',
        items: [
          { name: 'Flutter Full Apps', slug: 'flutter-apps' },
          { name: 'React Native Starters', slug: 'react-native' },
          { name: 'iOS Swift Boilerplates', slug: 'swift-apps' },
        ],
      },
      {
        title: 'Backend & APIs',
        slug: 'backend-apis',
        items: [
          { name: 'Node.js Express Starters', slug: 'nodejs' },
          { name: 'Python FastAPI Microservices', slug: 'python-api' },
          { name: 'Database Schemas', slug: 'db-schemas' },
        ],
      },
    ],
    featuredCards: [
      {
        title: 'Next.js SaaS Kit',
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=template-source-code&subcategory=cms-frameworks',
      },
      {
        title: 'Flutter eCommerce',
        imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=template-source-code&subcategory=mobile-apps',
      },
      {
        title: 'API Microservices',
        imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=500&q=80',
        link: '/products?category=template-source-code&subcategory=backend-apis',
      },
    ],
  },
]

export const CATALOG_BRANDS = [
  'Adidas',
  'Armani',
  'Burberry',
  'Diesel',
  'Gucci',
  'H & M',
  'Hugo Boss',
  'Lacoste',
  'Lee Cooper',
  "Levi's",
  'Nike',
  'Puma',
  'Uniqlo',
  'Zara',
  'Apple',
  'Samsung',
  'Sony',
  'Krafita Studio',
]

export const CATALOG_FABRICS = [
  'Bamboo',
  'Cotton',
  'Leather',
  'Nylon',
  'Silk',
  'Denim',
  'Polyester',
  'Linen',
  'Wool',
  'Canvas',
]

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'prod-c1',
    title: 'Black midi skirt with white flowers',
    slug: 'black-midi-skirt-with-white-flowers',
    category: 'clothing',
    subcategory: 'womens-clothing',
    brand: 'Zara',
    fabric: 'Cotton',
    price: 480000,
    comparePrice: 550000,
    vendor: 'Trendshop',
    rating: 4,
    wishlistCount: 0,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-c2',
    title: 'Floral women sundress',
    slug: 'floral-women-sundress',
    category: 'clothing',
    subcategory: 'womens-clothing',
    brand: 'H & M',
    fabric: 'Silk',
    price: 800000,
    comparePrice: 890000,
    vendor: 'Admin',
    rating: 4.5,
    wishlistCount: 0,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-c3',
    title: 'Women casual dress',
    slug: 'women-casual-dress',
    category: 'clothing',
    subcategory: 'womens-clothing',
    brand: 'Gucci',
    fabric: 'Cotton',
    price: 560000,
    vendor: 'Admin',
    rating: 4,
    wishlistCount: 0,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-c4',
    title: 'Light blue women shirt',
    slug: 'light-blue-women-shirt',
    category: 'clothing',
    subcategory: 'womens-clothing',
    brand: 'Uniqlo',
    fabric: 'Cotton',
    price: 490000,
    comparePrice: 690000,
    vendor: 'Trendshop',
    rating: 5,
    wishlistCount: 0,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-c5',
    title: 'Summer fashion top lace',
    slug: 'summer-fashion-top-lace',
    category: 'clothing',
    subcategory: 'womens-clothing',
    brand: 'Armani',
    fabric: 'Silk',
    price: 650000,
    comparePrice: 790000,
    vendor: 'Trendshop',
    rating: 5,
    wishlistCount: 1,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-c6',
    title: 'Cobalt man t-shirt all colors',
    slug: 'cobalt-man-t-shirt-all-colors',
    category: 'clothing',
    subcategory: 'mens-clothing',
    brand: "Levi's",
    fabric: 'Cotton',
    price: 0,
    isQuote: true,
    vendor: 'Admin',
    rating: 4,
    wishlistCount: 1,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-c7',
    title: 'Navy polka dot dress',
    slug: 'navy-polka-dot-dress',
    category: 'clothing',
    subcategory: 'womens-clothing',
    brand: 'Burberry',
    fabric: 'Silk',
    price: 1300000,
    comparePrice: 1500000,
    vendor: 'Trendshop',
    rating: 4,
    wishlistCount: 0,
    featured: false,
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-c8',
    title: 'Men outerwear navy color',
    slug: 'men-outerwear-navy-color',
    category: 'clothing',
    subcategory: 'mens-clothing',
    brand: 'Diesel',
    fabric: 'Nylon',
    price: 890000,
    comparePrice: 990000,
    vendor: 'Trendshop',
    rating: 4.5,
    wishlistCount: 0,
    featured: false,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-s1',
    title: 'Classic Leather Chelsea Boots',
    slug: 'classic-leather-chelsea-boots',
    category: 'shoes',
    subcategory: 'mens-shoes',
    brand: 'Hugo Boss',
    fabric: 'Leather',
    price: 1850000,
    comparePrice: 2100000,
    vendor: 'Trendshop',
    rating: 4.8,
    wishlistCount: 3,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-s2',
    title: 'Air Flow Performance Sneakers',
    slug: 'air-flow-performance-sneakers',
    category: 'shoes',
    subcategory: 'mens-shoes',
    brand: 'Nike',
    fabric: 'Nylon',
    price: 1250000,
    comparePrice: 1450000,
    vendor: 'Admin',
    rating: 4.9,
    wishlistCount: 5,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-h1',
    title: 'Nordic Minimalist Fabric Armchair',
    slug: 'nordic-minimalist-fabric-armchair',
    category: 'home-living',
    subcategory: 'furniture',
    brand: 'Krafita Studio',
    fabric: 'Linen',
    price: 2450000,
    comparePrice: 2800000,
    vendor: 'Trendshop',
    rating: 4.7,
    wishlistCount: 2,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-h2',
    title: 'Bohemian Decorative Cushion Set',
    slug: 'bohemian-decorative-cushion-set',
    category: 'home-living',
    subcategory: 'home-decor',
    brand: 'H & M',
    fabric: 'Cotton',
    price: 320000,
    comparePrice: 380000,
    vendor: 'Admin',
    rating: 4.6,
    wishlistCount: 4,
    featured: false,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-j1',
    title: 'Handcrafted Golden Pendant Necklace',
    slug: 'handcrafted-golden-pendant-necklace',
    category: 'jewelry-accessories',
    subcategory: 'fine-jewelry',
    brand: 'Gucci',
    fabric: 'Bamboo',
    price: 1650000,
    comparePrice: 1950000,
    vendor: 'Trendshop',
    rating: 5,
    wishlistCount: 6,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-j2',
    title: 'Classic Italian Leather Handbag',
    slug: 'classic-italian-leather-handbag',
    category: 'jewelry-accessories',
    subcategory: 'bags-purses',
    brand: 'Armani',
    fabric: 'Leather',
    price: 2100000,
    comparePrice: 2500000,
    vendor: 'Admin',
    rating: 4.8,
    wishlistCount: 2,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-t1',
    title: 'Wooden Educational Architecture Blocks',
    slug: 'wooden-educational-architecture-blocks',
    category: 'toys-entertainment',
    subcategory: 'games-puzzles',
    brand: 'Krafita Studio',
    fabric: 'Bamboo',
    price: 450000,
    comparePrice: 520000,
    vendor: 'Trendshop',
    rating: 4.9,
    wishlistCount: 1,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-g1',
    title: 'Creative Abstract Vector Illustrations Pack',
    slug: 'creative-abstract-vector-illustrations-pack',
    category: 'graphics',
    subcategory: 'vectors-illustrations',
    brand: 'Krafita Studio',
    price: 299000,
    comparePrice: 399000,
    vendor: 'Admin',
    rating: 5,
    wishlistCount: 8,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-v1',
    title: 'Cinematic 4K Drone Nature Footage Pack',
    slug: 'cinematic-4k-drone-nature-footage-pack',
    category: 'video-audio',
    subcategory: 'stock-footage',
    brand: 'Sony',
    price: 750000,
    comparePrice: 950000,
    vendor: 'Trendshop',
    rating: 4.7,
    wishlistCount: 3,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod-w1',
    title: 'Modern Next.js 16 Multi-Vendor SaaS Template',
    slug: 'modern-nextjs-16-multivendor-saas-template',
    category: 'template-source-code',
    subcategory: 'cms-frameworks',
    brand: 'Krafita Studio',
    price: 1190000,
    comparePrice: 1490000,
    vendor: 'Admin',
    rating: 5,
    wishlistCount: 12,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
  },
]
