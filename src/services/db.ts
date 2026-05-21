export interface RealProduct {
  id: string;
  name: string;
  category: 'beans' | 'powder' | 'specialty' | 'filter';
  tagline: string;
  roast: string;
  roastLevel: number; // out of 5
  strength: number; // out of 5
  acidity: number; // out of 5
  body: number; // out of 5
  chicory: string; // e.g. "0%" or "40%"
  tastingNotes: string[];
  price: number; // In ₹ (INR)
  originalPrice?: number; // In ₹ (INR)
  image: string;
  description: string;
  aromaDescription: string;
  bgGradient: string;
  glowColor: string;
}

export const TRIBAL_PRODUCTS: RealProduct[] = [
  {
    id: 'just-arabica-beans',
    name: 'Just Arabica Coffee Beans',
    category: 'beans',
    tagline: '100% ORGANIC ARAKU BEANS',
    roast: 'Medium-Dark Roast',
    roastLevel: 4,
    strength: 4,
    acidity: 2,
    body: 4,
    chicory: '0% Chicory',
    tastingNotes: ['Sweet Caramel', 'Roasted Almond', 'Mild Citrus', 'Smoky Oak'],
    price: 449,
    originalPrice: 499,
    image: 'https://tribalcoffee.in/wp-content/uploads/2016/06/Coffee-Beans-250-grams.png',
    description: 'Certified organic, hand-selected Arabica whole beans grown at high altitudes of 1,200 meters by indigenous farmers in the volcanic soil of the Araku Valley. Roasted to medium-dark complexity in micro-batches to unleash an exceptionally low-acidity cup with a velvet, chocolatey finish.',
    aromaDescription: 'Intense and welcoming with sweet hints of brown sugar and warm toasted nuts, settling into a deep, earthy cacao bloom.',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(43, 24, 16, 0.45) 0%, rgba(17, 17, 17, 1) 70%)',
    glowColor: 'rgba(74, 44, 29, 0.45)',
  },
  {
    id: 'just-arabica-fine-powder',
    name: 'Just Arabica Fine Ground Powder',
    category: 'powder',
    tagline: 'MICRO-BATCH ARABICA ESPRESSO GRIND',
    roast: 'Medium Roast',
    roastLevel: 3,
    strength: 3.5,
    acidity: 3,
    body: 3.5,
    chicory: '0% Chicory',
    tastingNotes: ['Cocoa Nibs', 'Warm Nutmeg', 'Floral Honey'],
    price: 449,
    image: 'https://tribalcoffee.in/wp-content/uploads/2016/09/Fine-Ground-white-scaled.jpg',
    description: 'Freshly packed-to-order organic Arabica fine grinds, tailored specifically for high-pressure brewing methods like Espresso machines, Aeropress, or traditional stovetop Moka Pots. Offers a bright, balanced crema with intricate spice profiles.',
    aromaDescription: 'Bright floral top notes interwoven with a sweet, warming fragrance of natural nutmeg and wild mountain honey.',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(74, 44, 29, 0.45) 0%, rgba(17, 17, 17, 1) 70%)',
    glowColor: 'rgba(154, 107, 66, 0.35)',
  },
  {
    id: 'just-arabica-coarse-powder',
    name: 'Just Arabica Coarse Ground Powder',
    category: 'powder',
    tagline: 'SLOW IMMERSION DEEP BREW',
    roast: 'Medium-Dark Roast',
    roastLevel: 4,
    strength: 4,
    acidity: 2,
    body: 4,
    chicory: '0% Chicory',
    tastingNotes: ['Dark Chocolate', 'Smoked Mahogany', 'Toasted Hazelnut'],
    price: 449,
    image: 'https://tribalcoffee.in/wp-content/uploads/2016/09/Course-ground.jpg',
    description: 'Organic Arabica beans ground to a coarse, uniform size to prevent over-extraction. Perfect for slow immersion coffee rituals including French Press, Cold Brew drippers, or siphon brewers. Brings out heavy-bodied cocoa depths.',
    aromaDescription: 'Robust, comforting woody aromas mixed with heavy dark cocoa solids and a whisper of slow smoky oak.',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(60, 36, 25, 0.45) 0%, rgba(17, 17, 17, 1) 70%)',
    glowColor: 'rgba(200, 169, 126, 0.35)',
  },
  {
    id: 'south-indian-filter-coffee',
    name: 'South Indian Filter Coffee Powder',
    category: 'filter',
    tagline: '60:40 ARABICA & CHICORY BLEND',
    roast: 'Dark Roast',
    roastLevel: 5,
    strength: 5,
    acidity: 1,
    body: 5,
    chicory: '40% Chicory',
    tastingNotes: ['Intense Cacao', 'Chicory Sweetness', 'Heavy Molasses'],
    price: 299,
    image: 'https://tribalcoffee.in/wp-content/uploads/2018/12/SFCCC.jpg',
    description: 'The definitive traditional South Indian filter coffee blend. Combining 60% high-altitude shade-grown Arabica and Robusta beans from Araku with 40% premium, slow-roasted French chicory. Delivers an incredibly thick, strong, and highly aromatic morning cup that pairs flawlessly with warm frothed milk.',
    aromaDescription: 'Pungent, highly concentrated and dark roasted with heavy caramel sugars, sweet malted chicory, and molasses.',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(74, 50, 35, 0.45) 0%, rgba(17, 17, 17, 1) 70%)',
    glowColor: 'rgba(212, 140, 69, 0.4)',
  },
  {
    id: 'just-arabica-cold-brew',
    name: 'Just Arabica Cold Brew Concentrate',
    category: 'specialty',
    tagline: '24-HOUR SLOW DRIPPED NECTAR',
    roast: 'Cold Steepted',
    roastLevel: 3,
    strength: 4,
    acidity: 1,
    body: 4,
    chicory: '0% Chicory',
    tastingNotes: ['Vanilla Pod', 'Floral Jasmine', 'Crisp Toffee'],
    price: 399,
    image: 'https://tribalcoffee.in/wp-content/uploads/2016/06/Coffee-Beans-in-CUP-Small.png',
    description: 'Our signature cold-brewed nectar, slow-extracted over 24 hours in cold spring water from pure organic Araku Arabica beans. Yields an incredibly smooth, naturally sweet concentrate containing twice the caffeine kick of hot brew, with practically zero bitterness or acidity.',
    aromaDescription: 'Soft and delicate with undercurrents of fragrant night jasmine, vanilla bean pods, and light buttery toffee.',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(83, 59, 40, 0.45) 0%, rgba(17, 17, 17, 1) 70%)',
    glowColor: 'rgba(154, 107, 66, 0.45)',
  }
];

export function getProductById(id: string): RealProduct | undefined {
  return TRIBAL_PRODUCTS.find(p => p.id === id);
}

export function getProductsByCategory(category: 'beans' | 'powder' | 'specialty' | 'filter'): RealProduct[] {
  if (category === 'filter') {
    return TRIBAL_PRODUCTS.filter(p => p.category === 'filter');
  }
  return TRIBAL_PRODUCTS.filter(p => p.category === category);
}
