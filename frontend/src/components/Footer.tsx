import { useState } from 'react';
import { Mail, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer 
      id="contact"
      className="bg-espresso text-cream-latte pt-16 pb-10 relative z-10 overflow-hidden border-t border-warm-gold/5"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative">
        
        {/* TOP BLOCK: NEWSLETTER SIGNUP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-warm-gold/10 items-center">
          <div className="lg:col-span-6 text-left">
            <span className="text-xs font-sans tracking-[0.25em] text-warm-gold font-bold uppercase mb-2 block">
              Join the Elite Lounge
            </span>
            <h2 className="text-2xl md:text-3xl font-playfair font-bold tracking-wide leading-tight">
              Subscribe For Exclusive Blends & Secret Sales
            </h2>
            <p className="text-xs text-cream-latte/60 font-sans mt-3 max-w-md">
              Receive priority notifications on rare Araku Valley micro-lots, private tasting invitations, and exclusive brand offerings.
            </p>
          </div>
          
          <div className="lg:col-span-6">
            <form 
              id="newsletter-form"
              onSubmit={handleSubmit} 
              className="flex items-center border-b border-warm-gold/30 hover:border-warm-gold/80 transition-all duration-300 py-3 relative group"
            >
              <Mail className="text-warm-gold/40 group-focus-within:text-warm-gold transition-colors duration-300 mr-3" size={18} />
              <input
                type="email"
                required
                id="newsletter-email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none text-cream-latte placeholder-cream-latte/40 focus:outline-none font-sans text-sm tracking-wide"
              />
              <button
                type="submit"
                id="newsletter-submit"
                className="text-xs font-sans font-bold tracking-widest text-warm-gold uppercase flex items-center gap-1 cursor-pointer hover:text-cream-latte transition-colors duration-300 ml-4 whitespace-nowrap"
              >
                {subscribed ? 'Subscribed' : 'Subscribe'}
                <ArrowUpRight size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* MIDDLE BLOCK: COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12 text-left">
          {/* Brand Col */}
          <div>
            <a 
              href="#" 
              id="footer-logo"
              className="flex items-center gap-3 text-2xl font-playfair font-bold tracking-widest text-cream-latte mb-6 block"
            >
              <img 
                src="/images/Logo-Registered.webp" 
                alt="Tribal Coffee Logo" 
                className="h-10 w-auto object-contain filter invert brightness-110 hover:scale-105 transition-transform duration-300 inline-block"
              />
              <span className="font-bebas text-lg md:text-xl tracking-[0.1em] text-cream-latte">
                TRIBAL COFFEE
              </span>
            </a>
            <p className="text-xs text-cream-latte/55 font-sans leading-relaxed mb-6">
              Modern luxury organic coffee, hand-harvested by Araku Valley indigenous cooperatives and custom-roasted to order.
            </p>
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a
                href="#"
                id="footer-social-instagram"
                className="w-9 h-9 rounded-full glassmorphism border border-warm-gold/15 flex items-center justify-center text-cream-latte/70 hover:text-espresso hover:bg-warm-gold hover:border-warm-gold transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="#"
                id="footer-social-facebook"
                className="w-9 h-9 rounded-full glassmorphism border border-warm-gold/15 flex items-center justify-center text-cream-latte/70 hover:text-espresso hover:bg-warm-gold hover:border-warm-gold transition-all duration-300"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V1h-4c-2.5 0-5 1.5-5 5v2z" />
                </svg>
              </a>

              {/* Twitter */}
              <a
                href="#"
                id="footer-social-twitter"
                className="w-9 h-9 rounded-full glassmorphism border border-warm-gold/15 flex items-center justify-center text-cream-latte/70 hover:text-espresso hover:bg-warm-gold hover:border-warm-gold transition-all duration-300"
                aria-label="Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Col */}
          <div>
            <h4 className="text-xs font-sans tracking-[0.2em] text-warm-gold font-bold uppercase mb-6">
              Shop Collections
            </h4>
            <div className="flex flex-col gap-3 font-sans text-xs text-cream-latte/65">
              <a href="#" className="hover:text-warm-gold transition-colors duration-300">Artisanal Whole Beans</a>
              <a href="#" className="hover:text-warm-gold transition-colors duration-300">Organic Arabica Powder</a>
              <a href="#" className="hover:text-warm-gold transition-colors duration-300">24-Hour Cold Brew Flasks</a>
              <a href="#" className="hover:text-warm-gold transition-colors duration-300">Limited Roast Editions</a>
            </div>
          </div>

          {/* About Col */}
          <div>
            <h4 className="text-xs font-sans tracking-[0.2em] text-warm-gold font-bold uppercase mb-6">
              Company
            </h4>
            <div className="flex flex-col gap-3 font-sans text-xs text-cream-latte/65">
              <a href="#" className="hover:text-warm-gold transition-colors duration-300">Our Roasting Heritage</a>
              <a href="#" className="hover:text-warm-gold transition-colors duration-300">Volcanic Plantations</a>
              <a href="#" className="hover:text-warm-gold transition-colors duration-300">Ethical Direct Trade</a>
              <a href="#" className="hover:text-warm-gold transition-colors duration-300">Private Lounge Club</a>
            </div>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-xs font-sans tracking-[0.2em] text-warm-gold font-bold uppercase mb-6">
              Contact & Support
            </h4>
            <p className="text-xs text-cream-latte/55 font-sans leading-relaxed mb-4">
              Araku Co-op Center, Visakhapatnam<br />
              Flagship Lounge, Bengaluru<br />
              India Wide Delivery Vaults
            </p>
            <p className="text-xs text-warm-gold font-sans font-bold">
              care@tribalcoffee.in
            </p>
          </div>
        </div>

        {/* BOTTOM BLOCK: COPYRIGHT AND GRADIENT DIVIDER */}
        <div className="border-t border-warm-gold/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-sans tracking-widest text-cream-latte/45 uppercase text-left">
            © {new Date().getFullYear()} Tribal Coffee India. All Rights Reserved. Sourced ethically from the Araku Valley.
          </p>
          <div className="flex items-center gap-6 text-[10px] font-sans tracking-widest text-cream-latte/45 uppercase">
            <a href="#" className="hover:text-warm-gold transition-colors">Privacy Policy</a>
            <span className="text-warm-gold/25">•</span>
            <a href="#" className="hover:text-warm-gold transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
