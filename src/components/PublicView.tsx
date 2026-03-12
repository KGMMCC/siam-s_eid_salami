import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Star, Heart, Copy, Send, Share2, Menu, X, Wallet, Sparkles, Gift, Landmark, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { Settings, ApprovedSubmission } from '../types';
import { Link } from 'react-router-dom';
import socket from '../lib/socket';

const Lantern = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 150" className={className} fill="currentColor">
    <path d="M50 0v20M30 20h40v10H30zM20 30h60l-10 80H30zM30 110h40v10H30zM50 120v30" />
    <circle cx="50" cy="70" r="15" fill="rgba(251, 191, 36, 0.4)" />
  </svg>
);

const SIAM_IMAGE = "https://i.ibb.co.com/xS8FF1hL/IMG-3154.jpg";

export default function PublicView() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [submissions, setSubmissions] = useState<ApprovedSubmission[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    fetch('/api/submissions/approved').then(res => res.json()).then(setSubmissions);
  };

  useEffect(() => {
    fetchData();

    // Socket listeners for real-time updates
    socket.on('submissions_updated', fetchData);
    socket.on('settings_updated', fetchData);

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      socket.off('submissions_updated');
      socket.off('settings_updated');
    };
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('নাম্বার কপি হয়েছে!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'সিয়ামের ঈদ সালামি',
        text: 'সিয়াম মাহমুদ মুক্তিকে আপনার ঈদের ভালোবাসা পাঠান!',
        url: window.location.href,
      });
    } else {
      handleCopy(window.location.href);
    }
  };

  if (!settings) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-primary text-white">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Moon size={48} className="text-gold-primary fill-gold-primary" />
      </motion.div>
      <p className="mt-4 font-islamic tracking-widest animate-pulse">ঈদ মোবারক...</p>
    </div>
  );

  return (
    <div className="min-h-screen islamic-pattern overflow-x-hidden selection:bg-gold-primary selection:text-emerald-primary bengali-text">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 flex items-center justify-between ${scrolled ? 'glass py-3' : 'bg-transparent'}`}>
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <Moon className="text-gold-primary fill-gold-primary w-6 h-6 animate-glow" />
          <span className="font-islamic font-bold text-emerald-primary text-xl tracking-tighter">সিয়ামের সালামি</span>
        </motion.div>
        
        <div className="hidden md:flex items-center gap-8 font-bold text-emerald-primary/80">
          {[
            { label: 'হোম', id: 'home' },
            { label: 'আমার কথা', id: 'about' },
            { label: 'সালামি দিন', id: 'payment' },
            { label: 'সালামি ওয়াল', id: 'wall' }
          ].map((item) => (
            <a 
              key={item.id} 
              href={`#${item.id}`} 
              className="hover:text-gold-secondary transition-all relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-primary transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-emerald-primary">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 bg-emerald-primary pt-24 px-8 flex flex-col gap-8 text-white text-3xl font-bold"
          >
            {[
              { label: 'হোম', id: 'home' },
              { label: 'আমার কথা', id: 'about' },
              { label: 'সালামি দিন', id: 'payment' },
              { label: 'সালামি ওয়াল', id: 'wall' }
            ].map((item) => (
              <a key={item.id} href={`#${item.id}`} onClick={() => setIsMenuOpen(false)} className="hover:text-gold-primary transition-colors">
                {item.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="home" className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center text-center relative overflow-hidden">
        {/* Decorative Elements */}
        <Lantern className="absolute top-10 left-10 w-16 h-24 text-gold-primary/30 animate-float" />
        <Lantern className="absolute top-40 right-10 w-12 h-20 text-gold-primary/20 animate-float [animation-delay:1s]" />
        <div className="absolute top-20 right-20 animate-float opacity-10 blur-sm">
          <Moon size={200} className="text-gold-primary fill-gold-primary" />
        </div>
        
        {/* Stars */}
        <Star className="absolute top-1/4 left-1/4 text-gold-primary/20 animate-star" size={20} />
        <Star className="absolute top-1/3 right-1/4 text-gold-primary/20 animate-star [animation-delay:1.5s]" size={30} />
        <Star className="absolute bottom-1/4 left-1/3 text-gold-primary/20 animate-star [animation-delay:0.5s]" size={15} />

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative mb-8"
        >
          <div className="w-44 h-44 rounded-full border-4 border-gold-primary p-1.5 bg-white shadow-2xl relative z-10 overflow-hidden">
            <img 
              src={SIAM_IMAGE} 
              alt="সিয়াম মাহমুদ মুক্তি" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-6 border-2 border-dashed border-gold-primary/40 rounded-full" 
          />
          <div className="absolute -bottom-2 -right-2 bg-gold-primary p-3 rounded-full shadow-xl z-20">
            <Sparkles size={24} className="text-emerald-primary fill-emerald-primary" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <h2 className="text-gold-secondary font-bold tracking-[0.2em] text-lg mb-4 uppercase">ঈদের আনন্দ সবার তরে</h2>
          <h1 className="text-5xl md:text-8xl font-black text-emerald-primary mb-6 leading-tight">
            ঈদের চাঁদ <span className="text-gradient-gold">আকাশে</span>,<br />
            সালামি দিন <span className="text-gradient-gold">বিকাশে!</span>
          </h1>
          
          <p className="max-w-2xl text-xl md:text-2xl text-emerald-secondary/80 mb-10 leading-relaxed font-medium italic">
            "সালামি হলো ছোটদের অধিকার আর বড়দের ভালোবাসা। তাই কৃপণতা না করে ঝটপট সালামি পাঠিয়ে দিন!"
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#payment" 
              className="btn-gold px-12 py-5 text-xl group"
            >
              <Gift size={24} className="group-hover:rotate-12 transition-transform" />
              সালামি দিন এখনই
            </motion.a>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare} 
              className="btn-primary px-12 py-5 text-xl group"
            >
              <Share2 size={24} className="group-hover:scale-110 transition-transform" />
              আনন্দ ছড়িয়ে দিন
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute bottom-10 text-emerald-primary/40"
        >
          <div className="w-7 h-12 border-2 border-current rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-current rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <img src="https://images.unsplash.com/photo-1519810755548-39cd217da494?q=80&w=800&h=800&auto=format&fit=crop" alt="Eid Celebration" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-8 -right-8 glass p-8 rounded-3xl hidden md:block border-2 border-gold-primary/20">
              <p className="font-bold text-emerald-primary text-xl">পবিত্র ঈদুল ফিতর ২০২৬</p>
              <p className="text-sm text-emerald-secondary/60">ভালোবাসা ও ত্যাগের মহিমা</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-emerald-primary">আমার মনের কথা</h2>
            <div className="h-2 w-24 bg-gold-primary rounded-full" />
            <p className="text-2xl text-emerald-secondary leading-relaxed font-medium italic text-justify">
              "ঈদ মানেই আনন্দ, ঈদ মানেই খুশি। আর এই খুশিতে আপনাদের ভালোবাসা আমার জন্য সবচেয়ে বড় উপহার। সালামি শুধু টাকা নয়, এটি আপনাদের স্নেহের বহিঃপ্রকাশ।"
            </p>
            <div className="pt-6">
              <p className="font-bold text-3xl text-emerald-primary">সিয়াম মাহমুদ মুক্তি</p>
              <p className="text-gold-secondary font-bold text-lg">আপনাদের প্রিয় সিয়াম</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Payment Section */}
      <section id="payment" className="py-32 px-6 bg-emerald-primary/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.04] pointer-events-none">
          <div className="absolute top-10 left-10 rotate-12"><Star size={120} /></div>
          <div className="absolute bottom-10 right-10 -rotate-12"><Star size={180} /></div>
        </div>

        <div className="max-w-4xl mx-auto text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-emerald-primary mb-8"
          >
            সালামি পাঠানোর মাধ্যম
          </motion.h2>
          <p className="text-emerald-secondary/70 text-xl max-w-2xl mx-auto font-medium">
            নিচের যেকোনো মাধ্যমে আপনার সালামি পাঠিয়ে আমাকে সারপ্রাইজ দিন!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {/* bKash */}
          <motion.div 
            whileHover={{ y: -15, scale: 1.02 }}
            className="glass p-8 md:p-12 rounded-[3rem] relative group overflow-hidden border-2 border-transparent hover:border-[#D12053]/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#D12053]/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:w-48 group-hover:h-48" />
            <div className="flex items-center justify-between mb-10">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bkash_logo.svg/1200px-Bkash_logo.svg.png" alt="bKash" className="h-10 md:h-14 object-contain" referrerPolicy="no-referrer" />
              <div className="bg-[#D12053]/10 p-3 md:p-4 rounded-2xl">
                <Wallet className="text-[#D12053]" size={28} />
              </div>
            </div>
            <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-3">পার্সোনাল নাম্বার</p>
            <div className="flex items-center justify-between bg-white border-2 border-neutral-100 p-4 md:p-6 rounded-2xl group-hover:border-[#D12053]/40 transition-all shadow-inner">
              <span className="text-2xl md:text-3xl font-bold font-mono tracking-tighter text-neutral-800">{settings.bkash_number}</span>
              <button onClick={() => handleCopy(settings.bkash_number)} className="text-[#D12053] hover:scale-125 transition-transform bg-[#D12053]/5 p-2 rounded-lg">
                <Copy size={24} />
              </button>
            </div>
          </motion.div>

          {/* Nagad */}
          <motion.div 
            whileHover={{ y: -15, scale: 1.02 }}
            className="glass p-8 md:p-12 rounded-[3rem] relative group overflow-hidden border-2 border-transparent hover:border-[#F7941D]/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#F7941D]/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:w-48 group-hover:h-48" />
            <div className="flex items-center justify-between mb-10">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nagad_Logo.svg/1200px-Nagad_Logo.svg.png" alt="Nagad" className="h-10 md:h-14 object-contain" referrerPolicy="no-referrer" />
              <div className="bg-[#F7941D]/10 p-3 md:p-4 rounded-2xl">
                <Wallet className="text-[#F7941D]" size={28} />
              </div>
            </div>
            <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-3">পার্সোনাল নাম্বার</p>
            <div className="flex items-center justify-between bg-white border-2 border-neutral-100 p-4 md:p-6 rounded-2xl group-hover:border-[#F7941D]/40 transition-all shadow-inner">
              <span className="text-2xl md:text-3xl font-bold font-mono tracking-tighter text-neutral-800">{settings.nagad_number}</span>
              <button onClick={() => handleCopy(settings.nagad_number)} className="text-[#F7941D] hover:scale-125 transition-transform bg-[#F7941D]/5 p-2 rounded-lg">
                <Copy size={24} />
              </button>
            </div>
          </motion.div>

          {/* Bank Account (Probashi) */}
          <motion.div 
            whileHover={{ y: -15, scale: 1.02 }}
            onClick={() => setShowBankDetails(true)}
            className="glass p-8 md:p-12 rounded-[3rem] relative group overflow-hidden border-2 border-transparent hover:border-emerald-primary/30 transition-all cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-primary/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:w-48 group-hover:h-48" />
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <Landmark className="text-emerald-primary" size={32} />
                <span className="font-bold text-2xl text-emerald-primary">ব্যাংক একাউন্ট</span>
              </div>
              <div className="bg-emerald-primary/10 p-3 md:p-4 rounded-2xl">
                <ExternalLink className="text-emerald-primary" size={24} />
              </div>
            </div>
            <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-3">প্রবাসী ভাইদের জন্য</p>
            <div className="bg-emerald-primary text-white p-4 md:p-6 rounded-2xl group-hover:bg-emerald-secondary transition-all shadow-lg text-center font-bold text-lg md:text-xl">
              ডিটেইলস দেখতে ক্লিক করুন
            </div>
          </motion.div>
        </div>

        <div className="flex justify-center">
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(251, 191, 36, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="btn-gold px-20 py-6 text-2xl shadow-2xl relative overflow-hidden group"
          >
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
            <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
            সালামি পাঠিয়েছি!
          </motion.button>
        </div>
      </section>

      {/* Salami Wall */}
      <section id="wall" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-bold text-emerald-primary mb-8">ভালোবাসার দেয়াল</h2>
            <p className="text-emerald-secondary/60 text-xl font-medium">যারা আমাকে ভালোবেসে সালামি পাঠিয়েছেন তাদের তালিকা।</p>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-10 space-y-10">
            {submissions.length > 0 ? (
              submissions.map((sub, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.1 }}
                  className="glass p-10 rounded-[2.5rem] relative overflow-hidden group card-hover break-inside-avoid border-2 border-gold-primary/5"
                >
                  <div className="absolute -top-8 -right-8 opacity-[0.05] group-hover:opacity-[0.12] transition-opacity">
                    <Star size={140} className="text-gold-primary fill-gold-primary" />
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h3 className="font-bold text-emerald-primary text-2xl mb-1">{sub.sender_name}</h3>
                      <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                        {new Date(sub.created_at).toLocaleDateString('bn-BD', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-gold-primary to-gold-secondary text-emerald-primary px-5 py-3 rounded-2xl text-xl font-black shadow-lg">
                      ৳{sub.amount}
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute -top-6 -left-3 text-5xl text-gold-primary/30 font-serif">"</span>
                    <p className="text-emerald-secondary/80 italic text-xl leading-relaxed relative z-10 pl-5 font-medium">
                      {sub.message || 'ঈদ মোবারক! আপনার দিনটি অনেক আনন্দে কাটুক।'}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-24 glass rounded-[4rem] border-4 border-dashed border-emerald-primary/10">
                <Gift size={80} className="mx-auto text-emerald-primary/10 mb-8 animate-bounce" />
                <p className="text-emerald-secondary/40 text-2xl font-bold">দেয়ালটি আপনার ভালোবাসার অপেক্ষায়...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-32 pb-12 px-6 bg-emerald-primary text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-40" />
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Moon className="text-gold-primary fill-gold-primary w-10 h-10" />
              <span className="font-islamic font-bold text-3xl tracking-tighter">সিয়ামের সালামি</span>
            </div>
            <p className="text-white/70 text-lg leading-relaxed font-medium">
              ঈদের আনন্দ ভাগ করে নিতে এবং প্রিয়জনদের সাথে যুক্ত থাকতে এই ডিজিটাল সালামি প্ল্যাটফর্ম।
            </p>
          </div>

          <div className="space-y-8">
            <h4 className="font-bold text-2xl text-gold-primary">দ্রুত লিংক</h4>
            <ul className="space-y-4 text-white/70 text-lg font-medium">
              {[
                { label: 'হোম', id: 'home' },
                { label: 'আমার কথা', id: 'about' },
                { label: 'সালামি দিন', id: 'payment' },
                { label: 'সালামি ওয়াল', id: 'wall' }
              ].map(item => (
                <li key={item.id}><a href={`#${item.id}`} className="hover:text-gold-primary transition-colors flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-gold-primary transition-all group-hover:w-4" />
                  {item.label}
                </a></li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="font-bold text-2xl text-gold-primary">যোগাযোগ</h4>
            <div className="flex gap-5">
              {[Share2, Heart, Star].map((Icon, i) => (
                <button key={i} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-gold-primary hover:text-emerald-primary transition-all shadow-lg">
                  <Icon size={24} />
                </button>
              ))}
            </div>
            <Link to="/admin/login" className="text-white/30 hover:text-white/60 text-sm transition-colors block mt-8 font-medium">
              অ্যাডমিন পোর্টাল লগইন
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-base text-white/50 font-medium">
          <p>&copy; ২০২৬ সিয়াম মাহমুদ মুক্তি। সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-2">ভালোবাসার সাথে তৈরি <Heart size={18} className="text-red-500 fill-red-500 animate-pulse" /></p>
        </div>
      </footer>

      {/* Submission Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-emerald-primary/95 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 100 }}
              className="relative w-full max-w-2xl glass p-12 rounded-[4rem] shadow-2xl overflow-hidden border-4 border-gold-primary/10"
            >
              <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-gold-secondary via-gold-primary to-gold-secondary" />
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-8 right-8 text-emerald-primary/40 hover:text-emerald-primary hover:scale-125 transition-all"
              >
                <X size={32} />
              </button>
              
              <div className="mb-10">
                <h3 className="text-4xl font-bold text-emerald-primary mb-3">সালামি সাবমিট করুন</h3>
                <p className="text-emerald-secondary/70 text-lg">আপনার ট্রানজেকশন ডিটেইলস দিয়ে নিচের ফর্মটি পূরণ করুন।</p>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                
                try {
                  const res = await fetch('/api/submissions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  });
                  
                  if (res.ok) {
                    confetti({
                      particleCount: 250,
                      spread: 100,
                      origin: { y: 0.7 },
                      colors: ['#064e3b', '#fbbf24', '#ffffff', '#D12053', '#F7941D']
                    });
                    toast.success('সালামি পাঠানো হয়েছে! অনুমোদনের জন্য অপেক্ষা করুন।', {
                      duration: 6000,
                      icon: '🌙',
                      style: {
                        borderRadius: '20px',
                        background: '#064e3b',
                        color: '#fff',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }
                    });
                    setShowForm(false);
                  } else {
                    const err = await res.json();
                    toast.error(err.error || 'সাবমিট করতে সমস্যা হয়েছে।');
                  }
                } catch (err) {
                  toast.error('কিছু একটা ভুল হয়েছে।');
                } finally {
                  setLoading(false);
                }
              }} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-emerald-primary uppercase tracking-widest">আপনার নাম</label>
                    <input required name="senderName" type="text" className="w-full px-6 py-5 rounded-2xl border-2 border-emerald-primary/10 focus:ring-4 focus:ring-gold-primary/30 outline-none bg-white/60 transition-all text-lg font-bold" placeholder="উদা: আবির খান" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-emerald-primary uppercase tracking-widest">টাকার পরিমাণ (৳)</label>
                    <input required name="amount" type="number" className="w-full px-6 py-5 rounded-2xl border-2 border-emerald-primary/10 focus:ring-4 focus:ring-gold-primary/30 outline-none bg-white/60 transition-all text-lg font-bold" placeholder="৫০০" />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-emerald-primary uppercase tracking-widest">মাধ্যম</label>
                    <select required name="paymentMethod" className="w-full px-6 py-5 rounded-2xl border-2 border-emerald-primary/10 focus:ring-4 focus:ring-gold-primary/30 outline-none bg-white/60 transition-all appearance-none text-lg font-bold">
                      <option value="bkash">বিকাশ (bKash)</option>
                      <option value="nagad">নগদ (Nagad)</option>
                      <option value="bank">ব্যাংক (Bank)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-emerald-primary uppercase tracking-widest">ট্রানজেকশন আইডি</label>
                    <input required name="transactionId" type="text" className="w-full px-6 py-5 rounded-2xl border-2 border-emerald-primary/10 focus:ring-4 focus:ring-gold-primary/30 outline-none bg-white/60 transition-all font-mono text-lg font-bold" placeholder="TRX12345678" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-black text-emerald-primary uppercase tracking-widest">ছোট বার্তা</label>
                  <textarea name="message" rows={3} className="w-full px-6 py-5 rounded-2xl border-2 border-emerald-primary/10 focus:ring-4 focus:ring-gold-primary/30 outline-none bg-white/60 transition-all resize-none text-lg font-medium" placeholder="ঈদ মোবারক! সালামিটা এনজয় করো।"></textarea>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(251, 191, 36, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  type="submit" 
                  className="w-full btn-gold py-6 text-2xl shadow-2xl mt-6 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Moon size={28} />
                    </motion.div>
                  ) : (
                    <>
                      <Send size={28} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                      কনফার্ম করুন
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bank Details Modal */}
      <AnimatePresence>
        {showBankDetails && settings && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBankDetails(false)}
              className="absolute inset-0 bg-emerald-primary/95 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 100 }}
              className="relative w-full max-w-xl glass p-8 md:p-12 rounded-[3rem] shadow-2xl overflow-hidden border-4 border-gold-primary/10"
            >
              <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-emerald-primary via-emerald-secondary to-emerald-primary" />
              <button 
                onClick={() => setShowBankDetails(false)}
                className="absolute top-6 right-6 text-emerald-primary/40 hover:text-emerald-primary hover:scale-125 transition-all"
              >
                <X size={28} />
              </button>
              
              <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-emerald-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Landmark size={40} className="text-emerald-primary" />
                </div>
                <h3 className="text-3xl font-bold text-emerald-primary mb-2">ব্যাংক একাউন্ট ডিটেইলস</h3>
                <p className="text-emerald-secondary/60">প্রবাসী ভাইদের জন্য বিশেষ ব্যবস্থা</p>
              </div>
              
              <div className="space-y-6">
                <DetailItem label="ব্যাংকের নাম" value={settings.bank_name} />
                <DetailItem label="একাউন্ট হোল্ডার" value={settings.account_name} />
                <DetailItem label="একাউন্ট নাম্বার" value={settings.account_number} isCopyable onCopy={() => handleCopy(settings.account_number)} />
                <DetailItem label="রাউটিং নাম্বার" value={settings.routing_number} isCopyable onCopy={() => handleCopy(settings.routing_number)} />
                <DetailItem label="ব্রাঞ্চের নাম" value={settings.branch_name} />
                <DetailItem label="সুইফট কোড" value={settings.swift_code} isCopyable onCopy={() => handleCopy(settings.swift_code)} />
              </div>

              <div className="mt-10 p-6 bg-gold-primary/10 rounded-2xl border border-gold-primary/20">
                <p className="text-emerald-primary text-sm font-medium leading-relaxed text-center">
                  "আপনার পাঠানো প্রতিটি টাকা আমার কাছে অনেক মূল্যবান। প্রবাসে থেকেও আমার কথা মনে রাখার জন্য অসংখ্য ধন্যবাদ!"
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value, isCopyable, onCopy }: { label: string, value: string, isCopyable?: boolean, onCopy?: () => void }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center justify-between bg-white border border-neutral-100 p-4 rounded-xl shadow-sm">
        <span className="text-lg font-bold text-neutral-800">{value}</span>
        {isCopyable && (
          <button onClick={onCopy} className="text-emerald-primary hover:scale-110 transition-transform p-1.5 bg-emerald-primary/5 rounded-lg">
            <Copy size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
