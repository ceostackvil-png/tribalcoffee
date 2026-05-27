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
import { CheckCircle2, ShieldCheck, X, TrendingUp, Send, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeDetailProduct, setActiveDetailProduct] = useState<RealProduct | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success'>('idle');
  const [dbVersion, setDbVersion] = useState(0);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [showCustomerTracker, setShowCustomerTracker] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null); // e.g., { name: '...', email: '...' }

  // Simple client-side router
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    const handleHashChange = () => {
      if (window.location.hash === '#/admin') {
        setCurrentPath('/admin');
      } else if (window.location.hash === '#/') {
        setCurrentPath('/');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleHashChange);

    // Initial load hash check
    if (window.location.hash === '#/admin') {
      setCurrentPath('/admin');
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Handle scroll to top on reload
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Safely seed default items once products are fetched from the backend API
  useEffect(() => {
    // Starting with clean empty cart state for production readiness
    setCartItems([]);
  }, [dbVersion]);

  // Listen to product database changes to trigger seamless react re-renders
  useEffect(() => {
    const handleDbChange = () => {
      setDbVersion(prev => prev + 1);
    };
    window.addEventListener('tribal-db-changed', handleDbChange);
    return () => window.removeEventListener('tribal-db-changed', handleDbChange);
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

  const getUserInitials = () => {
    if (!loggedInUser || !loggedInUser.name) return undefined;
    return loggedInUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // If path is /admin, render the admin dashboard as a full, dedicated page
  if (currentPath === '/admin') {
    return (
      <div className="relative min-h-screen w-full bg-espresso text-cream-latte grain-overlay">
        <CustomCursor isAdminActive={true} />
        <AdminDashboard
          onClose={() => {
            window.history.pushState({}, '', '/');
            setCurrentPath('/');
          }}
          loggedInUser={loggedInUser}
          setLoggedInUser={setLoggedInUser}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-espresso text-cream-latte grain-overlay">
      {/* 3D Glow Cursor Follower */}
      <CustomCursor isAdminActive={false} />

      {/* Branded Top Navbar */}
      <Navbar
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        cartCount={cartCount}
        userInitials={getUserInitials()}
        onAdminToggle={() => {
          if (loggedInUser) {
            if (confirm("Would you like to sign out of your connoisseur lounge account?")) {
              setLoggedInUser(null);
            }
          } else {
            setIsAuthModalOpen(true);
          }
        }}
      />

      {/* Cinematic Hero & Dynamic Carousel */}
      <Hero
        key={`hero-${dbVersion}`}
        onAddToBag={handleAddToBag}
        onViewDetails={setActiveDetailProduct}
      />

      {/* Curated Product Showcase */}
      <ProductShowcase
        key={`showcase-${dbVersion}`}
        onAddToBag={handleAddToBag}
        onViewDetails={setActiveDetailProduct}
      />

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
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-cream-latte/5 text-cream-latte/50 hover:text-warm-gold transition-colors cursor-pointer"
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
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-sm mx-auto">
                <button
                  onClick={() => setShowCustomerTracker(true)}
                  className="w-full sm:w-1/2 bg-emerald-600 text-white border border-emerald-500 hover:bg-emerald-500 font-sans text-xs font-bold tracking-[0.15em] uppercase py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(16,185,129,0.2)] hover:shadow-none font-bold"
                >
                  <TrendingUp size={14} />
                  Track Live
                </button>
                <button
                  onClick={() => {
                    setCheckoutStatus('idle');
                    setCartItems([]);
                  }}
                  id="success-continue-btn"
                  className="w-full sm:w-1/2 bg-warm-gold text-espresso border border-warm-gold hover:bg-transparent hover:text-warm-gold font-sans text-xs font-bold tracking-[0.15em] uppercase py-4 rounded-xl transition-all duration-300 cursor-pointer shadow-[0_4px_16px_rgba(200,169,126,0.2)] hover:shadow-none font-bold"
                >
                  Exit Lounge
                </button>
              </div>            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. CUSTOMER LIVE DELIVERY PARCEL TRACKING OVERLAY */}
      <AnimatePresence>
        {showCustomerTracker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-xl text-cream-latte font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 40 }}
              transition={{ type: 'spring', damping: 22 }}
              className="w-full max-w-4xl glassmorphism rounded-[40px] border border-warm-gold/25 overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col md:flex-row relative"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowCustomerTracker(false);
                  setCheckoutStatus('idle');
                  setCartItems([]);
                }}
                className="absolute top-6 right-6 z-30 p-2.5 rounded-full bg-black/60 hover:bg-cream-latte/15 border border-cream-latte/10 hover:border-warm-gold/30 text-cream-latte/70 hover:text-warm-gold transition-all cursor-pointer"
                title="Close Tracker"
              >
                <X size={16} />
              </button>

              {/* LEFT SIDE: LIVE SIMULATED GPS INTERACTIVE ROUTE MAP */}
              <div className="w-full md:w-[55%] h-64 md:h-[520px] bg-[#120D0A] relative overflow-hidden border-b md:border-b-0 md:border-r border-warm-gold/15 flex flex-col justify-between">
                
                {/* Tech grid texture overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(214,178,122,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(214,178,122,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                <div className="absolute inset-0 bg-radial-gradient(circle_at_center,rgba(0,0,0,0)_20%,rgba(18,13,10,0.85)_100%) pointer-events-none" />

                {/* Map Header */}
                <div className="p-6 relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[9px] font-sans tracking-[0.25em] text-emerald-400 font-bold uppercase">
                      Live Telemetry Sourced
                    </span>
                  </div>
                  <span className="bg-[#1C1612] border border-warm-gold/20 text-warm-gold font-sans text-[8px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    DELHIVERY EXPRESS
                  </span>
                </div>

                {/* Simulated GPS SVG Map Routing */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <svg className="w-full h-full max-h-[300px]" viewBox="0 0 400 240" fill="none">
                    <path d="M -50,60 Q 100,20 200,90 T 450,40" stroke="rgba(214,178,122,0.03)" strokeWidth="1" />
                    <path d="M -50,140 Q 120,80 240,160 T 450,110" stroke="rgba(214,178,122,0.03)" strokeWidth="1" />

                    <path
                      id="liveRoute"
                      d="M 60,160 C 140,130 200,70 320,80"
                      stroke="rgba(214,178,122,0.15)"
                      strokeWidth="2.5"
                      strokeDasharray="4,4"
                    />

                    <path
                      d="M 60,160 C 140,130 200,70 320,80"
                      stroke="url(#customerMapGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray="250"
                      strokeDashoffset="120"
                      className="animate-dash"
                      style={{
                        strokeDasharray: '300',
                        animation: 'dash 6s linear infinite'
                      }}
                    />

                    <defs>
                      <linearGradient id="customerMapGrad" x1="0" y1="1" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4A2B1D" />
                        <stop offset="60%" stopColor="#D6B27A" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>

                    <g transform="translate(60, 160)">
                      <circle r="14" fill="rgba(74,43,29,0.25)" className="animate-pulse" />
                      <circle r="7" fill="#4A2B1D" stroke="#D6B27A" strokeWidth="1.5" />
                      <text y="-18" className="text-[8px] font-sans font-black tracking-widest text-cream-latte/50 uppercase text-center" textAnchor="middle">
                        ARAKU CO-OP
                      </text>
                    </g>

                    <g transform="translate(320, 80)">
                      <circle r="16" fill="rgba(214,178,122,0.15)" className="animate-pulse-slow" />
                      <circle r="8" fill="#D6B27A" stroke="#120D0A" strokeWidth="2" />
                      <circle r="12" fill="none" stroke="#D6B27A" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s' }} />
                      <text y="-18" className="text-[8px] font-sans font-black tracking-widest text-warm-gold uppercase text-center animate-bounce" textAnchor="middle">
                        YOUR LOUNGE
                      </text>
                    </g>

                    <g className="animate-ride">
                      <circle r="9" fill="rgba(16,185,129,0.3)" />
                      <circle r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" className="animate-pulse" />
                    </g>
                  </svg>
                </div>

                <div className="p-6 bg-black/40 border-t border-warm-gold/10 relative z-10 flex justify-between items-center text-left">
                  <div>
                    <span className="text-[8px] font-sans text-cream-latte/45 tracking-widest uppercase font-bold block">Current Coordinates</span>
                    <span className="text-[10px] font-mono text-cream-latte/75 font-semibold block mt-0.5">18.0461° N, 79.0125° E (En Route)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-sans text-cream-latte/45 tracking-widest uppercase font-bold block">Delhivery speed</span>
                    <span className="text-sm font-bebas text-emerald-400 tracking-wider font-bold block mt-0.5 animate-pulse">42 KM/H</span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: LOGISTICS DETAILS AND REAL-TIME MILESTONES */}
              <div className="w-full md:w-[45%] p-6 md:p-8 flex flex-col justify-between text-left">
                
                <div>
                  <span className="text-[8px] font-sans tracking-[0.3em] text-warm-gold font-bold uppercase mb-2 block">
                    Delhivery Express Partner
                  </span>
                  <div className="flex items-center justify-between p-4 bg-espresso/50 border border-warm-gold/15 rounded-2xl mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-full filter blur-[25px] bg-warm-gold/5 -z-10" />
                    
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-warm-gold text-espresso flex items-center justify-center font-playfair font-black text-base shadow-[0_0_12px_rgba(214,178,122,0.35)] shrink-0">
                        VK
                      </div>
                      <div>
                        <h4 className="font-playfair font-bold text-sm text-cream-latte">Vijay Kumar</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-semibold text-emerald-400">4.9 ★</span>
                          <span className="text-cream-latte/20">|</span>
                          <span className="text-[9px] font-sans text-cream-latte/50 uppercase tracking-widest">Priority Cargo</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href="tel:+919848022338"
                      className="p-3 bg-warm-gold hover:bg-cream-latte text-espresso rounded-xl transition-all cursor-pointer shadow-md"
                      title="Contact Dispatcher Rider"
                    >
                      <Send size={14} className="stroke-[2.5] rotate-45 translate-x-[2px] -translate-y-[1px]" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-espresso/25 border border-warm-gold/10 p-4 rounded-2xl mb-6 text-xs">
                    <div>
                      <span className="text-[8px] font-sans text-cream-latte/45 tracking-widest uppercase block font-bold">Consignment ID</span>
                      <span className="font-semibold text-cream-latte mt-1 block">TRB-8729</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-sans text-cream-latte/45 tracking-widest uppercase block font-bold">AWB Reference</span>
                      <span className="font-semibold text-warm-gold mt-1 block tracking-wider font-mono uppercase">SR99201948</span>
                    </div>
                  </div>

                  <h5 className="text-[9px] font-sans tracking-[0.25em] text-warm-gold font-bold uppercase mb-4">
                    Your Logistical Progress
                  </h5>

                  <div className="relative pl-6 space-y-5">
                    <div className="absolute left-[7px] top-[8px] bottom-[8px] w-[1px] bg-warm-gold/20" />
                    <div className="absolute left-[7px] top-[8px] h-[72px] w-[1.5px] bg-emerald-500" />

                    <div className="relative">
                      <div className="absolute -left-[23px] top-[1.5px] w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 size={10} className="stroke-[2.5]" />
                      </div>
                      <div className="text-xs">
                        <h6 className="font-bold text-cream-latte flex items-center gap-2">
                          Roasting & Custom Packaging
                          <span className="text-[8px] bg-emerald-950 border border-emerald-500/20 text-emerald-400 font-sans px-1.5 py-0.5 rounded font-bold">DONE</span>
                        </h6>
                        <p className="text-[10px] text-cream-latte/50 mt-0.5">Wood-fired micro-lot roasting complete in Araku Valley.</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[23px] top-[1.5px] w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 size={10} className="stroke-[2.5]" />
                      </div>
                      <div className="text-xs">
                        <h6 className="font-bold text-cream-latte flex items-center gap-2">
                          Picked up by Delhivery Courier
                          <span className="text-[8px] bg-emerald-950 border border-emerald-500/20 text-emerald-400 font-sans px-1.5 py-0.5 rounded font-bold">DONE</span>
                        </h6>
                        <p className="text-[10px] text-cream-latte/50 mt-0.5">Cargo loaded at Visakhapatnam Dispatch Vaults.</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[23px] top-[1.5px] w-4 h-4 rounded-full bg-[#201610] border border-warm-gold/40 flex items-center justify-center text-warm-gold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                      </div>
                      <div className="text-xs">
                        <h6 className="font-bold text-warm-gold flex items-center gap-2">
                          In Transit - On the Way
                          <span className="text-[8px] bg-[#2C1F15] border border-warm-gold/20 text-warm-gold font-sans px-1.5 py-0.5 rounded font-bold animate-pulse">ACTIVE</span>
                        </h6>
                        <p className="text-[10px] text-cream-latte/50 mt-0.5">En route to your regional sorting hub. Transit tracking active.</p>
                      </div>
                    </div>

                    <div className="relative opacity-40">
                      <div className="absolute -left-[23px] top-[1.5px] w-4 h-4 rounded-full bg-[#1A130E] border border-cream-latte/15 flex items-center justify-center text-cream-latte/30">
                        <circle r="2" />
                      </div>
                      <div className="text-xs">
                        <h6 className="font-bold text-cream-latte">Out for Delivery</h6>
                        <p className="text-[10px] text-cream-latte/50 mt-0.5">Awaiting local sorting arrival.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-warm-gold/15 pt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowCustomerTracker(false);
                      setCheckoutStatus('idle');
                      setCartItems([]);
                    }}
                    className="px-8 py-3.5 bg-warm-gold text-espresso font-sans text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-cream-latte hover:text-espresso transition-all cursor-pointer shadow-[0_4px_20px_rgba(200,169,126,0.3)] w-full text-center font-bold"
                  >
                    Return to Lounge
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* USER LOGIN & REGISTRATION PORTAL */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            id="auth-modal"
          >
            <AuthPortal
              onClose={() => setIsAuthModalOpen(false)}
              onLoginSuccess={(user) => {
                setLoggedInUser(user);
                setIsAuthModalOpen(false);
                if (user.email === 'admin@tribalcoffee.in') {
                  window.history.pushState({}, '', '/admin');
                  setCurrentPath('/admin');
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AuthPortalProps {
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

function AuthPortal({ onClose, onLoginSuccess }: AuthPortalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Dynamic, premium delay for state changes
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (mode === 'login') {
      if (email === 'admin@tribalcoffee.in' && password === 'password123') {
        setSuccess('Commander Sharmila Authenticated. Synchronizing secure console.');
        setTimeout(() => {
          onLoginSuccess({ name: 'Sharmila K', email, role: 'Super Admin' });
        }, 1200);
      } else {
        // Mock Customer Login
        if (!email.trim() || !password.trim()) {
          setError('Please provide complete account credentials.');
          setLoading(false);
          return;
        }
        if (!email.includes('@')) {
          setError('Please enter a valid email format.');
          setLoading(false);
          return;
        }
        setSuccess('Welcome to the Tribal Coffee Connoisseur Lounge!');
        const initials = email.split('@')[0];
        const formattedName = initials.charAt(0).toUpperCase() + initials.slice(1);
        setTimeout(() => {
          onLoginSuccess({ name: formattedName, email });
        }, 1200);
      }
    } else {
      // Mock Customer Register
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please complete all field parameters.');
        setLoading(false);
        return;
      }
      if (!email.includes('@')) {
        setError('Please enter a valid email format.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Security code must be at least 6 characters.');
        setLoading(false);
        return;
      }
      setSuccess('Connoisseur profile created successfully! Logging in...');
      setTimeout(() => {
        onLoginSuccess({ name, email });
      }, 1200);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.92, y: 25 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.92, y: 25 }}
      transition={{ type: 'spring', damping: 22 }}
      className="w-full max-w-md glassmorphism border border-warm-gold/25 p-8 rounded-[35px] text-center relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
    >
      {/* Golden spotlight ambient aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full filter blur-[40px] bg-warm-gold/15 -z-10" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-cream-latte/5 text-cream-latte/50 hover:text-warm-gold transition-colors cursor-pointer"
        aria-label="Close auth portal"
      >
        <X size={18} />
      </button>

      {/* Brand Icon Block */}
      <div className="w-14 h-14 bg-warm-gold/10 border border-warm-gold/20 rounded-full flex items-center justify-center mx-auto mb-5 text-warm-gold">
        <User size={22} className="stroke-[1.5]" />
      </div>

      <span className="text-[9px] font-sans tracking-[0.3em] text-warm-gold font-bold uppercase mb-1.5 block">
        Tribal Coffee Lounge
      </span>
      
      <h3 className="font-playfair font-bold text-2xl text-cream-latte mb-2">
        {mode === 'login' ? 'Connoisseur Sign In' : 'Create Connoisseur Account'}
      </h3>
      <p className="text-[11px] text-cream-latte/60 max-w-[280px] mx-auto mb-6 leading-relaxed">
        {mode === 'login' 
          ? 'Enter your connoisseur details to access your custom blends and dispatch routes.' 
          : 'Unlock wood-fired micro-lot priorities and trace real-time Araku Valley dispatches.'
        }
      </p>

      {/* Selector Toggles */}
      <div className="grid grid-cols-2 p-1 bg-black/45 border border-warm-gold/10 rounded-xl mb-6 font-sans text-xs">
        <button
          onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
          className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
            mode === 'login' 
              ? 'bg-warm-gold text-espresso shadow-[0_2px_8px_rgba(214,178,122,0.25)]' 
              : 'text-cream-latte/60 hover:text-cream-latte'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
          className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
            mode === 'register' 
              ? 'bg-warm-gold text-espresso shadow-[0_2px_8px_rgba(214,178,122,0.25)]' 
              : 'text-cream-latte/60 hover:text-cream-latte'
          }`}
        >
          Register
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans">
        {mode === 'register' && (
          <div>
            <label className="text-[9px] text-cream-latte/55 uppercase tracking-wider mb-1.5 block font-bold">
              Connoisseur Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cream-latte/30">
                <User size={14} />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your name"
                className="w-full bg-[#1A110B]/70 border border-warm-gold/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-cream-latte focus:outline-none focus:border-warm-gold/50 transition-colors placeholder-cream-latte/20 font-medium"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-[9px] text-cream-latte/55 uppercase tracking-wider mb-1.5 block font-bold">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cream-latte/30">
              <Mail size={14} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full bg-[#1A110B]/70 border border-warm-gold/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-cream-latte focus:outline-none focus:border-warm-gold/50 transition-colors placeholder-cream-latte/20 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="text-[9px] text-cream-latte/55 uppercase tracking-wider mb-1.5 block font-bold">
            Passcode / Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cream-latte/30">
              <Lock size={14} />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full bg-[#1A110B]/70 border border-warm-gold/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-cream-latte focus:outline-none focus:border-warm-gold/50 transition-colors placeholder-cream-latte/20 font-medium"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/25 px-4 py-2.5 rounded-xl flex items-center gap-2 text-[10px] text-red-300 font-bold leading-normal">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/45 border border-emerald-500/30 px-4 py-2.5 rounded-xl flex items-center gap-2 text-[10px] text-emerald-300 font-bold leading-normal animate-pulse-slow">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-warm-gold hover:bg-cream-latte text-espresso font-sans text-[10px] font-black tracking-[0.2em] uppercase py-3.5 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(200,169,126,0.18)] hover:shadow-none disabled:opacity-40"
        >
          {loading 
            ? 'Processing Request...' 
            : mode === 'login' ? 'Authenticate Account' : 'Initialize Connoisseur Profile'
          }
        </button>
      </form>

      <div className="mt-6 text-[8px] text-cream-latte/35 tracking-wider font-medium">
        Secured by Tribal Coffee Co. Volcanic Roasting Cryptography
      </div>
    </motion.div>
  );
}
