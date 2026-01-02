export interface LandingPageTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  isPremium: boolean;
  previewImage: string;
  html: string;
  metadata: {
    imageSlots: Array<{
      id: string;
      label: string;
      defaultQuery: string;
      aspectRatio: string;
    }>;
    colorScheme: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
  };
}

export const LANDING_PAGE_TEMPLATES: LandingPageTemplate[] = [
  {
    id: 'restaurant-hero-modern',
    name: 'Modern Restaurant Hero',
    category: 'Restaurant',
    description: 'Full-screen hero with stunning food photography',
    isPremium: false,
    previewImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    metadata: {
      imageSlots: [
        { id: 'hero', label: 'Hero Image', defaultQuery: 'restaurant interior', aspectRatio: '16/9' },
        { id: 'dish1', label: 'Featured Dish 1', defaultQuery: 'gourmet food', aspectRatio: '1/1' },
      ],
      colorScheme: {
        primary: '#1F2937',
        secondary: '#F59E0B',
        accent: '#EF4444',
        background: '#FFFFFF',
        text: '#111827',
      },
    },
    html: `<div class="min-h-screen bg-white">
  <section class="relative h-screen">
    <img data-slot="hero" src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920" alt="Restaurant" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70 flex items-center justify-center">
      <div class="text-center text-white px-4">
        <h1 class="text-6xl md:text-8xl font-bold mb-4">Fine Dining</h1>
        <p class="text-xl md:text-2xl mb-8">Experience culinary excellence</p>
        <button class="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition transform hover:scale-105">View Menu</button>
      </div>
    </div>
  </section>
  <section class="py-20 px-4 max-w-6xl mx-auto">
    <h2 class="text-4xl font-bold text-center mb-12">Featured Dishes</h2>
    <div class="grid md:grid-cols-2 gap-8">
      <div class="group cursor-pointer">
        <div class="overflow-hidden rounded-2xl mb-4">
          <img data-slot="dish1" src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" alt="Dish" class="w-full h-80 object-cover transform group-hover:scale-110 transition duration-500" />
        </div>
        <h3 class="text-2xl font-semibold mb-2">Seasonal Special</h3>
        <p class="text-gray-600">Chef's handcrafted masterpiece</p>
      </div>
    </div>
  </section>
</div>`,
  },
  {
    id: 'retail-product-showcase',
    name: 'Product Showcase',
    category: 'Retail',
    description: 'Modern e-commerce product display',
    isPremium: false,
    previewImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    metadata: {
      imageSlots: [
        { id: 'hero', label: 'Hero Product', defaultQuery: 'product photography', aspectRatio: '1/1' },
      ],
      colorScheme: { primary: '#2563EB', secondary: '#7C3AED', accent: '#EC4899', background: '#FFFFFF', text: '#1F2937' },
    },
    html: `<div class="min-h-screen bg-white"><section class="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto py-20 px-4"><div class="flex items-center justify-center"><img data-slot="hero" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" alt="Product" class="rounded-2xl shadow-2xl w-full max-w-lg" /></div><div class="flex flex-col justify-center"><h1 class="text-5xl font-bold mb-4">Premium Collection</h1><p class="text-xl text-gray-600 mb-6">Discover our latest arrivals</p><div class="text-4xl font-bold text-blue-600 mb-8">$299</div><button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition transform hover:scale-105">Add to Cart</button></div></section></div>`,
  },
  {
    id: 'realestate-property',
    name: 'Property Listing',
    category: 'Real Estate',
    description: 'Professional property showcase',
    isPremium: false,
    previewImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
    metadata: {
      imageSlots: [
        { id: 'hero', label: 'Property Image', defaultQuery: 'modern house', aspectRatio: '16/9' },
      ],
      colorScheme: { primary: '#1E40AF', secondary: '#059669', accent: '#DC2626', background: '#FFFFFF', text: '#1E293B' },
    },
    html: `<div class="min-h-screen bg-gray-50"><section class="relative h-96"><img data-slot="hero" src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920" alt="Property" class="w-full h-full object-cover" /><div class="absolute inset-0 bg-black/40 flex items-center justify-center"><h1 class="text-5xl font-bold text-white">Luxury Living</h1></div></section><section class="max-w-6xl mx-auto py-16 px-4"><div class="bg-white rounded-lg shadow-xl p-8"><h2 class="text-3xl font-bold mb-4">Modern Family Home</h2><p class="text-xl text-blue-600 font-bold mb-4">$850,000</p><p class="text-gray-600 mb-6">4 beds • 3 baths • 2,500 sq ft</p><button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition">Schedule Showing</button></div></section></div>`,
  },
  {
    id: 'events-registration',
    name: 'Event Registration',
    category: 'Events',
    description: 'Colorful event sign-up page',
    isPremium: false,
    previewImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
    metadata: {
      imageSlots: [
        { id: 'hero', label: 'Event Image', defaultQuery: 'conference event', aspectRatio: '16/9' },
      ],
      colorScheme: { primary: '#7C3AED', secondary: '#EC4899', accent: '#F59E0B', background: '#FFFFFF', text: '#1F2937' },
    },
    html: `<div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50"><section class="relative h-screen"><img data-slot="hero" src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920" alt="Event" class="w-full h-full object-cover opacity-80" /><div class="absolute inset-0 bg-gradient-to-b from-purple-600/40 to-pink-600/40 flex items-center justify-center"><div class="text-center text-white px-4"><h1 class="text-6xl font-bold mb-4">Tech Summit 2025</h1><p class="text-2xl mb-8">Join industry leaders</p><button class="bg-white hover:bg-gray-100 text-purple-600 px-8 py-4 rounded-full text-lg font-semibold transition transform hover:scale-105">Register Now</button></div></div></section></div>`,
  },
  {
    id: 'business-services',
    name: 'Business Services',
    category: 'Business',
    description: 'Professional services page',
    isPremium: false,
    previewImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    metadata: {
      imageSlots: [
        { id: 'hero', label: 'Office Image', defaultQuery: 'modern office', aspectRatio: '16/9' },
      ],
      colorScheme: { primary: '#1F2937', secondary: '#2563EB', accent: '#059669', background: '#F9FAFB', text: '#111827' },
    },
    html: `<div class="min-h-screen bg-white"><section class="relative h-96 bg-gray-900"><img data-slot="hero" src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920" alt="Office" class="w-full h-full object-cover opacity-40" /><div class="absolute inset-0 flex items-center justify-center"><div class="text-center text-white px-4"><h1 class="text-5xl font-bold mb-4">Professional Services</h1><p class="text-xl">Excellence in every project</p></div></div></section><section class="py-20 px-4 max-w-6xl mx-auto"><h2 class="text-4xl font-bold text-center mb-12">Our Services</h2><div class="grid md:grid-cols-3 gap-8"><div class="bg-white p-8 rounded-lg shadow-lg"><h3 class="text-2xl font-bold mb-4">Consulting</h3><p class="text-gray-600">Strategic guidance for growth</p></div><div class="bg-white p-8 rounded-lg shadow-lg"><h3 class="text-2xl font-bold mb-4">Development</h3><p class="text-gray-600">Custom solutions built</p></div><div class="bg-white p-8 rounded-lg shadow-lg"><h3 class="text-2xl font-bold mb-4">Support</h3><p class="text-gray-600">Dedicated assistance</p></div></div></section></div>`,
  },
  {
    id: 'fitness-classes',
    name: 'Fitness Classes',
    category: 'Fitness',
    description: 'Energetic gym class schedule',
    isPremium: false,
    previewImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    metadata: {
      imageSlots: [
        { id: 'hero', label: 'Gym Image', defaultQuery: 'fitness gym', aspectRatio: '16/9' },
      ],
      colorScheme: { primary: '#EA580C', secondary: '#059669', accent: '#F59E0B', background: '#FFFFFF', text: '#1F2937' },
    },
    html: `<div class="min-h-screen bg-orange-50"><section class="relative h-screen"><img data-slot="hero" src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920" alt="Fitness" class="w-full h-full object-cover" /><div class="absolute inset-0 bg-gradient-to-b from-orange-600/60 to-orange-800/60 flex items-center justify-center"><div class="text-center text-white px-4"><h1 class="text-6xl font-bold mb-4">Get Fit Today</h1><p class="text-2xl mb-8">Transform your body and mind</p><button class="bg-white hover:bg-gray-100 text-orange-600 px-8 py-4 rounded-full text-lg font-semibold transition transform hover:scale-105">View Classes</button></div></div></section><section class="py-20 px-4 max-w-6xl mx-auto"><h2 class="text-4xl font-bold text-center mb-12">Class Schedule</h2><div class="bg-white rounded-lg shadow-xl p-8 space-y-4"><div class="flex justify-between items-center border-b pb-4"><div><h3 class="text-xl font-bold">Yoga Flow</h3><p class="text-gray-600">Monday & Wednesday • 6:00 AM</p></div><button class="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition">Book</button></div><div class="flex justify-between items-center border-b pb-4"><div><h3 class="text-xl font-bold">HIIT Training</h3><p class="text-gray-600">Tuesday & Thursday • 7:00 PM</p></div><button class="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition">Book</button></div></div></section></div>`,
  },
  {
    id: 'healthcare-clinic',
    name: 'Healthcare Clinic',
    category: 'Healthcare',
    description: 'Professional medical services',
    isPremium: false,
    previewImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
    metadata: {
      imageSlots: [
        { id: 'hero', label: 'Clinic Image', defaultQuery: 'medical clinic', aspectRatio: '16/9' },
      ],
      colorScheme: { primary: '#1E40AF', secondary: '#059669', accent: '#3B82F6', background: '#F0F9FF', text: '#1E293B' },
    },
    html: `<div class="min-h-screen bg-blue-50"><section class="relative h-96"><img data-slot="hero" src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920" alt="Clinic" class="w-full h-full object-cover" /><div class="absolute inset-0 bg-blue-900/50 flex items-center justify-center"><h1 class="text-5xl font-bold text-white">Compassionate Care</h1></div></section><section class="py-20 px-4 max-w-6xl mx-auto"><div class="bg-white rounded-lg shadow-xl p-8"><h2 class="text-3xl font-bold mb-6 text-center">Book an Appointment</h2><p class="text-gray-600 text-center mb-8">Quality healthcare for you and your family</p><div class="flex justify-center"><button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition">Schedule Visit</button></div></div></section></div>`,
  },
  {
    id: 'technology-saas',
    name: 'SaaS Landing Page',
    category: 'Technology',
    description: 'Modern software product page',
    isPremium: false,
    previewImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    metadata: {
      imageSlots: [
        { id: 'hero', label: 'Tech Image', defaultQuery: 'technology code', aspectRatio: '16/9' },
      ],
      colorScheme: { primary: '#7C3AED', secondary: '#2563EB', accent: '#06B6D4', background: '#FFFFFF', text: '#1F2937' },
    },
    html: `<div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50"><section class="relative h-screen"><img data-slot="hero" src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920" alt="Technology" class="w-full h-full object-cover opacity-20" /><div class="absolute inset-0 flex items-center justify-center"><div class="text-center px-4"><h1 class="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Power Your Business</h1><p class="text-2xl text-gray-700 mb-8">Next-generation software solutions</p><button class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition transform hover:scale-105">Start Free Trial</button></div></div></section></div>`,
  },
  {
    id: 'restaurant-menu-simple',
    name: 'Simple Menu',
    category: 'Restaurant',
    description: 'Clean minimalist menu layout',
    isPremium: false,
    previewImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    metadata: {
      imageSlots: [
        { id: 'header', label: 'Header Image', defaultQuery: 'restaurant food', aspectRatio: '21/9' },
      ],
      colorScheme: { primary: '#0F172A', secondary: '#D4AF37', accent: '#8B4513', background: '#F8F9FA', text: '#1E293B' },
    },
    html: `<div class="min-h-screen bg-gray-50"><header class="relative h-64"><img data-slot="header" src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920" alt="Food" class="w-full h-full object-cover" /><div class="absolute inset-0 bg-black/30 flex items-center justify-center"><h1 class="text-4xl font-serif text-white">Our Menu</h1></div></header><div class="max-w-4xl mx-auto py-16 px-4"><div class="bg-white rounded-lg shadow-lg p-8"><h2 class="text-3xl font-serif text-center mb-8 border-b-2 border-yellow-600 pb-4">Signature Dishes</h2><div class="space-y-6"><div class="flex justify-between"><div><h3 class="text-xl font-semibold">Grilled Salmon</h3><p class="text-gray-600">Fresh Atlantic salmon with herbs</p></div><span class="text-xl font-bold text-yellow-700">$28</span></div><div class="flex justify-between"><div><h3 class="text-xl font-semibold">Ribeye Steak</h3><p class="text-gray-600">12oz premium cut</p></div><span class="text-xl font-bold text-yellow-700">$42</span></div></div></div></div></div>`,
  },
  {
    id: 'events-conference',
    name: 'Conference Page',
    category: 'Events',
    description: 'Professional conference landing',
    isPremium: false,
    previewImage: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400',
    metadata: {
      imageSlots: [
        { id: 'hero', label: 'Conference Image', defaultQuery: 'business conference', aspectRatio: '16/9' },
      ],
      colorScheme: { primary: '#1F2937', secondary: '#3B82F6', accent: '#10B981', background: '#FFFFFF', text: '#111827' },
    },
    html: `<div class="min-h-screen bg-white"><section class="relative h-screen"><img data-slot="hero" src="https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1920" alt="Conference" class="w-full h-full object-cover" /><div class="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/60 flex items-center justify-center"><div class="text-white px-4 max-w-3xl"><h1 class="text-6xl font-bold mb-4">Innovation Summit 2025</h1><p class="text-2xl mb-2">March 15-17, 2025</p><p class="text-xl mb-8">San Francisco, CA</p><button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition">Get Tickets</button></div></div></section></div>`,
  },
];
