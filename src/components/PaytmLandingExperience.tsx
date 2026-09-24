import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface PaytmLandingExperienceProps {
  onLaunchApp: () => void;
}

export const PaytmLandingExperience: React.FC<PaytmLandingExperienceProps> = ({ onLaunchApp }) => {
  // Calculator State
  const [monthlySpend, setMonthlySpend] = useState<number>(25000);
  const [monthlySip, setMonthlySip] = useState<number>(10000);

  // Phone 1 Interactive State
  const [walletBalance, setWalletBalance] = useState<number>(4820);
  const [isAddingMoney, setIsAddingMoney] = useState(false);

  // Phone 2 Interactive State (Payment Flow)
  const [paymentAmount, setPaymentAmount] = useState<number>(500);
  const [paymentDone, setPaymentDone] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paytm_upi' | 'hdfc'>('paytm_upi');
  const [soundboxPlaying, setSoundboxPlaying] = useState(false);

  // Bento Card 1: Bill Pay sub-tab
  const [activeBillTab, setActiveBillTab] = useState<'mobile' | 'dth' | 'power'>('mobile');
  const [billPaid, setBillPaid] = useState(false);

  // Bento Card 2: Scratchcard reveal
  const [scratchcardRevealed, setScratchcardRevealed] = useState(false);

  // Bento Card 4: Biometric Toggle
  const [biometricActive, setBiometricActive] = useState(true);

  // Mouse Parallax for Hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [4, -4]);
  const rotateY = useTransform(mouseX, [-300, 300], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handlePay = () => {
    setPaymentDone(true);
    setSoundboxPlaying(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f2ca50', '#d4af37', '#efe0cd', '#ffffff']
    });

    setTimeout(() => {
      setSoundboxPlaying(false);
    }, 4000);
  };

  // Calculations for yield projection
  const formatRupee = (amt: number) => '₹ ' + Math.round(amt).toLocaleString('en-IN');
  const annualCashback = monthlySpend * 12 * 0.014 + 600;
  const annualWealthGrowth = monthlySip * 12 * 0.12;
  const totalAnnualAdvantage = annualCashback + annualWealthGrowth;

  return (
    <div 
      onMouseMove={handleMouseMove} 
      className="w-full min-h-screen bg-[#171211] text-[#ebe0de] font-sans antialiased overflow-x-hidden selection:bg-[#f2ca50] selection:text-[#3c2f00]"
    >
      {/* FIXED GLASS HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pb-2 pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto h-20 w-full max-w-6xl mx-auto px-6 flex items-center justify-between rounded-full bg-[#201a19]/85 backdrop-blur-xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-300"
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <a className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <span className="font-serif text-[26px] tracking-tight text-[#f2ca50] font-bold group-hover:opacity-90 transition-opacity">
                Paytm
              </span>
              <span className="h-2 w-2 rounded-full bg-[#f2ca50] shadow-[0_0_8px_#f2ca50] animate-pulse"></span>
            </a>
            <span className="ml-2 hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#2f2927] text-[#d0c5af] text-[11px] font-bold uppercase tracking-wider font-mono">
              Bespoke Luxe
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[14px]">
            <a href="#explore" className="text-[#f2ca50] font-semibold transition-colors">Products</a>
            <a href="#wealth" className="text-[#d0c5af] hover:text-[#ebe0de] transition-colors">Wealth &amp; Invest</a>
            <a href="#trust" className="text-[#d0c5af] hover:text-[#ebe0de] transition-colors">UPI &amp; Soundbox</a>
            <a href="#calculator-section" className="text-[#d0c5af] hover:text-[#ebe0de] transition-colors">Cashback &amp; Perks</a>
            <a href="#trust" className="text-[#d0c5af] hover:text-[#ebe0de] transition-colors">Safety &amp; Security</a>
            <button onClick={onLaunchApp} className="text-[#f2ca50] hover:text-[#ffe088] font-medium transition-colors">
              Pulse OS ↗
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onLaunchApp}
              className="hidden md:inline-flex items-center px-4 py-2 rounded-full bg-[#2f2927] hover:bg-[#3a3332] text-[#efe0cd] text-[14px] font-semibold transition-all border border-white/5"
            >
              Open Pulse App
            </button>
            <button 
              onClick={onLaunchApp}
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-[#efe0cd] via-[#f2ca50] to-[#d4af37] hover:brightness-110 text-[#3c2f00] text-[14px] font-bold shadow-[0_4px_20px_rgba(242,202,80,0.35)] transition-all hover:scale-105 active:scale-95"
            >
              Get Started →
            </button>
            <div 
              onClick={onLaunchApp}
              className="w-8 h-8 rounded-full bg-[#f2ca50] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined text-[#3c2f00] text-[18px]">person</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="w-full pt-28">
        
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative w-full px-4 sm:px-8 lg:px-16 pt-8 pb-24 flex flex-col items-center">
          {/* Atmospheric Ambient Underglows */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] h-[400px] bg-[#f2ca50]/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
          <div className="absolute top-48 left-1/4 w-[380px] h-[380px] bg-[#713035]/20 rounded-full blur-[130px] pointer-events-none -z-10" />

          {/* Micro Pill Banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#2f2927]/90 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] mb-6"
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f2ca50] font-mono">Pay</span>
            <span className="w-1 h-1 rounded-full bg-[#99907c]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#efe0cd] font-mono">Save</span>
            <span className="w-1 h-1 rounded-full bg-[#99907c]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f2ca50] font-mono">Grow</span>
          </motion.div>

          {/* Headline & Subtitle */}
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-[46px] leading-[52px] sm:text-[68px] sm:leading-[74px] tracking-tight text-[#ebe0de] font-semibold"
            >
              Everything you need,<br />
              <span className="italic font-normal text-[#efe0cd] drop-shadow-sm">right here.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-[16px] sm:text-[18px] text-[#d0c5af] max-w-2xl mx-auto font-light leading-relaxed"
            >
              From everyday payments to smarter financial tools — Paytm makes your digital life simpler, safer, and supercharged.
            </motion.p>
          </div>

          {/* Action Bar & Trust Metric */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <button 
              onClick={onLaunchApp}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#efe0cd] via-[#f2ca50] to-[#d4af37] text-[#3c2f00] text-[15px] font-bold shadow-[0_8px_30px_rgba(242,202,80,0.3)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button 
              onClick={() => document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#2f2927]/90 hover:bg-[#3a3332] text-[#efe0cd] text-[14px] font-semibold border border-white/5 shadow-sm transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[#f2ca50] text-[20px]">calculate</span>
              <span>Calculate Returns</span>
            </button>
          </motion.div>

          {/* Live Social Proof Tag */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-6 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#201a19]/90 border border-white/5 shadow-sm"
          >
            <div className="flex text-[#f2ca50]">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              ))}
            </div>
            <span className="text-[12px] text-[#efe0cd] font-semibold">4.8 on App Store</span>
            <span className="text-[#99907c] text-xs">•</span>
            <span className="text-[12px] text-[#d0c5af]">Over 350M+ Indians trust Paytm</span>
          </motion.div>

          {/* ========================================================================= */}
          {/* FLOATING 3D PHONE SHOWCASE (Framer Motion Enhanced with Parallax & Springs) */}
          {/* ========================================================================= */}
          <motion.div 
            style={{ rotateX, rotateY }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="relative w-full max-w-6xl mt-16 pt-4 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 perspective-1200 z-20"
          >
            
            {/* PHONE 1: Balance & Quick Action Hub (Left) */}
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-full max-w-[320px] rounded-[42px] p-3.5 bg-[#120d0c] border border-white/10 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.85)] relative"
            >
              <div className="w-full rounded-[34px] bg-[#201a19] p-4 flex flex-col gap-4 border border-white/5">
                {/* Status bar */}
                <div className="flex justify-between items-center text-[#d0c5af] text-[11px] font-mono pt-1 px-1">
                  <span>9:41</span>
                  <div className="w-20 h-4 rounded-full bg-[#120d0c] mx-auto -mt-1" />
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                    <span className="material-symbols-outlined text-[14px]">wifi</span>
                    <span className="material-symbols-outlined text-[14px]">battery_full</span>
                  </div>
                </div>

                {/* Brand & Greeting */}
                <div className="flex justify-between items-center px-1">
                  <div>
                    <div className="font-serif text-[20px] text-[#f2ca50] font-bold tracking-tight">paytm</div>
                    <p className="text-[11px] text-[#efe0cd] mt-0.5 font-medium">Good Morning, Jatin ☀️</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#efe0cd] text-[18px] p-1.5 rounded-full bg-[#2f2927]">notifications</span>
                    <span className="material-symbols-outlined text-[#efe0cd] text-[18px] p-1.5 rounded-full bg-[#2f2927]">qr_code_scanner</span>
                  </div>
                </div>

                {/* Wallet Balance Card (Cream Card) */}
                <div className="rounded-2xl p-4 bg-gradient-to-br from-[#efe0cd] to-[#d2c4b2] text-[#221a0f] shadow-md flex justify-between items-end relative overflow-hidden">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] tracking-wider uppercase text-[#221a0f]/80 font-bold font-mono">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      Paytm Balance
                    </div>
                    <div className="font-serif text-[32px] text-[#221a0f] font-bold mt-1">
                      ₹ {walletBalance.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setWalletBalance(prev => prev + 500);
                      confetti({ particleCount: 30, spread: 40 });
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#120d0c] hover:bg-[#201a19] text-[#efe0cd] text-[11px] font-bold active:scale-95 transition-all shadow-sm"
                  >
                    + Add Money
                  </button>
                </div>

                {/* 4-Icon Action Hub */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[
                    { icon: 'qr_code_scanner', label: 'Scan & Pay' },
                    { icon: 'phone_iphone', label: 'To Mobile' },
                    { icon: 'account_balance', label: 'To Bank' },
                    { icon: 'supervised_user_circle', label: 'UPI Circle' }
                  ].map((action, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onLaunchApp}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#2f2927] border border-white/5 flex items-center justify-center text-[#f2ca50] group-hover:bg-[#f2ca50] group-hover:text-[#3c2f00] transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[22px]">{action.icon}</span>
                      </div>
                      <span className="text-[10px] text-[#d0c5af] text-center leading-tight font-medium">{action.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* UPI Lite Mini Banner */}
                <div className="rounded-xl p-3 bg-[#713035]/30 border border-[#713035]/50 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-[12px] text-[#ffdada] font-semibold">UPI Lite Active</div>
                    <div className="text-[10px] text-[#d0c5af]">Instant pin-less micro spends</div>
                  </div>
                  <span className="material-symbols-outlined text-[#f2ca50] text-[24px]">bolt</span>
                </div>
              </div>
            </motion.div>

            {/* PHONE 2: Primary Interactive Payment Flow (Center - Elevated & Highlighted) */}
            <motion.div 
              whileHover={{ y: -12, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-full max-w-[340px] rounded-[44px] p-3.5 bg-gradient-to-b from-[#2f2927] to-[#120d0c] border border-[#f2ca50]/30 shadow-[0_32px_80px_-15px_rgba(0,0,0,0.95)] lg:-translate-y-4 z-30"
            >
              <div className="w-full rounded-[36px] bg-[#241e1d] p-5 flex flex-col gap-4 border border-white/5 relative overflow-hidden">
                
                {/* Soundbox Voice Herald Overlay on Payment */}
                <AnimatePresence>
                  {soundboxPlaying && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 z-40 bg-[#171211]/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center gap-3"
                    >
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-[#f2ca50]/20 flex items-center justify-center text-[#f2ca50] animate-ping" />
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#f2ca50] to-[#d4af37] text-[#3c2f00] flex items-center justify-center absolute inset-0 shadow-lg">
                          <span className="material-symbols-outlined text-[36px]">volume_up</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#f2ca50] font-mono">Soundbox 4.0 Pro</span>
                        <h4 className="font-serif text-[22px] text-white font-bold mt-1">₹500 Received!</h4>
                        <p className="text-xs text-[#d0c5af] mt-0.5">“Paytm par paanch sau rupaye prapt hue”</p>
                      </div>
                      <button 
                        onClick={() => setSoundboxPlaying(false)}
                        className="px-4 py-1.5 rounded-full bg-[#2f2927] text-[#efe0cd] text-xs font-semibold hover:bg-[#3a3332]"
                      >
                        Dismiss
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Dynamic Island Header */}
                <div className="flex justify-between items-center text-[#d0c5af] text-[11px] font-mono">
                  <span>9:41</span>
                  <div className="w-24 h-4 rounded-full bg-[#120d0c]" />
                  <span className="material-symbols-outlined text-[16px]">battery_full</span>
                </div>

                {/* Back & Title */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="material-symbols-outlined text-[#efe0cd] text-[20px] cursor-pointer">arrow_back</span>
                  <span className="font-serif text-[20px] text-[#ebe0de] font-medium">Pay to</span>
                </div>

                {/* Recipient Pill Card */}
                <div className="p-3.5 rounded-2xl bg-[#201a19] flex items-center gap-3 border border-white/5 shadow-inner">
                  <div className="w-11 h-11 rounded-full bg-[#3a3332] text-[#efe0cd] flex items-center justify-center font-serif text-[18px] font-bold">
                    R
                  </div>
                  <div>
                    <div className="text-[14px] text-[#ebe0de] font-semibold">Rohit Sharma</div>
                    <div className="text-[12px] text-[#99907c] font-mono">+91 98765 43210</div>
                  </div>
                </div>

                {/* Amount Input Box */}
                <div className="p-4 rounded-2xl bg-[#120d0c] text-center flex flex-col items-center border border-white/5">
                  <span className="text-[11px] text-[#99907c] uppercase tracking-wider font-mono">Paying Securely</span>
                  <div className="font-serif text-[40px] text-[#ebe0de] font-bold tracking-tight my-1">
                    ₹ {paymentAmount}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2f2927] text-[#efe0cd] text-[11px] font-medium">
                    <span>Lunch</span> <span>🍔</span>
                  </div>
                </div>

                {/* Payment Options Selector */}
                <div className="space-y-2">
                  <span className="text-[10px] text-[#efe0cd] uppercase tracking-wider font-bold font-mono">UPI Payment Options</span>
                  
                  <div 
                    onClick={() => setSelectedPaymentMethod('paytm_upi')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedPaymentMethod === 'paytm_upi'
                        ? 'bg-[#201a19] border-[#f2ca50]/50 shadow-sm'
                        : 'bg-[#120d0c]/60 border-white/5 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#f2ca50] text-[20px]">account_balance_wallet</span>
                      <div>
                        <div className="text-[12px] text-[#ebe0de] font-semibold">Paytm UPI Balance</div>
                        <div className="text-[10px] text-[#99907c]">Fast • Safe • Sub-second</div>
                      </div>
                    </div>
                    {selectedPaymentMethod === 'paytm_upi' && (
                      <span className="material-symbols-outlined text-[#f2ca50] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    )}
                  </div>

                  <div 
                    onClick={() => setSelectedPaymentMethod('hdfc')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedPaymentMethod === 'hdfc'
                        ? 'bg-[#201a19] border-[#f2ca50]/50 shadow-sm'
                        : 'bg-[#120d0c]/60 border-white/5 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#d2c4b2] text-[20px]">account_balance</span>
                      <div>
                        <div className="text-[12px] text-[#ebe0de]">HDFC Bank •• 4321</div>
                        <div className="text-[10px] text-[#99907c]">Savings Account</div>
                      </div>
                    </div>
                    {selectedPaymentMethod === 'hdfc' ? (
                      <span className="material-symbols-outlined text-[#f2ca50] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-[#2f2927]" />
                    )}
                  </div>
                </div>

                {/* CTA Action */}
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePay}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#713035] to-[#571c22] text-[#efe0cd] text-[14px] font-bold shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <span>Pay ₹{paymentAmount}</span>
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                </motion.button>

                {/* Security reassurance */}
                <div className="flex items-center justify-center gap-1.5 text-[#99907c] text-[11px]">
                  <span className="material-symbols-outlined text-[14px] text-[#f2ca50]">verified_user</span>
                  <span>100% Secure NPCI 256-bit Routing</span>
                </div>
              </div>
            </motion.div>

            {/* PHONE 3: Wealth & Editorial Reserve (Right) */}
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-full max-w-[320px] rounded-[42px] p-3.5 bg-[#120d0c] border border-white/10 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.85)] relative"
            >
              <div className="w-full rounded-[34px] overflow-hidden bg-[#201a19] border border-white/5 flex flex-col min-h-[460px]">
                {/* Wealth Hero Cityscape Visual Layer */}
                <div 
                  className="bg-cover bg-center w-full h-44 relative"
                  style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDY9Vj0AZ58Qn9FMmlQRbx6JS3r4fTKS3GucyeDW2kzz52zTM1ry7eL19snxWIBqThAxeeUzgr9slY1I_1Pz_ZKGQxjInS1nmvLfU4VGPTMQwhxj-KlCGRqKWFKGN83zY38H8D3nE5jGSstNGucUvVQ3LaBfzH2bWWx8fCVe5O8xyQbebcdD5mUJwfuaZTM6VxuP9CK26hzSGhDvjBSNwN55htlg_2CyNJ3gDDpQMo7RqCm_pPj_BMt')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#201a19] via-[#201a19]/40 to-transparent" />
                  
                  {/* Floating badge pills inside graphic */}
                  <div className="absolute top-4 right-3 flex flex-col gap-1.5 items-end">
                    <span className="px-2.5 py-1 rounded-full bg-[#120d0c]/80 backdrop-blur-md text-[10px] text-[#efe0cd] flex items-center gap-1 shadow-sm border border-white/5">
                      <span className="material-symbols-outlined text-[#f2ca50] text-[12px]">trending_up</span> Invest
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#120d0c]/80 backdrop-blur-md text-[10px] text-[#efe0cd] flex items-center gap-1 shadow-sm border border-white/5">
                      <span className="material-symbols-outlined text-[#f2ca50] text-[12px]">savings</span> Save
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#120d0c]/80 backdrop-blur-md text-[10px] text-[#efe0cd] flex items-center gap-1 shadow-sm border border-white/5">
                      <span className="material-symbols-outlined text-[#f2ca50] text-[12px]">shield</span> Grow
                    </span>
                  </div>
                </div>

                {/* Wealth Editorial Pitch */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#f2ca50] uppercase tracking-widest font-mono">More than payments</span>
                    <h3 className="font-serif text-[26px] text-[#ebe0de] mt-1 leading-tight font-medium">
                      Your money.<br />Your goals.
                    </h3>
                    <p className="text-[12px] text-[#d0c5af] mt-2 leading-relaxed">
                      Invest, compound and build the sovereign future you want — seamlessly inside Paytm.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button 
                      onClick={() => document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full py-2.5 px-4 rounded-full bg-[#2f2927] hover:bg-[#3a3332] text-[#efe0cd] text-[12px] font-semibold flex items-center justify-between transition-colors border border-white/5"
                    >
                      <span>Explore Wealth Reserve</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE FEATURE SUITE SHOWCASE (Bento 4-Column Device Mosaics) */}
        {/* ========================================================================= */}
        <section className="w-full px-4 sm:px-8 lg:px-16 py-20 bg-[#120d0c]/60" id="explore">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f2ca50] font-mono">Sovereign Financial Suite</span>
                <h2 className="font-serif text-[34px] sm:text-[44px] sm:leading-[52px] text-[#ebe0de] font-light mt-1">
                  Engineered for speed. <span className="italic font-normal text-[#efe0cd]">Crafted for delight.</span>
                </h2>
              </div>
              <p className="text-[14px] text-[#d0c5af] max-w-md font-light leading-relaxed">
                Discover a high-velocity ecosystem designed to handle micro-recharges, wealth compounding, and dynamic reward claims with zero friction.
              </p>
            </div>

            {/* Bento Grid with 4 Device Screen Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Bento Card 1: Utility Hub */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="rounded-3xl p-5 bg-[#201a19] border border-white/5 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] text-[#efe0cd] uppercase font-bold font-mono">01 / Utility Hub</span>
                    <span className="material-symbols-outlined text-[#f2ca50] text-[20px]">bolt</span>
                  </div>
                  <h4 className="font-serif text-[20px] text-[#ebe0de] mb-3">Recharge &amp; Bills</h4>

                  {/* Simulated In-App Module */}
                  <div className="rounded-2xl p-3.5 bg-[#241e1d] border border-white/5 space-y-3">
                    <div className="flex rounded-xl p-1 bg-[#120d0c] gap-1">
                      {(['mobile', 'dth', 'power'] as const).map(tab => (
                        <button 
                          key={tab}
                          onClick={() => setActiveBillTab(tab)}
                          className={`flex-1 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                            activeBillTab === tab 
                              ? 'bg-[#2f2927] text-[#f2ca50] shadow-sm' 
                              : 'text-[#99907c] hover:text-[#ebe0de]'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#201a19]">
                      <span className="text-[10px] text-[#99907c] block uppercase font-mono">Mobile Number</span>
                      <span className="text-[13px] text-[#ebe0de] font-semibold font-mono">+91 98765 43210</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#2f2927]/60 flex items-center justify-between text-[#efe0cd] text-[11px]">
                      <div>
                        <span className="font-bold">₹299</span> <span className="text-[#99907c]">• 1.5 GB/day • 28 Days</span>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-[#f2ca50]">check</span>
                    </div>

                    <button 
                      onClick={() => {
                        setBillPaid(true);
                        confetti({ particleCount: 40, spread: 50 });
                        setTimeout(() => setBillPaid(false), 3000);
                      }}
                      className="w-full py-2 rounded-xl bg-[#713035] hover:bg-[#853a3f] text-[#efe0cd] text-[12px] font-semibold transition-colors"
                    >
                      {billPaid ? '✓ Bill Paid Successfully' : 'Proceed to Pay'}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-[12px] text-[#99907c]">
                  <span>Instant confirmation</span>
                  <span className="text-[#f2ca50] font-medium">Over 20,000 Billers</span>
                </div>
              </motion.div>

              {/* Bento Card 2: Rewards & Cashback */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="rounded-3xl p-5 bg-[#201a19] border border-white/5 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] text-[#efe0cd] uppercase font-bold font-mono">02 / Yield &amp; Perks</span>
                    <span className="material-symbols-outlined text-[#f2ca50] text-[20px]">redeem</span>
                  </div>
                  <h4 className="font-serif text-[20px] text-[#ebe0de] mb-3">Rewards &amp; Cashback</h4>

                  {/* Simulated In-App Module */}
                  <div className="rounded-2xl p-3.5 bg-[#241e1d] border border-white/5 space-y-3">
                    <div className="rounded-xl p-3 bg-gradient-to-r from-[#d2c4b2]/20 to-[#f2ca50]/20 flex justify-between items-center border border-[#f2ca50]/20">
                      <div>
                        <span className="text-[10px] text-[#efe0cd] uppercase font-mono font-bold">Cashback Earned</span>
                        <div className="font-serif text-[20px] text-[#f2ca50] font-bold">₹ 2,450</div>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[#f2ca50]/20 flex items-center justify-center text-[#f2ca50]">
                        <span className="material-symbols-outlined text-[20px]">card_giftcard</span>
                      </div>
                    </div>

                    {/* Reward items */}
                    <div className="space-y-1.5 pt-1">
                      <div 
                        onClick={() => {
                          setScratchcardRevealed(true);
                          confetti({ particleCount: 30, spread: 40 });
                        }}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#201a19] hover:bg-[#2f2927] text-[11px] cursor-pointer transition-colors border border-white/5"
                      >
                        <span className="text-[#ebe0de]">
                          {scratchcardRevealed ? '🎉 Unlocked Instant Reward!' : 'UPI Scan & Pay Scratchcard'}
                        </span>
                        <span className="font-bold text-[#f2ca50] font-mono">
                          {scratchcardRevealed ? '₹50 Claimed' : '+₹50'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#201a19] text-[11px]">
                        <span className="text-[#ebe0de]">Electricity Bill Cashback</span>
                        <span className="font-bold text-[#f2ca50] font-mono">+₹30</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#201a19] text-[11px]">
                        <span className="text-[#ebe0de]">Brand Voucher Bonus</span>
                        <span className="font-bold text-[#f2ca50] font-mono">+₹100</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-[12px] text-[#99907c]">
                  <span>Direct to Bank Account</span>
                  <span className="text-[#f2ca50] font-medium">Zero Expiry</span>
                </div>
              </motion.div>

              {/* Bento Card 3: Invest & Grow (Wealth) */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="rounded-3xl p-5 bg-[#201a19] border border-white/5 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] text-[#efe0cd] uppercase font-bold font-mono">03 / Wealth Engine</span>
                    <span className="material-symbols-outlined text-[#f2ca50] text-[20px]">trending_up</span>
                  </div>
                  <h4 className="font-serif text-[20px] text-[#ebe0de] mb-3">Invest &amp; Grow</h4>

                  {/* Simulated In-App Module with SVG Sparkline */}
                  <div className="rounded-2xl p-3.5 bg-[#241e1d] border border-white/5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-[#99907c] uppercase font-mono">Total Portfolio</span>
                        <div className="font-serif text-[20px] text-[#ebe0de] font-bold">₹ 12,480</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-[10px] font-bold font-mono border border-emerald-500/30">
                        + 8.4%
                      </span>
                    </div>

                    {/* Clean SVG Sparkline Chart */}
                    <div className="w-full h-14 pt-1">
                      <svg className="w-full h-full stroke-[#f2ca50] fill-none overflow-visible" viewBox="0 0 200 50">
                        <path d="M 0,42 Q 35,38 60,30 T 110,24 T 150,14 T 200,4" strokeLinecap="round" strokeWidth="2.5" />
                        <path d="M 0,42 Q 35,38 60,30 T 110,24 T 150,14 T 200,4 L 200,50 L 0,50 Z" fill="url(#sparkline-grad-2)" opacity="0.25" />
                        <defs>
                          <linearGradient id="sparkline-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f2ca50" />
                            <stop offset="100%" stopColor="transparent" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Quick Asset Hub Grid */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                      <div className="p-2 rounded-lg bg-[#201a19] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#f2ca50] text-[15px]">candlestick_chart</span>
                        <span className="text-[#efe0cd]">Mutual Funds</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#201a19] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#f2ca50] text-[15px]">diamond</span>
                        <span className="text-[#efe0cd]">24K Digital Gold</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-[12px] text-[#99907c]">
                  <span>SIP from just ₹100</span>
                  <span className="text-[#f2ca50] font-medium">SEBI Regulated</span>
                </div>
              </motion.div>

              {/* Bento Card 4: Security Core & KYC Identity */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="rounded-3xl p-5 bg-[#201a19] border border-white/5 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] text-[#efe0cd] uppercase font-bold font-mono">04 / Shield &amp; Trust</span>
                    <span className="material-symbols-outlined text-[#f2ca50] text-[20px]">verified</span>
                  </div>
                  <h4 className="font-serif text-[20px] text-[#ebe0de] mb-3">Security &amp; Passkey</h4>

                  {/* Simulated In-App Module */}
                  <div className="rounded-2xl p-3.5 bg-[#241e1d] border border-white/5 space-y-3">
                    <div className="flex items-center gap-2.5 pb-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d2c4b2] to-[#f2ca50] flex items-center justify-center font-bold text-[#3c2f00] text-[14px]">
                        JS
                      </div>
                      <div>
                        <div className="text-[14px] text-[#ebe0de] font-semibold flex items-center gap-1">
                          Jatin Singh
                          <span className="material-symbols-outlined text-[#f2ca50] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                        </div>
                        <div className="text-[10px] text-[#99907c] font-mono">KYC Full Verification Done</div>
                      </div>
                    </div>

                    {/* Shield checklist */}
                    <div className="space-y-1.5 text-[11px]">
                      <div 
                        onClick={() => setBiometricActive(!biometricActive)}
                        className="p-2 rounded-lg bg-[#201a19] flex items-center justify-between cursor-pointer hover:bg-[#2f2927] transition-colors"
                      >
                        <span className="text-[#ebe0de] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#f2ca50] text-[14px]">fingerprint</span> Biometric Lock
                        </span>
                        <span className={`font-medium ${biometricActive ? 'text-emerald-400' : 'text-[#99907c]'}`}>
                          {biometricActive ? 'Active' : 'Off'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#201a19] flex items-center justify-between">
                        <span className="text-[#ebe0de] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#f2ca50] text-[14px]">phonelink_lock</span> Device Isolation
                        </span>
                        <span className="text-emerald-400 font-medium">Shielded</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#201a19] flex items-center justify-between">
                        <span className="text-[#ebe0de] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#f2ca50] text-[14px]">shield</span> Fraud Insurance
                        </span>
                        <span className="text-[#efe0cd] font-mono">₹5,00,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-[12px] text-[#99907c]">
                  <span>RBI Licensed Entity</span>
                  <span className="text-[#f2ca50] font-medium">Zero-Liability</span>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* THE ARCHITECTURE OF TRUST (Pedestal Specs) */}
        {/* ========================================================================= */}
        <section className="w-full px-4 sm:px-8 lg:px-16 py-24 relative overflow-hidden" id="trust">
          <div className="absolute bottom-10 right-1/4 w-[500px] h-[300px] bg-[#713035]/15 rounded-full blur-[130px] pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f2ca50] font-mono">Industrial Grade Integrity</span>
              <h2 className="font-serif text-[34px] sm:text-[44px] text-[#ebe0de] font-light mt-1">
                The Architecture <span className="italic font-normal text-[#efe0cd]">of Trust.</span>
              </h2>
              <p className="text-[16px] text-[#d0c5af] mt-3 font-light">
                Behind every second, hundreds of millions in transactions pass through bespoke high-concurrency systems engineered in India for the globe.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Pedestal 1: Zero Latency Multi-Bank Direct Switch */}
              <motion.div 
                whileHover={{ y: -6 }}
                className="rounded-3xl p-8 bg-[#201a19]/80 backdrop-blur-xl border border-white/5 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#2f2927] border border-white/5 flex items-center justify-center text-[#f2ca50] mb-6">
                    <span className="material-symbols-outlined text-[28px]">speed</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#f2ca50] tracking-widest uppercase font-mono mb-1">01 / Latency Under 400ms</div>
                  <h3 className="font-serif text-[20px] text-[#ebe0de] mb-3">Multi-Bank Direct Switch</h3>
                  <p className="text-[14px] text-[#d0c5af] font-light leading-relaxed">
                    Paytm operates intelligent edge routing connected directly to 6 tier-one Indian banking sponsors, automatically rerouting around momentary bank server downtimes.
                  </p>
                </div>
                <div className="mt-8 pt-4 flex items-center gap-2 text-[#efe0cd] text-[12px] font-semibold border-t border-white/5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>99.98% Transaction Uptime</span>
                </div>
              </motion.div>

              {/* Pedestal 2: Soundbox IoT */}
              <motion.div 
                whileHover={{ y: -6 }}
                className="rounded-3xl p-8 bg-[#201a19]/80 backdrop-blur-xl border border-white/5 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#2f2927] border border-white/5 flex items-center justify-center text-[#f2ca50] mb-6">
                    <span className="material-symbols-outlined text-[28px]">volume_up</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#f2ca50] tracking-widest uppercase font-mono mb-1">02 / IoT Audio Hardware</div>
                  <h3 className="font-serif text-[20px] text-[#ebe0de] mb-3">Soundbox 4.0 Acoustic Core</h3>
                  <p className="text-[14px] text-[#d0c5af] font-light leading-relaxed">
                    The iconic audio herald of Indian commerce. Instant dual-SIM 4G voice confirmation in 11 regional languages, loud enough to cut through bustling street markets.
                  </p>
                </div>
                <div className="mt-8 pt-4 flex items-center gap-2 text-[#efe0cd] text-[12px] font-semibold border-t border-white/5">
                  <span className="w-2 h-2 rounded-full bg-[#f2ca50]" />
                  <span>10M+ Deployed Nationwide</span>
                </div>
              </motion.div>

              {/* Pedestal 3: Quantum-Ready Passkey */}
              <motion.div 
                whileHover={{ y: -6 }}
                className="rounded-3xl p-8 bg-[#201a19]/80 backdrop-blur-xl border border-white/5 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#2f2927] border border-white/5 flex items-center justify-center text-[#f2ca50] mb-6">
                    <span className="material-symbols-outlined text-[28px]">shield_with_heart</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#f2ca50] tracking-widest uppercase font-mono mb-1">03 / Bank-Grade Cryptography</div>
                  <h3 className="font-serif text-[20px] text-[#ebe0de] mb-3">Quantum-Ready Passkey</h3>
                  <p className="text-[14px] text-[#d0c5af] font-light leading-relaxed">
                    Full FIDO2 passkey hardware isolation and NPCI-compliant tokenization ensures your real card or bank details are never exposed to merchants.
                  </p>
                </div>
                <div className="mt-8 pt-4 flex items-center gap-2 text-[#efe0cd] text-[12px] font-semibold border-t border-white/5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>RBI Regulated &amp; Certified</span>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE REVENUE & SAVINGS CALCULATOR (Live Sliders & Yield Projection) */}
        {/* ========================================================================= */}
        <section className="w-full px-4 sm:px-8 lg:px-16 py-20 bg-[#120d0c]/90" id="calculator-section">
          <div className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-12 bg-[#201a19] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#f2ca50]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">
              
              {/* Controls Column */}
              <div className="w-full lg:w-1/2 space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#f2ca50] font-mono">Yield Projection Engine</span>
                  <h3 className="font-serif text-[26px] text-[#ebe0de] mt-1 font-semibold">Estimate your annual financial compounding</h3>
                  <p className="text-[13px] text-[#d0c5af] mt-2 font-light">
                    See what switching utility spends, mutual fund SIPs, and everyday merchant checkouts to Paytm delivers over a 12-month cadence.
                  </p>
                </div>

                {/* Slider 1: Monthly Spend */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#efe0cd] font-medium">Monthly Lifestyle &amp; Utility Spend</span>
                    <span className="font-serif text-[20px] text-[#f2ca50] font-bold">{formatRupee(monthlySpend)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="5000" 
                    max="150000" 
                    step="5000"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(parseInt(e.target.value))}
                    className="w-full accent-[#f2ca50] bg-[#3a3332] h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#99907c] font-mono">
                    <span>₹5,000</span>
                    <span>₹1,50,000/mo</span>
                  </div>
                </div>

                {/* Slider 2: Monthly Wealth SIP */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#efe0cd] font-medium">Monthly Wealth SIP / Gold Reserve</span>
                    <span className="font-serif text-[20px] text-[#f2ca50] font-bold">{formatRupee(monthlySip)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="50000" 
                    step="1000"
                    value={monthlySip}
                    onChange={(e) => setMonthlySip(parseInt(e.target.value))}
                    className="w-full accent-[#f2ca50] bg-[#3a3332] h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#99907c] font-mono">
                    <span>₹1,000</span>
                    <span>₹50,000/mo</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Output Box Column */}
              <div className="w-full lg:w-5/12 rounded-2xl p-6 bg-[#2f2927]/90 border border-white/5 flex flex-col justify-between shadow-inner">
                <span className="text-[11px] font-bold text-[#efe0cd] uppercase tracking-wider font-mono">Projected Annual Advantage</span>
                
                <div className="my-6">
                  <div className="font-serif text-[44px] text-[#f2ca50] font-bold tracking-tight">
                    {formatRupee(totalAnnualAdvantage)}
                  </div>
                  <div className="text-[12px] text-[#d0c5af] mt-1 font-light leading-relaxed">
                    Calculated combined cashback perks + expected 12% wealth SIP growth index
                  </div>
                </div>

                <div className="space-y-2 pt-4 text-xs border-t border-white/5">
                  <div className="flex justify-between text-[#ebe0de]">
                    <span>Merchant Scratchcards &amp; Cashback</span>
                    <span className="text-[#efe0cd] font-semibold font-mono">{formatRupee(annualCashback)}</span>
                  </div>
                  <div className="flex justify-between text-[#ebe0de]">
                    <span>Expected 1-Yr SIP Alpha (at 12%)</span>
                    <span className="text-[#f2ca50] font-semibold font-mono">{formatRupee(annualWealthGrowth)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    confetti({ particleCount: 50, spread: 60 });
                    onLaunchApp();
                  }}
                  className="mt-6 w-full py-3 rounded-full bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-[14px] font-bold transition-all shadow-md active:scale-98"
                >
                  Lock in this Yield Now →
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* NUMBERS TICKER & SOCIAL PROOF */}
        {/* ========================================================================= */}
        <section className="w-full px-4 sm:px-8 lg:px-16 py-20">
          <div className="max-w-6xl mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pb-16">
              <div className="p-6 rounded-2xl bg-[#201a19]/50 border border-white/5">
                <div className="font-serif text-[56px] text-[#f2ca50] font-bold">₹18T+</div>
                <div className="font-serif text-[20px] text-[#ebe0de] mt-1">Annual GMV Processed</div>
                <p className="text-[12px] text-[#d0c5af] mt-1">Powering the economic pulse of modern India</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#201a19]/50 border border-white/5">
                <div className="font-serif text-[56px] text-[#efe0cd] font-bold">99.98%</div>
                <div className="font-serif text-[20px] text-[#ebe0de] mt-1">UPI Core Success Rate</div>
                <p className="text-[12px] text-[#d0c5af] mt-1">Sub-second authorization switch</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#201a19]/50 border border-white/5">
                <div className="font-serif text-[56px] text-[#f2ca50] font-bold">10M+</div>
                <div className="font-serif text-[20px] text-[#ebe0de] mt-1">Soundbox Devices</div>
                <p className="text-[12px] text-[#d0c5af] mt-1">Trusted across shops, cafes &amp; enterprises</p>
              </div>
            </div>

            {/* Testimonial Frosted Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-[#201a19] border border-white/5 flex flex-col justify-between shadow-md">
                <div className="flex text-[#f2ca50] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="text-[16px] text-[#ebe0de] italic font-light leading-relaxed">
                  “Paytm is the single app on my home dock that I touch 15 times a day. From morning chai via UPI Lite to automated gold compounding, it has the luxury finish of private wealth banking.”
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#3a3332] flex items-center justify-center text-[#efe0cd] font-bold text-sm">
                    AK
                  </div>
                  <div>
                    <div className="text-[14px] text-[#ebe0de] font-semibold">Ananya Kulkarni</div>
                    <div className="text-[12px] text-[#99907c]">Founder, Studio Vertigo • Mumbai</div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#201a19] border border-white/5 flex flex-col justify-between shadow-md">
                <div className="flex text-[#f2ca50] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="text-[16px] text-[#ebe0de] italic font-light leading-relaxed">
                  “Our retail flagship processes thousands of payments daily. The Soundbox 4.0 never misses a syllable, and the unified settlement dashboard makes reconciliation effortless.”
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#3a3332] flex items-center justify-center text-[#efe0cd] font-bold text-sm">
                    RM
                  </div>
                  <div>
                    <div className="text-[14px] text-[#ebe0de] font-semibold">Raghav Malhotra</div>
                    <div className="text-[12px] text-[#99907c]">Director, Oberoi Gourmet Emporium • New Delhi</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL HIGH-CONVERSION CTA (Deep Burgundy & Gold Gradient) */}
        {/* ========================================================================= */}
        <section className="w-full px-4 sm:px-8 lg:px-16 py-20">
          <div className="max-w-6xl mx-auto rounded-[38px] p-8 sm:p-16 bg-gradient-to-br from-[#713035] via-[#241e1d] to-[#120d0c] border border-white/10 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#f2ca50]/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="space-y-4 max-w-xl text-center lg:text-left z-10">
              <span className="text-[11px] font-bold text-[#f2ca50] uppercase tracking-[0.2em] font-mono">Next-Generation Architecture</span>
              <h2 className="font-serif text-[42px] sm:text-[54px] text-[#ebe0de] font-light leading-tight">
                Step into the <br />
                <span className="italic font-normal text-[#efe0cd]">new era of money.</span>
              </h2>
              <p className="text-[16px] sm:text-[18px] text-[#d0c5af] font-light">
                Join hundreds of millions of users who experience effortless payments, elevated savings, and reliable growth every single day.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto z-10 items-center lg:items-end">
              <button 
                onClick={onLaunchApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#efe0cd] via-[#f2ca50] to-[#d4af37] text-[#3c2f00] text-[15px] font-bold shadow-[0_8px_32px_rgba(242,202,80,0.35)] hover:scale-105 transition-all text-center"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                <span>Get App (iOS &amp; Android)</span>
              </button>
              <button 
                onClick={onLaunchApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#2f2927]/90 hover:bg-[#3a3332] text-[#efe0cd] text-[14px] font-semibold transition-all text-center border border-white/5"
              >
                <span>Paytm for Business</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <span className="font-serif text-[20px] text-[#efe0cd] italic opacity-80 pt-2">
                Better Together ~
              </span>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#120d0c] text-[#d0c5af] pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            <div className="lg:col-span-2 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="font-serif text-[26px] text-[#f2ca50] font-bold">Paytm</span>
                <span className="h-2 w-2 rounded-full bg-[#f2ca50] shadow-[0_0_8px_#f2ca50]" />
              </div>
              <p className="font-serif text-[18px] text-[#ebe0de] italic">Simple / Secure / Supercharged</p>
              <p className="text-[13px] text-[#d0c5af] max-w-sm font-light leading-relaxed">
                Crafted for India's high-velocity generation. A private wealth standard engineered for intuitive everyday payments and elevated yield.
              </p>
              <div className="mt-2 font-serif text-[18px] text-[#efe0cd] italic opacity-80">Better Together ∼</div>
            </div>

            <div className="flex flex-col gap-2.5 text-[13px]">
              <span className="text-[11px] uppercase tracking-wider text-[#efe0cd] font-bold font-mono">Products</span>
              <a onClick={onLaunchApp} className="hover:text-[#ebe0de] cursor-pointer transition-colors">UPI Payments</a>
              <a onClick={onLaunchApp} className="hover:text-[#ebe0de] cursor-pointer transition-colors">Wallet Reserve</a>
              <a onClick={onLaunchApp} className="hover:text-[#ebe0de] cursor-pointer transition-colors">Postpaid Luxe</a>
              <a onClick={onLaunchApp} className="hover:text-[#ebe0de] cursor-pointer transition-colors">Wealth &amp; Invest</a>
              <a onClick={onLaunchApp} className="hover:text-[#ebe0de] cursor-pointer transition-colors">Soundbox Pro</a>
            </div>

            <div className="flex flex-col gap-2.5 text-[13px]">
              <span className="text-[11px] uppercase tracking-wider text-[#efe0cd] font-bold font-mono">Security &amp; Trust</span>
              <a className="hover:text-[#ebe0de] transition-colors">RBI Regulated</a>
              <a className="hover:text-[#ebe0de] transition-colors">NPCI Certified</a>
              <a className="hover:text-[#ebe0de] transition-colors">256-bit Encryption</a>
              <a className="hover:text-[#ebe0de] transition-colors">Zero Liability</a>
              <a className="hover:text-[#ebe0de] transition-colors">Device Isolation</a>
            </div>

            <div className="flex flex-col gap-2.5 text-[13px]">
              <span className="text-[11px] uppercase tracking-wider text-[#efe0cd] font-bold font-mono">Company</span>
              <a className="hover:text-[#ebe0de] transition-colors">About Us</a>
              <a className="hover:text-[#ebe0de] transition-colors">Leadership</a>
              <a className="hover:text-[#ebe0de] transition-colors">Investor Relations</a>
              <a className="hover:text-[#ebe0de] transition-colors">Careers</a>
              <a className="hover:text-[#ebe0de] transition-colors">Press &amp; Media</a>
            </div>

            <div className="flex flex-col gap-2.5 text-[13px]">
              <span className="text-[11px] uppercase tracking-wider text-[#efe0cd] font-bold font-mono">Resources</span>
              <a className="hover:text-[#ebe0de] transition-colors">Perks Directory</a>
              <a className="hover:text-[#ebe0de] transition-colors">Help Center</a>
              <a className="hover:text-[#ebe0de] transition-colors">Developer APIs</a>
              <a className="hover:text-[#ebe0de] transition-colors">Privacy Policy</a>
              <a className="hover:text-[#ebe0de] transition-colors">Terms of Service</a>
            </div>
          </div>

          <div className="py-6 bg-[#201a19] border border-white/5 rounded-2xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[#ebe0de] font-semibold">Jurisdiction:</span>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2f2927] text-[#ebe0de] text-[12px] border border-white/5">
                <span className="text-base">🇮🇳</span>
                <span>India (INR ₹)</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[#d0c5af]">
              <a className="hover:text-[#f2ca50] transition-colors flex items-center justify-center w-8 h-8 rounded-full bg-[#2f2927] border border-white/5">
                <span className="material-symbols-outlined text-[18px]">public</span>
              </a>
              <a className="hover:text-[#f2ca50] transition-colors flex items-center justify-center w-8 h-8 rounded-full bg-[#2f2927] border border-white/5">
                <span className="material-symbols-outlined text-[18px]">tag</span>
              </a>
              <a className="hover:text-[#f2ca50] transition-colors flex items-center justify-center w-8 h-8 rounded-full bg-[#2f2927] border border-white/5">
                <span className="material-symbols-outlined text-[18px]">send</span>
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-[#99907c]">
            <p>© 2026 One97 Communications Limited. Licensed by Reserve Bank of India. All rights reserved.</p>
            <p>UPI is a registered trademark of National Payments Corporation of India (NPCI).</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
