import { createApi } from 'unsplash-js';

// Types
export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
}

export interface SearchImagesParams {
  query: string;
  count?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
}

export interface ImageResult {
  url: string;
  id: string;
  alt: string;
  photographer: string;
  photographerUsername: string;
}

// Initialize Unsplash API
const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
});

// Curated stock image library with high-quality Unsplash images
export const STOCK_IMAGE_LIBRARY = {
  restaurant: [
    {
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      alt: 'Modern restaurant interior with tables',
      photographer: 'Jay Wennington',
    },
    {
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      alt: 'Fine dining food presentation',
      photographer: 'Jay Wennington',
    },
    {
      url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
      alt: 'Elegant restaurant dining area',
      photographer: 'Hermes Rivera',
    },
    {
      url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
      alt: 'Cozy restaurant atmosphere',
      photographer: 'Dario Veronesi',
    },
    {
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      alt: 'Restaurant table setting',
      photographer: 'Jay Wennington',
    },
  ],
  retail: [
    {
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      alt: 'Modern retail clothing store',
      photographer: 'Artificial Photography',
    },
    {
      url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800',
      alt: 'Retail shopping environment',
      photographer: 'Clark Street Mercantile',
    },
    {
      url: 'https://images.unsplash.com/photo-1556742400-b5b7f5d86f45?w=800',
      alt: 'Product display in store',
      photographer: 'Marjan Grabowski',
    },
    {
      url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800',
      alt: 'Shopping boutique interior',
      photographer: 'Jorge Zapata',
    },
    {
      url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800',
      alt: 'Retail merchandise display',
      photographer: 'Artificial Photography',
    },
  ],
  realestate: [
    {
      url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      alt: 'Modern luxury home exterior',
      photographer: 'R ARCHITECTURE',
    },
    {
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      alt: 'Contemporary house architecture',
      photographer: 'R ARCHITECTURE',
    },
    {
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      alt: 'Residential property exterior',
      photographer: 'R ARCHITECTURE',
    },
    {
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      alt: 'Beautiful home interior',
      photographer: 'R ARCHITECTURE',
    },
    {
      url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      alt: 'Elegant property architecture',
      photographer: 'R ARCHITECTURE',
    },
  ],
  events: [
    {
      url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      alt: 'Event party celebration',
      photographer: 'Pablo Heimplatz',
    },
    {
      url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
      alt: 'Conference and gathering',
      photographer: 'Product School',
    },
    {
      url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      alt: 'Business conference event',
      photographer: 'Headway',
    },
    {
      url: 'https://images.unsplash.com/photo-1478940020726-e9e191651f1a?w=800',
      alt: 'Party celebration atmosphere',
      photographer: 'Yulian Alexeyev',
    },
    {
      url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
      alt: 'Event venue setup',
      photographer: 'rawpixel',
    },
  ],
  business: [
    {
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      alt: 'Modern office workspace',
      photographer: 'Nastuh Abootalebi',
    },
    {
      url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
      alt: 'Corporate office environment',
      photographer: 'Nastuh Abootalebi',
    },
    {
      url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      alt: 'Business meeting workspace',
      photographer: 'Scott Graham',
    },
    {
      url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      alt: 'Professional team meeting',
      photographer: 'Sebastian Herrmann',
    },
    {
      url: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800',
      alt: 'Corporate office space',
      photographer: 'Samantha Borges',
    },
  ],
  fitness: [
    {
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      alt: 'Modern gym interior',
      photographer: 'Danielle Cerullo',
    },
    {
      url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
      alt: 'Fitness exercise workout',
      photographer: 'Danielle Cerullo',
    },
    {
      url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
      alt: 'Gym equipment and wellness',
      photographer: 'Humphrey Muleba',
    },
    {
      url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800',
      alt: 'Wellness and exercise',
      photographer: 'Victor Freitas',
    },
    {
      url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
      alt: 'Fitness center interior',
      photographer: 'Victor Freitas',
    },
  ],
  healthcare: [
    {
      url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
      alt: 'Modern medical clinic',
      photographer: 'Martha Dominguez de Gouveia',
    },
    {
      url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800',
      alt: 'Healthcare facility interior',
      photographer: 'Zhen Hu',
    },
    {
      url: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800',
      alt: 'Medical health center',
      photographer: 'SJ Objio',
    },
    {
      url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800',
      alt: 'Healthcare professional workspace',
      photographer: 'Luis Melendez',
    },
    {
      url: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800',
      alt: 'Medical clinic environment',
      photographer: 'Jair Lázaro',
    },
  ],
  technology: [
    {
      url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
      alt: 'Modern tech workspace',
      photographer: 'Marvin Meyer',
    },
    {
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      alt: 'Computer software development',
      photographer: 'Christopher Gower',
    },
    {
      url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      alt: 'Tech office environment',
      photographer: 'Clément H',
    },
    {
      url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
      alt: 'Technology and computers',
      photographer: 'Ales Nesetril',
    },
    {
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
      alt: 'Software development workspace',
      photographer: 'Greg Rakozy',
    },
  ],
};

