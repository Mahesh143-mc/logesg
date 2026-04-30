import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Sprout, Phone, MapPin, Mail, Instagram, Facebook, Twitter, LogIn, Menu, X, ChevronRight, Home as HomeIcon, Info, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { CustomerHome } from '../../pages/customer/CustomerHome';
import { CustomerShop } from '../../pages/customer/CustomerShop';
import { CustomerContact } from '../../pages/customer/CustomerContact';
import { CustomerAbout } from '../../pages/customer/CustomerAbout';
import { cn } from '../../lib/utils';

export function CustomerLayout() {
  const { cart, setCartOpen, isCartOpen, currentCustomerPage, setCurrentCustomerPage } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'முகப்பு', icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'shop', label: 'கடை', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'about', label: 'எங்களைப் பற்றி', icon: <Info className="w-5 h-5" /> },
    { id: 'contact', label: 'தொடர்புக்கு', icon: <Phone className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (currentCustomerPage) {
      case 'home': return <CustomerHome />;
      case 'shop': return <CustomerShop />;
      case 'about': return <CustomerAbout />;
      case 'contact': return <CustomerContact />;
      default: return <CustomerHome />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Navigation */}
      <nav 
        className={cn(
          "fixed top-0 inset-x-0 z-[100] transition-all duration-500",
          scrolled 
            ? "py-3 bg-slate-900/95 backdrop-blur-2xl border-b border-white/5 shadow-2xl" 
            : "py-4 bg-slate-900/80 backdrop-blur-lg"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setCurrentCustomerPage('home')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-600/30 group-hover:scale-110 transition-transform duration-500">
                <Sprout className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tighter leading-none">லோகேஷ்</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-1">விவசாயி</span>
              </div>
            </motion.div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center bg-white/5 backdrop-blur-md p-1.5 rounded-[2rem] border border-white/10">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setCurrentCustomerPage(link.id as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={cn(
                    "px-8 py-2.5 rounded-[1.5rem] text-sm font-black transition-all duration-300 flex items-center space-x-2 relative",
                    currentCustomerPage === link.id
                      ? "bg-white text-slate-900 shadow-xl shadow-black/20"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {currentCustomerPage === link.id && (
                    <motion.span layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                  <span>{link.label}</span>
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCartOpen(true)}
                className="relative w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-sm group"
              >
                <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                    {cartItemCount}
                  </span>
                )}
              </motion.button>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-600/20"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[80] lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-x-0 top-0 pt-32 pb-12 bg-slate-900/95 backdrop-blur-2xl z-[90] border-b border-white/5 lg:hidden shadow-2xl"
            >
              <div className="px-4 space-y-4">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      setCurrentCustomerPage(link.id as any);
                      setIsMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={cn(
                      "w-full p-6 rounded-3xl text-left flex items-center justify-between transition-all group",
                      currentCustomerPage === link.id
                        ? "bg-emerald-600 text-white shadow-2xl shadow-emerald-600/30"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        currentCustomerPage === link.id ? "bg-white/20" : "bg-white/10 shadow-sm"
                      )}>
                        {React.cloneElement(link.icon as React.ReactElement, { 
                          className: cn("w-6 h-6", currentCustomerPage === link.id ? "text-white" : "text-emerald-400") 
                        })}
                      </div>
                      <span className="text-xl font-black">{link.label}</span>
                    </div>
                    <ChevronRight className={cn(
                      "w-6 h-6 transition-transform group-hover:translate-x-1",
                      currentCustomerPage === link.id ? "text-white/50" : "text-slate-600"
                    )} />
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCustomerPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-white pt-32 pb-12 overflow-hidden relative">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 mb-24">
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
                  <Sprout className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter leading-none">லோகேஷ் விவசாயி</span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">இயற்கை பண்ணை</span>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed font-medium">
                நாங்கள் தரமான மற்றும் இயற்கையான விவசாயத் தயாரிப்புகளை நேரடியாக உங்கள் வீட்டிற்கு கொண்டு வருகிறோம்.
              </p>
              <div className="flex space-x-4">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-600 transition-all text-slate-400 hover:text-white">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-8">விரைவான இணைப்புகள்</h4>
              <ul className="space-y-4">
                {navLinks.map(link => (
                  <li key={link.id}>
                    <button 
                      onClick={() => {
                        setCurrentCustomerPage(link.id as any);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-slate-400 hover:text-white transition-colors flex items-center space-x-2 group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 scale-0 group-hover:scale-100 transition-transform" />
                      <span className="font-bold">{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-8">தொடர்புக்கு</h4>
              <ul className="space-y-6">
                <li className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-500 flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">அழைக்கவும்</div>
                    <div className="font-bold text-slate-200 mt-1">+91 98765 43210</div>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-500 flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">மின்னஞ்சல்</div>
                    <div className="font-bold text-slate-200 mt-1">support@vivasayi.com</div>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-8">நிர்வாகி பகுதி</h4>
              <p className="text-slate-400 text-sm mb-6 font-medium">பொருட்களை நிர்வகிக்க உள்நுழையவும்.</p>
              <Link
                to="/logesh-vivasayi/login"
                className="inline-flex items-center space-x-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-sm hover:bg-white/10 transition-all group"
              >
                <LogIn className="w-5 h-5 text-emerald-500" />
                <span>உள்நுழை</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-xs font-medium text-slate-500">
            <p>© {new Date().getFullYear()} லோகேஷ் விவசாயி. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
            <div className="flex space-x-8">
              <a href="#" className="hover:text-emerald-500 transition-colors">தனியுரிமைக் கொள்கை</a>
              <a href="#" className="hover:text-emerald-500 transition-colors">சேவை விதிமுறைகள்</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
