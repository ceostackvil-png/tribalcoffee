import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductShowcase from './components/ProductShowcase';
import AboutSection from './components/AboutSection';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import CartDrawer from './components/CartDrawer';
import ProductPage from './components/ProductPage';
import { TRIBAL_PRODUCTS, type RealProduct } from './services/db';
import type { CartItem } from './components/CartDrawer';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: TRIBAL_PRODUCTS[0], // Just Arabica Coffee Beans
      quantity: 1,
    },
    {
      product: TRIBAL_PRODUCTS[3], // South Indian Filter Coffee Powder
      quantity: 2,
    }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeDetailProduct, setActiveDetailProduct] = useState<RealProduct | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success'>('idle');

  // Handle scroll to top on reload
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddToBag = (product: RealProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Open drawer automatically for high-end e-commerce flow
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setCheckoutStatus('success');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative min-h-screen w-full bg-espresso text-cream-latte grain-overlay">
      {/* 3D Glow Cursor Follower */}
      <CustomCursor />

      {/* Branded Top Navbar */}
      <Navbar onCartToggle={() => setIsCartOpen(!isCartOpen)} cartCount={cartCount} />

      {/* Cinematic Hero & Dynamic Carousel */}
      <Hero onAddToBag={handleAddToBag} onViewDetails={setActiveDetailProduct} />

      {/* Curated Product Showcase */}
      <ProductShowcase onAddToBag={handleAddToBag} onViewDetails={setActiveDetailProduct} />

      {/* Heritage Narrative Segment */}
      <AboutSection />

      {/* Elite Advantages Grid */}
      <WhyChooseUs />

      {/* Connoisseur Testimonials */}
      <Testimonials />

      {/* Luxury Branded Footer */}
      <Footer />

      {/* Sliding Glassmorphism Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* IMMERSIVE APPLE-LEVEL PRODUCT PAGE ROUTE OVERLAY */}
      <AnimatePresence>
        {activeDetailProduct && (
          <ProductPage
            product={activeDetailProduct}
            onClose={() => setActiveDetailProduct(null)}
            onAddToBag={handleAddToBag}
          />
        )}
      </AnimatePresence>

      {/* BRANDED HIGH-END CHECKOUT SUCCESS DIALOG OVERLAY */}
      <AnimatePresence>
        {checkoutStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md"
            id="checkout-success-modal"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-lg glassmorphism rounded-[30px] p-8 md:p-10 border border-warm-gold/25 text-center relative overflow-hidden"
            >
              {/* Gold light burst */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full filter blur-[50px] bg-warm-gold/20 -z-10" />

              <button
                onClick={() => {
                  setCheckoutStatus('idle');
                  setCartItems([]);
                }}
                id="close-success-btn"
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-cream-latte/5 text-cream-latte/60 hover:text-warm-gold transition-colors cursor-pointer"
                aria-label="Close dialogue"
              >
                <X size={18} />
              </button>

              <div className="w-20 h-20 bg-warm-gold/10 border border-warm-gold/30 rounded-full flex items-center justify-center mx-auto mb-6 text-warm-gold animate-pulse-slow">
                <CheckCircle2 size={36} className="stroke-[1.5]" />
              </div>

              <span className="text-[10px] font-sans tracking-[0.3em] text-warm-gold font-bold uppercase mb-2 block">
                Araku Ritual Initiated
              </span>
              <h3 className="font-playfair font-bold text-2xl md:text-3xl text-cream-latte mb-4">
                Transmitted To Roasting Vaults
              </h3>

              <div className="w-12 h-[1px] bg-warm-gold/30 mx-auto mb-6" />

              <p className="text-sm text-cream-latte/75 font-sans leading-relaxed mb-6 max-w-sm mx-auto">
                Your selections have been securely transmitted to our flagship Araku roasting vaults in Visakhapatnam. Micro-batch wood-fire roasting has officially commenced.
              </p>

              <div className="bg-espresso/50 border border-warm-gold/10 p-4 rounded-2xl flex items-center justify-center gap-3 max-w-xs mx-auto mb-8">
                <ShieldCheck className="text-warm-gold shrink-0" size={18} />
                <span className="text-[10px] font-sans text-cream-latte/65 uppercase tracking-widest text-left leading-normal">
                  Guaranteed packaging dispatch within 48 hours. India-wide priority shipping.
                </span>
              </div>

              <button
                onClick={() => {
                  setCheckoutStatus('idle');
                  setCartItems([]);
                }}
                id="success-continue-btn"
                className="bg-warm-gold text-espresso font-sans text-xs font-bold tracking-[0.2em] uppercase px-10 py-4 rounded-xl border border-warm-gold hover:bg-transparent hover:text-warm-gold transition-all duration-300 cursor-pointer shadow-[0_4px_16px_rgba(200,169,126,0.2)] hover:shadow-none"
              >
                Return to Lounge
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
