export interface FontConfig {
  id: string;
  name: string;
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'modern';
  preview: string;
}

export const availableFonts: FontConfig[] = [
  // Modern Sans-Serif
  { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", category: 'sans-serif', preview: 'Modern & Clean' },
  { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'sans-serif', preview: 'Bold & Elegant' },
  { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", category: 'sans-serif', preview: 'Minimal & Sharp' },
  { id: 'raleway', name: 'Raleway', family: "'Raleway', sans-serif", category: 'sans-serif', preview: 'Thin & Refined' },
  { id: 'quicksand', name: 'Quicksand', family: "'Quicksand', sans-serif", category: 'sans-serif', preview: 'Rounded & Friendly' },
  { id: 'nunito', name: 'Nunito', family: "'Nunito', sans-serif", category: 'sans-serif', preview: 'Soft & Warm' },
  { id: 'josefin', name: 'Josefin Sans', family: "'Josefin Sans', sans-serif", category: 'sans-serif', preview: 'Geometric & Chic' },
  { id: 'outfit', name: 'Outfit', family: "'Outfit', sans-serif", category: 'sans-serif', preview: 'Fresh & Dynamic' },
  { id: 'space-grotesk', name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", category: 'modern', preview: 'Futuristic & Tech' },
  { id: 'syne', name: 'Syne', family: "'Syne', sans-serif", category: 'modern', preview: 'Artistic & Bold' },
  { id: 'clash-display', name: 'Clash Display', family: "'Clash Display', sans-serif", category: 'modern', preview: 'Contemporary & Sharp' },
  { id: 'cabinet-grotesk', name: 'Cabinet Grotesk', family: "'Cabinet Grotesk', sans-serif", category: 'modern', preview: 'Premium & Sleek' },

  // Elegant Serif
  { id: 'playfair', name: 'Playfair Display', family: "'Playfair Display', serif", category: 'serif', preview: 'Classic & Luxurious' },
  { id: 'cormorant', name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", category: 'serif', preview: 'Refined & Timeless' },
  { id: 'lora', name: 'Lora', family: "'Lora', serif", category: 'serif', preview: 'Contemporary & Readable' },
  { id: 'libre-baskerville', name: 'Libre Baskerville', family: "'Libre Baskerville', serif", category: 'serif', preview: 'Traditional & Warm' },
  { id: 'dm-serif', name: 'DM Serif Display', family: "'DM Serif Display', serif", category: 'serif', preview: 'High Contrast & Modern' },
  { id: 'fraunces', name: 'Fraunces', family: "'Fraunces', serif", category: 'serif', preview: 'Expressive & Soft' },

  // Display / Decorative
  { id: 'bebas-neue', name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", category: 'display', preview: 'Tall & Impactful' },
  { id: 'oswald', name: 'Oswald', family: "'Oswald', sans-serif", category: 'display', preview: 'Strong & Condensed' },
  { id: 'anton', name: 'Anton', family: "'Anton', sans-serif", category: 'display', preview: 'Bold & Dramatic' },

  // Handwriting / Script
  { id: 'great-vibes', name: 'Great Vibes', family: "'Great Vibes', cursive", category: 'handwriting', preview: 'Elegant Script' },
  { id: 'dancing-script', name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'handwriting', preview: 'Playful & Lively' },
  { id: 'pacifico', name: 'Pacifico', family: "'Pacifico', cursive", category: 'handwriting', preview: 'Surf & Casual' },
  { id: 'sacramento', name: 'Sacramento', family: "'Sacramento', cursive", category: 'handwriting', preview: 'Delicate & Feminine' },
  { id: 'alex-brush', name: 'Alex Brush', family: "'Alex Brush', cursive", category: 'handwriting', preview: 'Flowing & Romantic' },
  { id: 'allura', name: 'Allura', family: "'Allura', cursive", category: 'handwriting', preview: 'Graceful & Smooth' },
  { id: 'parisienne', name: 'Parisienne', family: "'Parisienne', cursive", category: 'handwriting', preview: 'French & Sophisticated' },
];

export const headingFonts: FontConfig[] = [
  { id: 'playfair', name: 'Playfair Display', family: "'Playfair Display', serif", category: 'serif', preview: 'Classic' },
  { id: 'cormorant', name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", category: 'serif', preview: 'Elegant' },
  { id: 'dm-serif', name: 'DM Serif Display', family: "'DM Serif Display', serif", category: 'serif', preview: 'Modern Serif' },
  { id: 'fraunces', name: 'Fraunces', family: "'Fraunces', serif", category: 'serif', preview: 'Expressive' },
  { id: 'bebas-neue', name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", category: 'display', preview: 'Impact' },
  { id: 'oswald', name: 'Oswald', family: "'Oswald', sans-serif", category: 'display', preview: 'Strong' },
  { id: 'space-grotesk', name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", category: 'modern', preview: 'Futuristic' },
  { id: 'syne', name: 'Syne', family: "'Syne', sans-serif", category: 'modern', preview: 'Artistic' },
  { id: 'outfit', name: 'Outfit', family: "'Outfit', sans-serif", category: 'modern', preview: 'Dynamic' },
  { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", category: 'sans-serif', preview: 'Clean' },
  { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'sans-serif', preview: 'Bold' },
];

export const scriptFonts: FontConfig[] = [
  { id: 'great-vibes', name: 'Great Vibes', family: "'Great Vibes', cursive", category: 'handwriting', preview: 'Elegant' },
  { id: 'dancing-script', name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'handwriting', preview: 'Playful' },
  { id: 'sacramento', name: 'Sacramento', family: "'Sacramento', cursive", category: 'handwriting', preview: 'Delicate' },
  { id: 'alex-brush', name: 'Alex Brush', family: "'Alex Brush', cursive", category: 'handwriting', preview: 'Flowing' },
  { id: 'allura', name: 'Allura', family: "'Allura', cursive", category: 'handwriting', preview: 'Graceful' },
  { id: 'parisienne', name: 'Parisienne', family: "'Parisienne', cursive", category: 'handwriting', preview: 'French' },
  { id: 'pacifico', name: 'Pacifico', family: "'Pacifico', cursive", category: 'handwriting', preview: 'Casual' },
];