/**
 * Search for images using Unsplash API
 */
export async function searchImages(
  params: SearchImagesParams
): Promise<ImageResult[]> {
  const { query, count = 10, orientation } = params;

  // Check if API key is configured
  if (!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
    console.warn('Unsplash API key not configured, returning fallback images');
    return getFallbackImages(query, count);
  }

  try {
    const response = await unsplash.search.getPhotos({
      query,
      page: 1,
      perPage: count,
      orientation,
    });

    if (response.errors) {
      console.error('Unsplash API errors:', response.errors);
      return getFallbackImages(query, count);
    }

    if (!response.response || !response.response.results) {
      return getFallbackImages(query, count);
    }

    const results = response.response.results as UnsplashImage[];

    return results.map((photo) => ({
      url: photo.urls.regular,
      id: photo.id,
      alt: photo.alt_description || photo.description || query,
      photographer: photo.user.name,
      photographerUsername: photo.user.username,
    }));
  } catch (error) {
    console.error('Error searching Unsplash images:', error);
    return getFallbackImages(query, count);
  }
}

/**
 * Get a random image from Unsplash
 */
export async function getRandomImage(query?: string): Promise<ImageResult | null> {
  // Check if API key is configured
  if (!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
    console.warn('Unsplash API key not configured, returning fallback image');
    return getFallbackImages(query || 'business', 1)[0] || null;
  }

  try {
    const response = await unsplash.photos.getRandom({
      query: query || undefined,
      count: 1,
    });

    if (response.errors) {
      console.error('Unsplash API errors:', response.errors);
      return getFallbackImages(query || 'business', 1)[0] || null;
    }

    if (!response.response) {
      return getFallbackImages(query || 'business', 1)[0] || null;
    }

    const photo = Array.isArray(response.response)
      ? response.response[0]
      : response.response;

    if (!photo) {
      return getFallbackImages(query || 'business', 1)[0] || null;
    }

    return {
      url: photo.urls.regular,
      id: photo.id,
      alt: photo.alt_description || photo.description || query || 'Random image',
      photographer: photo.user.name,
      photographerUsername: photo.user.username,
    };
  } catch (error) {
    console.error('Error getting random Unsplash image:', error);
    return getFallbackImages(query || 'business', 1)[0] || null;
  }
}

/**
 * Get fallback images from stock library based on query
 */
function getFallbackImages(query: string, count: number): ImageResult[] {
  const normalizedQuery = query.toLowerCase();
  
  // Map query to stock library category
  let category: keyof typeof STOCK_IMAGE_LIBRARY = 'business';
  
  if (normalizedQuery.includes('restaurant') || normalizedQuery.includes('food') || normalizedQuery.includes('dining')) {
    category = 'restaurant';
  } else if (normalizedQuery.includes('retail') || normalizedQuery.includes('shop') || normalizedQuery.includes('store')) {
    category = 'retail';
  } else if (normalizedQuery.includes('real') || normalizedQuery.includes('estate') || normalizedQuery.includes('property') || normalizedQuery.includes('home')) {
    category = 'realestate';
  } else if (normalizedQuery.includes('event') || normalizedQuery.includes('party') || normalizedQuery.includes('conference')) {
    category = 'events';
  } else if (normalizedQuery.includes('business') || normalizedQuery.includes('office') || normalizedQuery.includes('corporate')) {
    category = 'business';
  } else if (normalizedQuery.includes('fitness') || normalizedQuery.includes('gym') || normalizedQuery.includes('exercise')) {
    category = 'fitness';
  } else if (normalizedQuery.includes('health') || normalizedQuery.includes('medical') || normalizedQuery.includes('clinic')) {
    category = 'healthcare';
  } else if (normalizedQuery.includes('tech') || normalizedQuery.includes('computer') || normalizedQuery.includes('software')) {
    category = 'technology';
  }

  const stockImages = STOCK_IMAGE_LIBRARY[category];
  
  // Return requested number of images, cycling through if necessary
  const results: ImageResult[] = [];
  for (let i = 0; i < count; i++) {
    const image = stockImages[i % stockImages.length];
    results.push({
      url: image.url,
      id: `stock-${category}-${i}`,
      alt: image.alt,
      photographer: image.photographer,
      photographerUsername: image.photographer.toLowerCase().replace(/\s+/g, ''),
    });
  }

  return results;
}

/**
 * Get images from stock library by category
 */
export function getStockImagesByCategory(
  category: keyof typeof STOCK_IMAGE_LIBRARY
): ImageResult[] {
  const stockImages = STOCK_IMAGE_LIBRARY[category];
  
  return stockImages.map((image, index) => ({
    url: image.url,
    id: `stock-${category}-${index}`,
    alt: image.alt,
    photographer: image.photographer,
    photographerUsername: image.photographer.toLowerCase().replace(/\s+/g, ''),
  }));
}

/**
 * Get all available stock image categories
 */
export function getStockImageCategories(): string[] {
  return Object.keys(STOCK_IMAGE_LIBRARY);
}
