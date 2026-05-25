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

export const API_BASE_URL = 'http://localhost:5001';

export const TRIBAL_PRODUCTS: RealProduct[] = [];

const notifyListeners = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tribal-db-changed'));
  }
};

// Asynchronously load and cache products in the exported array reference
export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    if (res.ok) {
      const data = await res.json();
      TRIBAL_PRODUCTS.length = 0;
      TRIBAL_PRODUCTS.push(...data);
      notifyListeners();
      return TRIBAL_PRODUCTS;
    }
  } catch (e) {
    console.error('Failed to fetch products from Express backend API:', e);
  }
  return TRIBAL_PRODUCTS;
}

// Immediately trigger data sync on load
fetchProducts();

export async function addProduct(product: RealProduct) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        TRIBAL_PRODUCTS.length = 0;
        TRIBAL_PRODUCTS.push(...result.products);
        notifyListeners();
      }
    }
  } catch (e) {
    console.error('Failed to add product on backend:', e);
  }
}

export async function updateProduct(updated: RealProduct) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        TRIBAL_PRODUCTS.length = 0;
        TRIBAL_PRODUCTS.push(...result.products);
        notifyListeners();
      }
    }
  } catch (e) {
    console.error('Failed to update product on backend:', e);
  }
}

export async function deleteProduct(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        TRIBAL_PRODUCTS.length = 0;
        TRIBAL_PRODUCTS.push(...result.products);
        notifyListeners();
      }
    }
  } catch (e) {
    console.error('Failed to delete product on backend:', e);
  }
}

export function getProductById(id: string): RealProduct | undefined {
  return TRIBAL_PRODUCTS.find(p => p.id === id);
}

export function getProductsByCategory(category: 'beans' | 'powder' | 'specialty' | 'filter'): RealProduct[] {
  return TRIBAL_PRODUCTS.filter(p => p.category === category);
}

export async function resetDB() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/reset`, {
      method: 'POST'
    });
    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        TRIBAL_PRODUCTS.length = 0;
        TRIBAL_PRODUCTS.push(...result.products);
        notifyListeners();
      }
    }
  } catch (e) {
    console.error('Failed to reset product database:', e);
  }
}

