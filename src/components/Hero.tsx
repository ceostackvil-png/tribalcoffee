import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TRIBAL_PRODUCTS, type RealProduct } from '../services/db';
import FloatingCoffeeBean from './FloatingCoffeeBean';

interface HeroProps {
  onAddToBag: (product: RealProduct) => void;
  onViewDetails: (product: RealProduct) => void;
}

export default function Hero({ onAddToBag, onViewDetails }: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Real-time mouse tilt properties
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)' });
  const [glowOffset, setGlowOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });


  // Circular offset function to determine 3D positions of the 5 products
  const getOffset = (idx: number) => {
    const N = TRIBAL_PRODUCTS.length;
    let offset = (idx - activeIndex + N) % N;
    if (offset > N / 2) {
      offset -= N;
    }
    return offset;
  };

  const activeProduct = TRIBAL_PRODUCTS[activeIndex];
  
  const autoPlayTimerRef = useRef<any>(null);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % TRIBAL_PRODUCTS.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + TRIBAL_PRODUCTS.length) % TRIBAL_PRODUCTS.length);
  };

  // Preload all high-res product images on initial mount to eliminate loading latency and cache textures
  useEffect(() => {
    TRIBAL_PRODUCTS.forEach((product) => {
      const img = new Image();
      img.src = product.image;
    });
  }, []);

  // Auto-play selector with pause-on-hover triggers
  useEffect(() => {
    if (!isHovered) {
      autoPlayTimerRef.current = setInterval(() => {
        nextSlide();
      }, 4500);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isHovered, activeIndex]);

  // 3D Card Hover Rotation Effect - optimized with translate3d
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const rotateX = -y / (box.height / 15);
    const rotateY = x / (box.width / 15);
    
    // Smooth 3D tilt transition
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02) translate3d(0, 0, 0)`
    });

    // Opposite parallax shifts on the active backing light - restricted to GPU translation
    setGlowOffset({
      x: -x / 6,
      y: -y / 6
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translate3d(0, 0, 0)'
    });
    setGlowOffset({ x: 0, y: 0 });
  };

  // Section-wide mouse tracker for parallax coffee beans
  const handleSectionMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePos({ x, y });
  };

  const handleSectionMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section
      id="home"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleSectionMouseLeave}
      onMouseMove={handleSectionMouseMove}
      className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden pt-20 md:pt-24 pb-16 transition-colors duration-1000 ease-in-out z-10"
      style={{ background: '#111111' }}
    >
      {/* GPU-Composited Custom keyframes to animate coffee beans and smoke on the GPU thread with 0% CPU cost */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gpuSlowFloat1 {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(6px, -12px, 0) rotate(4deg); }
          100% { transform: translate3d(0, 0, 0) rotate(0deg); }
        }
        @keyframes gpuSlowFloat2 {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(-6px, -14px, 0) rotate(-4deg); }
          100% { transform: translate3d(0, 0, 0) rotate(0deg); }
        }
        .animate-gpu-float-1 {
          animation: gpuSlowFloat1 18s ease-in-out infinite;
          will-change: transform;
        }
        .animate-gpu-float-2 {
          animation: gpuSlowFloat2 22s ease-in-out infinite;
          will-change: transform;
        }
      `}} />

      {/* 1. Cinematic Ambiance Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Layer A: Base Rich Dark Roasted Espresso Background Color */}
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-in-out"
          style={{ background: '#0a0705' }}
        />

        {/* Layer A-2: Cinematic Coffee Lounge Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-20 mix-blend-overlay"
          style={{ 
            backgroundImage: `url('/images/luxury_coffee_hero_bg.png')`,
          }}
        />

        {/* Layer B: Dark Smoky Gradient with Product Tint - Dynamic transition */}
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-in-out opacity-85"
          style={{ 
            background: `radial-gradient(circle at 50% 45%, ${activeProduct.glowColor} 0%, rgba(10, 7, 5, 0.98) 70%)`
          }}
        />

        {/* Layer C: Premium Warm Backing Amber Light behind the active product */}
        <div 
          className="absolute inset-0 transition-all duration-1000 opacity-50 mix-blend-color-dodge animate-pulse-slow"
          style={{
            background: `radial-gradient(circle at 50% 45%, rgba(200, 169, 126, 0.45) 0%, transparent 60%)`,
          }}
        />

        {/* Layer D: Cinematic Vignette to keep corners rich, dark, and highly immersive */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at center, transparent 35%, rgba(10, 7, 5, 0.98) 100%)'
        }} />
        
        {/* Layer E: Soft Ambient Smoke/Steam (Cinematic depth) - static transitions with 0% javascript overhead */}
        <div className="coffee-steam-element left-1/4 animate-smoke opacity-10" style={{ animationDelay: '0s', width: '160px', willChange: 'opacity' }} />
        <div className="coffee-steam-element right-1/4 animate-smoke opacity-8" style={{ animationDelay: '3s', width: '200px', willChange: 'opacity' }} />
      </div>

      {/* 2. GIANT BACKING TYPOGRAPHY */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.h1
            key={activeProduct.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.02, scale: 1.02 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
            className="text-[12vw] font-bebas font-extrabold text-cream-latte tracking-[0.15em] text-center select-none whitespace-nowrap outline-text leading-none uppercase"
            style={{
              willChange: 'transform, opacity',
              WebkitTextStroke: '1px rgba(231, 216, 201, 0.12)',
              color: 'transparent'
            }}
          >
            {activeProduct.category === 'beans' ? 'ORGANIC BEANS' : activeProduct.category === 'filter' ? 'SOUTH FILTER' : 'ARAKU POWDER'}
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* 3. DYNAMIC PARALLAX FLOATING COFFEE BEANS - Multi-layered 3D depth-of-field focus */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* === LAYER 1: FOREGROUND BEANS (14 instances) === */}
        <FloatingCoffeeBean
          size={90}
          mobileSize={60}
          top="82%"
          left="6%"
          depth="foreground"
          parallaxFactor={-0.06}
          rotation={35}
          animationDelay="0s"
          animationDuration="12s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={100}
          mobileSize={65}
          top="60%"
          right="-4%"
          depth="foreground"
          parallaxFactor={-0.08}
          rotation={-45}
          animationDelay="2s"
          animationDuration="14s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={75}
          mobileSize={50}
          top="8%"
          left="35%"
          depth="foreground"
          parallaxFactor={-0.05}
          rotation={15}
          animationDelay="4s"
          animationDuration="10s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={85}
          mobileSize={55}
          top="15%"
          left="-3%"
          depth="foreground"
          parallaxFactor={-0.07}
          rotation={-25}
          animationDelay="1.5s"
          animationDuration="13s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={95}
          mobileSize={62}
          top="92%"
          right="8%"
          depth="foreground"
          parallaxFactor={-0.075}
          rotation={65}
          animationDelay="3s"
          animationDuration="15s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={80}
          mobileSize={52}
          top="5%"
          right="20%"
          depth="foreground"
          parallaxFactor={-0.055}
          rotation={-15}
          animationDelay="5s"
          animationDuration="11s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={105}
          mobileSize={68}
          top="45%"
          left="5%"
          depth="foreground"
          parallaxFactor={-0.09}
          rotation={125}
          animationDelay="2.5s"
          animationDuration="16s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={88}
          mobileSize={58}
          top="80%"
          right="42%"
          depth="foreground"
          parallaxFactor={-0.065}
          rotation={-85}
          animationDelay="0.5s"
          animationDuration="12.5s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={78}
          mobileSize={50}
          top="35%"
          right="8%"
          depth="foreground"
          parallaxFactor={-0.05}
          rotation={40}
          animationDelay="4.5s"
          animationDuration="10.5s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={92}
          mobileSize={60}
          top="90%"
          left="25%"
          depth="foreground"
          parallaxFactor={-0.07}
          rotation={10}
          animationDelay="1s"
          animationDuration="13.5s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={82}
          mobileSize={54}
          top="28%"
          left="48%"
          depth="foreground"
          parallaxFactor={-0.06}
          rotation={-60}
          animationDelay="3.5s"
          animationDuration="11.5s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={98}
          mobileSize={64}
          top="72%"
          left="15%"
          depth="foreground"
          parallaxFactor={-0.08}
          rotation={140}
          animationDelay="5.5s"
          animationDuration="14.5s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={85}
          mobileSize={55}
          top="52%"
          right="24%"
          depth="foreground"
          parallaxFactor={-0.065}
          rotation={70}
          animationDelay="2s"
          animationDuration="12s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={90}
          mobileSize={58}
          top="2%"
          left="12%"
          depth="foreground"
          parallaxFactor={-0.075}
          rotation={-110}
          animationDelay="6s"
          animationDuration="15s"
          mousePos={mousePos}
        />

        {/* === LAYER 2: MIDGROUND BEANS (18 instances) === */}
        <FloatingCoffeeBean
          size={60}
          mobileSize={40}
          top="16%"
          left="10%"
          depth="midground"
          parallaxFactor={-0.04}
          rotation={75}
          animationDelay="1s"
          animationDuration="13s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={64}
          mobileSize={42}
          top="20%"
          right="12%"
          depth="midground"
          parallaxFactor={-0.03}
          rotation={-20}
          animationDelay="3s"
          animationDuration="15s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={55}
          mobileSize={35}
          top="85%"
          left="48%"
          depth="midground"
          parallaxFactor={-0.045}
          rotation={110}
          animationDelay="5s"
          animationDuration="11s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={58}
          mobileSize={38}
          top="72%"
          right="15%"
          depth="midground"
          parallaxFactor={-0.035}
          rotation={210}
          animationDelay="0.5s"
          animationDuration="16s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={62}
          mobileSize={40}
          top="10%"
          left="22%"
          depth="midground"
          parallaxFactor={-0.045}
          rotation={-130}
          animationDelay="2.2s"
          animationDuration="14s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={56}
          mobileSize={36}
          top="32%"
          right="35%"
          depth="midground"
          parallaxFactor={-0.035}
          rotation={85}
          animationDelay="4.1s"
          animationDuration="12s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={68}
          mobileSize={44}
          top="65%"
          left="30%"
          depth="midground"
          parallaxFactor={-0.05}
          rotation={-50}
          animationDelay="1.8s"
          animationDuration="15.5s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={66}
          mobileSize={42}
          top="48%"
          right="18%"
          depth="midground"
          parallaxFactor={-0.045}
          rotation={160}
          animationDelay="3.2s"
          animationDuration="13.5s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={60}
          mobileSize={38}
          top="95%"
          left="10%"
          depth="midground"
          parallaxFactor={-0.04}
          rotation={-15}
          animationDelay="0.8s"
          animationDuration="12.5s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={58}
          mobileSize={36}
          top="78%"
          right="3%"
          depth="midground"
          parallaxFactor={-0.038}
          rotation={95}
          animationDelay="2.7s"
          animationDuration="14.8s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={64}
          mobileSize={42}
          top="40%"
          left="18%"
          depth="midground"
          parallaxFactor={-0.048}
          rotation={-70}
          animationDelay="5.2s"
          animationDuration="11.2s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={57}
          mobileSize={36}
          top="5%"
          right="32%"
          depth="midground"
          parallaxFactor={-0.032}
          rotation={120}
          animationDelay="1.3s"
          animationDuration="16.2s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={62}
          mobileSize={40}
          top="25%"
          left="62%"
          depth="midground"
          parallaxFactor={-0.042}
          rotation={-40}
          animationDelay="3.7s"
          animationDuration="13s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={59}
          mobileSize={38}
          top="58%"
          right="45%"
          depth="midground"
          parallaxFactor={-0.04}
          rotation={105}
          animationDelay="4.8s"
          animationDuration="15s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={65}
          mobileSize={42}
          top="82%"
          left="68%"
          depth="midground"
          parallaxFactor={-0.046}
          rotation={-105}
          animationDelay="2.1s"
          animationDuration="12.8s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={61}
          mobileSize={39}
          top="90%"
          right="28%"
          depth="midground"
          parallaxFactor={-0.044}
          rotation={45}
          animationDelay="0.4s"
          animationDuration="14.2s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={56}
          mobileSize={36}
          top="14%"
          right="4%"
          depth="midground"
          parallaxFactor={-0.034}
          rotation={-95}
          animationDelay="3.9s"
          animationDuration="11.9s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={63}
          mobileSize={41}
          top="38%"
          left="42%"
          depth="midground"
          parallaxFactor={-0.045}
          rotation={135}
          animationDelay="5.8s"
          animationDuration="15.1s"
          mousePos={mousePos}
        />

        {/* === LAYER 3: BACKGROUND BEANS (18 instances) === */}
        <FloatingCoffeeBean
          size={40}
          mobileSize={25}
          top="50%"
          left="20%"
          depth="background"
          parallaxFactor={-0.015}
          rotation={12}
          animationDelay="6s"
          animationDuration="18s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={36}
          mobileSize={22}
          top="12%"
          left="55%"
          depth="background"
          parallaxFactor={-0.01}
          rotation={-60}
          animationDelay="1.5s"
          animationDuration="17s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={42}
          mobileSize={28}
          top="45%"
          right="28%"
          depth="background"
          parallaxFactor={-0.02}
          rotation={155}
          animationDelay="4.5s"
          animationDuration="19s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={45}
          mobileSize={30}
          top="28%"
          left="8%"
          depth="background"
          parallaxFactor={-0.022}
          rotation={-30}
          animationDelay="0.5s"
          animationDuration="16.5s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={38}
          mobileSize={24}
          top="82%"
          right="22%"
          depth="background"
          parallaxFactor={-0.015}
          rotation={65}
          animationDelay="2.5s"
          animationDuration="18.2s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={48}
          mobileSize={32}
          top="62%"
          left="52%"
          depth="background"
          parallaxFactor={-0.025}
          rotation={-125}
          animationDelay="4.2s"
          animationDuration="17.5s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={35}
          mobileSize={22}
          top="2%"
          right="15%"
          depth="background"
          parallaxFactor={-0.008}
          rotation={145}
          animationDelay="1.1s"
          animationDuration="19.5s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={44}
          mobileSize={28}
          top="70%"
          left="82%"
          depth="background"
          parallaxFactor={-0.02}
          rotation={-45}
          animationDelay="3.3s"
          animationDuration="16.8s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={40}
          mobileSize={26}
          top="95%"
          left="35%"
          depth="background"
          parallaxFactor={-0.018}
          rotation={115}
          animationDelay="5.4s"
          animationDuration="18s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={46}
          mobileSize={30}
          top="18%"
          left="45%"
          depth="background"
          parallaxFactor={-0.024}
          rotation={-80}
          animationDelay="2.8s"
          animationDuration="17.2s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={37}
          mobileSize={24}
          top="34%"
          right="12%"
          depth="background"
          parallaxFactor={-0.012}
          rotation={50}
          animationDelay="0.2s"
          animationDuration="19.1s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={42}
          mobileSize={28}
          top="54%"
          left="10%"
          depth="background"
          parallaxFactor={-0.02}
          rotation={-160}
          animationDelay="3.8s"
          animationDuration="16.3s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={39}
          mobileSize={25}
          top="88%"
          right="10%"
          depth="background"
          parallaxFactor={-0.016}
          rotation={25}
          animationDelay="1.9s"
          animationDuration="17.9s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={43}
          mobileSize={27}
          top="22%"
          right="26%"
          depth="background"
          parallaxFactor={-0.022}
          rotation={-105}
          animationDelay="4.7s"
          animationDuration="18.4s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={47}
          mobileSize={31}
          top="74%"
          left="28%"
          depth="background"
          parallaxFactor={-0.025}
          rotation={90}
          animationDelay="5.9s"
          animationDuration="16.6s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={36}
          mobileSize={23}
          top="3%"
          left="68%"
          depth="background"
          parallaxFactor={-0.01}
          rotation={-15}
          animationDelay="2.4s"
          animationDuration="19.2s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={41}
          mobileSize={26}
          top="58%"
          right="32%"
          depth="background"
          parallaxFactor={-0.019}
          rotation={130}
          animationDelay="0.7s"
          animationDuration="17.8s"
          mousePos={mousePos}
        />
        <FloatingCoffeeBean
          size={44}
          mobileSize={28}
          top="42%"
          left="64%"
          depth="background"
          parallaxFactor={-0.021}
          rotation={-55}
          animationDelay="3.5s"
          animationDuration="18.1s"
          mousePos={mousePos}
        />
      </div>

      {/* 4. MAIN SPLIT CONTENT GRID CONTAINER */}
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:grid md:grid-cols-[0.95fr_1.05fr] gap-12 md:gap-8 items-center justify-center flex-grow z-10 relative">
        
        {/* LEFT COLUMN: Product information & navigation selector */}
        <div className="order-2 md:order-1 text-left flex flex-col justify-center min-h-[340px] md:min-h-[450px] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProduct.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              style={{ willChange: 'transform, opacity' }}
              id={`hero-content-${activeProduct.id}`}
              className="flex flex-col text-left justify-center w-full max-w-[540px]"
            >
              {/* Tagline */}
              <span className="text-xs font-sans tracking-[0.3em] text-warm-gold font-bold uppercase mb-2 block">
                {activeProduct.tagline}
              </span>

              {/* Product Title */}
              <h2 className="text-3xl md:text-5xl font-playfair font-bold text-cream-latte leading-tight mb-4">
                {activeProduct.name}
              </h2>

              {/* Specifications & Price */}
              <div className="flex items-center gap-4 mb-4 text-sm text-cream-latte/70 font-sans">
                <span className="bg-bean/60 border border-warm-gold/20 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase">
                  {activeProduct.roast}
                </span>
                <span className="bg-cream-latte/5 border border-cream-latte/15 px-3 py-1 rounded-full text-xs tracking-wide uppercase">
                  {activeProduct.chicory}
                </span>
                <span className="font-bebas text-2xl text-warm-gold tracking-widest">
                  ₹{activeProduct.price}.00
                </span>
              </div>

              {/* Description */}
              <p className="text-sm md:text-base text-cream-latte/70 max-w-md font-sans leading-relaxed mb-6">
                {activeProduct.description}
              </p>

              {/* Tasting Notes */}
              <div className="flex flex-wrap gap-2 mb-8">
                {activeProduct.tastingNotes.map((note) => (
                  <span 
                    key={note} 
                    className="text-xs font-sans font-medium px-3 py-1.5 rounded-md glassmorphism text-cream-latte/90 flex items-center gap-1.5 border border-warm-gold/5"
                  >
                    <span className="w-1.5 h-1.5 bg-warm-gold rounded-full" />
                    {note}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4 mb-8">
                <button
                  id={`hero-buy-now-${activeProduct.id}`}
                  onClick={() => onAddToBag(activeProduct)}
                  className="bg-warm-gold text-espresso font-sans text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-full border border-warm-gold hover:bg-transparent hover:text-warm-gold hover:shadow-[0_0_20px_rgba(200,169,126,0.35)] transition-all duration-300 cursor-pointer"
                >
                  Buy Now
                </button>
                <button
                  id={`hero-view-details-${activeProduct.id}`}
                  onClick={() => onViewDetails(activeProduct)}
                  className="text-cream-latte hover:text-warm-gold bg-transparent font-sans text-xs font-bold tracking-widest uppercase px-6 py-4 border border-cream-latte/20 hover:border-warm-gold rounded-full transition-all duration-300 flex items-center gap-2 group cursor-pointer"
                >
                  View Details
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Interactive Glassmorphic Thumbnail Selector - containing ALL 5 products inside left content area */}
          <div className="flex items-center gap-3 flex-wrap mt-4 md:mt-2">
            {TRIBAL_PRODUCTS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActiveIndex(idx)}
                id={`carousel-thumbnail-${p.id}`}
                className={`relative w-14 h-14 p-2 rounded-2xl cursor-pointer transition-all duration-500 flex items-center justify-center glassmorphism overflow-hidden ${
                  activeIndex === idx 
                    ? 'border-2 border-warm-gold shadow-[0_0_15px_rgba(214,178,122,0.4)] blur-none brightness-110 scale-105 z-10' 
                    : 'opacity-40 hover:opacity-80 blur-[0.5px] hover:blur-none border border-cream-latte/10 scale-95 hover:scale-100 hover:z-10'
                }`}
                aria-label={`Select Product ${p.name}`}
              >
                {activeIndex === idx && (
                  <div className="absolute inset-0 bg-warm-gold/10 rounded-2xl pointer-events-none animate-pulse" />
                )}
                <img
                  src={p.image}
                  alt={p.name}
                  loading="eager"
                  decoding="async"
                  className="h-10 w-auto object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)] transform hover:scale-110 transition-transform duration-300"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Premium 3D Rotating Carousel */}
        <div className="order-1 md:order-2 w-full h-[380px] sm:h-[460px] md:h-[580px] lg:h-[700px] relative flex items-center justify-center overflow-visible">
          {/* Floating Left Navigation Button */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:-left-8 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full backdrop-blur-md bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-warm-gold/40 hover:scale-110 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-pointer group"
            aria-label="Previous Product"
          >
            <ArrowLeft size={20} className="stroke-[2] group-hover:-translate-x-0.5 transition-transform duration-300" />
          </button>

          {/* Unified 3D Carousel container */}
          <div className="relative w-full h-full flex items-center justify-center select-none overflow-visible">
            {TRIBAL_PRODUCTS.map((product, idx) => {
              const offset = getOffset(idx);
              const isActive = offset === 0;
              const isLeft = offset === -1;
              const isRight = offset === 1;

              // Strict percentage spacing rules: LEFT BACK: 22%, LEFT SIDE: 34%, CENTER: 50%, RIGHT SIDE: 66%, RIGHT BACK: 78%
              const leftPos = offset === -2 
                ? "22%" 
                : offset === -1 
                  ? "34%" 
                  : offset === 0 
                    ? "50%" 
                    : offset === 1 
                      ? "66%" 
                      : "78%";

              const scaleVal = isActive 
                ? 1.15 
                : Math.abs(offset) === 1 
                  ? 0.82 
                  : 0.60;

              const opacityVal = isActive 
                ? 1.0 
                : Math.abs(offset) === 1 
                  ? 0.7 
                  : 0.25;

              const zIndexVal = isActive 
                ? 40 
                : Math.abs(offset) === 1 
                  ? 20 
                  : 10;

              const blurVal = isActive 
                ? "blur(0px)" 
                : Math.abs(offset) === 1 
                  ? "blur(2px)" 
                  : "blur(5px)";

              const zTranslate = isActive 
                ? 120 
                : Math.abs(offset) === 1 
                  ? -60 
                  : -180;

              return (
                <motion.div
                  key={product.id}
                  style={{
                    position: 'absolute',
                    willChange: 'transform, opacity, filter',
                    backfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d',
                    zIndex: zIndexVal,
                    pointerEvents: isActive || isLeft || isRight ? 'auto' : 'none',
                    x: "-50%", // Keep the card centered on the percentage-based left anchor
                    ...(isActive ? tiltStyle : {})
                  }}
                  animate={{
                    left: leftPos,
                    scale: scaleVal,
                    opacity: opacityVal,
                    filter: blurVal,
                    z: zTranslate,
                    rotateY: isActive ? 0 : offset * -12
                  }}
                  transition={{
                    duration: 0.65,
                    ease: [0.4, 0, 0.2, 1] // Premium Framer transition curve
                  }}
                  onMouseMove={isActive ? handleMouseMove : undefined}
                  onMouseLeave={isActive ? handleMouseLeave : undefined}
                  onClick={() => {
                    if (isActive) {
                      onViewDetails(product);
                    } else if (isLeft) {
                      prevSlide();
                    } else if (isRight) {
                      nextSlide();
                    }
                  }}
                  id={`carousel-card-${product.id}`}
                  className="absolute flex flex-col items-center justify-center w-[280px] h-[360px] md:w-[380px] md:h-[520px] lg:w-[500px] lg:h-[680px] cursor-pointer select-none"
                >
                  {/* Gold Ambient Backing Light - shifting dynamically in opposite parallax direction */}
                  {isActive && (
                    <div 
                      className="absolute inset-0 rounded-full filter blur-[100px] opacity-75 -z-10 mix-blend-screen transition-transform duration-300 ease-out"
                      style={{ 
                        background: `radial-gradient(circle, ${product.glowColor} 0%, transparent 70%)`,
                        transform: `translate3d(${glowOffset.x}px, ${glowOffset.y}px, -60px)`
                      }}
                    />
                  )}

                  {/* Texture overlay */}
                  <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 60%, rgba(17,17,17,0.3) 100%) pointer-events-none" />

                  {/* Float & Motion Interaction Layer */}
                  <motion.div
                    animate={isActive ? {
                      y: [0, -16, 0]
                    } : { y: 0 }}
                    transition={{
                      y: isActive ? {
                        repeat: Infinity,
                        duration: 6.5,
                        ease: "easeInOut"
                      } : { duration: 0.5 }
                    }}
                    className="flex flex-col items-center relative"
                    style={{ 
                      transformStyle: 'preserve-3d',
                      transform: 'translateZ(50px)'
                    }}
                  >
                    {/* Uniform Aspect-Locked Product Package Image Container */}
                    <div className="w-[280px] h-[360px] md:w-[380px] md:h-[500px] lg:w-[520px] lg:h-[650px] flex items-center justify-center relative overflow-visible">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="eager"
                        decoding="async"
                        id={`product-image-${product.id}`}
                        className="w-full h-full object-contain object-center drop-shadow-[0_50px_70px_rgba(0,0,0,0.9)] filter brightness-105 transition-transform duration-500"
                        style={{ imageRendering: '-webkit-optimize-contrast', willChange: 'transform' }}
                      />
                    </div>

                    {/* Ground Shadow - dynamically scaling shadow bloom base */}
                    <div 
                      className="w-40 h-5 bg-black/75 rounded-full filter blur-xl absolute -bottom-5 left-1/2 -translate-x-1/2 -z-10 transition-all duration-700 ease-out"
                      style={{ 
                        transform: isActive ? 'translate3d(0, 0, -10px) scale(1.15)' : 'translate3d(0, 0, -10px) scale(0.7)',
                        opacity: isActive ? 0.8 : 0.15
                      }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Floating Right Navigation Button */}
          <button
            onClick={nextSlide}
            className="absolute right-2 md:-right-8 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full backdrop-blur-md bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-warm-gold/40 hover:scale-110 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-pointer group"
            aria-label="Next Product"
          >
            <ArrowRight size={20} className="stroke-[2] group-hover:translate-x-0.5 transition-transform duration-300" />
          </button>
        </div>

      </div>
    </section>
  );
}
