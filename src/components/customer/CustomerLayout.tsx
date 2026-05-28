import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ShoppingBag, Sprout, Phone, MapPin, Mail, Instagram, Facebook, Twitter, LogIn, Menu, X, ChevronRight, Home as HomeIcon, Info, Search, Globe, Star, ArrowUp } from 'lucide-react';
import { m, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';


const CustomerHome = React.lazy(() => import('../../pages/customer/CustomerHome').then(m => ({ default: m.CustomerHome })));
const CustomerShop = React.lazy(() => import('../../pages/customer/CustomerShop').then(m => ({ default: m.CustomerShop })));
const CustomerContact = React.lazy(() => import('../../pages/customer/CustomerContact').then(m => ({ default: m.CustomerContact })));
const CustomerAbout = React.lazy(() => import('../../pages/customer/CustomerAbout').then(m => ({ default: m.CustomerAbout })));
const CustomerReviews = React.lazy(() => import('../../pages/customer/CustomerReviews').then(m => ({ default: m.CustomerReviews })));
import { cn } from '../../lib/utils';
import { useTranslation } from '../../utils/translations';



export function CustomerLayout() {
  const { cart, setCartOpen, isCartOpen, currentCustomerPage, setCurrentCustomerPage, language, setLanguage, urlMode } = useStore();
  const t = useTranslation(language);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { pageId } = useParams();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleNavClick = (id: string) => {
    if (urlMode === 'static') {
      navigate(`/logesh-vivasayi/${id}`);
    } else {
      setCurrentCustomerPage(id as any);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync state from URL if mode is static
  useEffect(() => {
    if (urlMode === 'static') {
      const validCustomerPages = ['home', 'shop', 'about', 'contact', 'reviews'];
      const targetPage = (pageId && validCustomerPages.includes(pageId)) ? pageId : 'home';

      if (targetPage !== currentCustomerPage) {
        setCurrentCustomerPage(targetPage as any);
      }

      // If at base customer path, redirect to home
      if (location.pathname === '/logesh-vivasayi' || location.pathname === '/logesh-vivasayi/') {
        navigate('/logesh-vivasayi/home', { replace: true });
      }
    } else {
      // Standard mode: Ensure URL is at base root path
      if (location.pathname !== '/' && location.pathname !== '/login') {
        navigate('/', { replace: true });
      }
    }
  }, [pageId, urlMode, setCurrentCustomerPage, currentCustomerPage, location.pathname, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentCustomerPage]);

  const navLinks = [
    { id: 'home', label: t('home'), icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'shop', label: t('shop'), icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'reviews', label: t('reviews'), icon: <Star className="w-5 h-5" /> },
    { id: 'about', label: t('about'), icon: <Info className="w-5 h-5" /> },
    { id: 'contact', label: t('contact'), icon: <Phone className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    let PageComponent;
    switch (currentCustomerPage) {
      case 'home': PageComponent = <CustomerHome />; break;
      case 'shop': PageComponent = <CustomerShop />; break;
      case 'reviews': PageComponent = <CustomerReviews />; break;
      case 'about': PageComponent = <CustomerAbout />; break;
      case 'contact': PageComponent = <CustomerContact />; break;
      default: PageComponent = <CustomerHome />; break;
    }

    return (
      <React.Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        </div>
      }>
        {PageComponent}
      </React.Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-zinc-200 transition-colors duration-500">
      {/* Premium Floating SaaS Glassmorphic Navigation */}
      <div
        className={cn(
          "fixed top-0 inset-x-0 z-[100] transition-all duration-500 flex justify-center",
          scrolled ? "pt-2 md:pt-4" : "pt-4 md:pt-6"
        )}
      >
        <nav
          style={{
            backgroundColor: (scrolled || currentCustomerPage !== 'home') ? "rgba(6, 78, 59, 0.95)" : "rgba(16, 185, 129, 0.18)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: (scrolled || currentCustomerPage !== 'home') ? "rgba(16, 185, 129, 0.35)" : "rgba(16, 185, 129, 0.18)"
          }}
          className={cn(
            "w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-7xl rounded-full transition-all duration-500 ease-out border shadow-2xl flex items-center justify-between py-3 px-6 md:px-8",
            (scrolled || currentCustomerPage !== 'home')
              ? "shadow-[0_12px_40px_-12px_rgba(16,185,129,0.25)]"
              : "shadow-[0_8px_32px_rgba(16,185,129,0.06)]"
          )}
        >
          {/* Left Side: Logo & Pulsing Online Indicator */}
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 overflow-hidden p-0.5">
              <img src="https://res.cloudinary.com/dyaufjpai/image/upload/q_auto/f_auto/v1779255158/Logo_final_-_2_unomy8.png" alt="Logesh Vivasayi Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-start">
              <div className="flex flex-col text-left">
                <span className="text-base md:text-lg font-black text-white tracking-tight leading-none">
                  {t('logesh')}
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1.5 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </span>
                <span className="text-[8px] md:text-[9px] font-bold text-emerald-300/80 uppercase tracking-[0.25em] mt-0.5">{t('farmer')}</span>
              </div>
            </div>
          </m.div>

          {/* Center: Premium Floating Pill Navigation Menu */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-emerald-950/20 backdrop-blur-md p-1 rounded-full border border-emerald-500/20 shadow-inner">
            {navLinks.map((link) => {
              const isActive = currentCustomerPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 relative group flex items-center space-x-2 select-none",
                    isActive ? "text-white" : "text-emerald-100/80 hover:text-white"
                  )}
                >
                  {/* Dynamic background slider using Framer Motion */}
                  {isActive && (
                    <m.div
                      layoutId="activeNavHighlight"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-lime-500 rounded-full shadow-[0_4px_14px_rgba(16,185,129,0.35)] -z-10"
                    />
                  )}

                  {/* Small Active Dot Indicator */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Side: Actions & Profile Glass Icons */}
          <div className="flex items-center space-x-2 md:space-x-3">

            {/* Cart Button */}
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCartOpen(true)}
              aria-label={`Open shopping cart (${cartItemCount} items)`}
              className="relative w-9 h-9 md:w-10 md:h-10 bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-400/40 rounded-full flex items-center justify-center text-emerald-100 hover:text-white hover:bg-emerald-500/10 transition-all shadow-lg hover:shadow-[0_0_12px_rgba(16,185,129,0.35)] group cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 md:w-[18px] md:h-[18px] bg-emerald-500 text-white text-[8px] md:text-[9px] font-black rounded-full flex items-center justify-center border border-emerald-900 shadow-md shadow-emerald-500/30">
                  {cartItemCount}
                </span>
              )}
            </m.button>

            {/* Language Switcher */}
            <div className="relative">
              <m.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Change language"
                className="w-9 h-9 md:w-10 md:h-10 bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-400/40 rounded-full flex items-center justify-center text-emerald-100 hover:text-white hover:bg-emerald-500/10 transition-all shadow-lg hover:shadow-[0_0_12px_rgba(16,185,129,0.35)] cursor-pointer"
              >
                <Globe className="w-4 h-4" />
              </m.button>

              <AnimatePresence>
                {isLangOpen && (
                  <m.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-32 bg-emerald-950/95 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl shadow-2xl overflow-hidden py-1 z-[110]"
                  >
                    {[
                      { code: 'ta', label: 'தமிழ்' },
                      { code: 'en', label: 'English' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setIsLangOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2.5 text-left text-xs font-black transition-colors uppercase tracking-wider",
                          language === lang.code
                            ? "bg-emerald-600 text-white"
                            : "text-emerald-300 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Admin Portal Shortcut */}
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              aria-label="Admin Portal"
              className="hidden sm:flex w-9 h-9 md:w-10 md:h-10 bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-400/40 rounded-full items-center justify-center text-emerald-100 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all shadow-lg hover:shadow-[0_0_12px_rgba(16,185,129,0.35)] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
            </m.button>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="lg:hidden w-9 h-9 md:w-10 md:h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/20 active:scale-90 transition-transform cursor-pointer"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>
        </nav>
      </div>

      {/* Mobile Glassmorphic Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop blur overlay */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[80] lg:hidden"
            />
            {/* Slide Down Glass Menu Drawer */}
            <m.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ backgroundColor: "rgba(6, 78, 59, 0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
              className="fixed inset-x-0 top-0 pt-24 pb-8 border-b border-emerald-500/20 lg:hidden shadow-2xl flex flex-col justify-end z-[90]"
            >
              <div className="px-6 space-y-3.5">
                {navLinks.map((link) => {
                  const isActive = currentCustomerPage === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        handleNavClick(link.id);
                        setIsMenuOpen(false);
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl text-left flex items-center justify-between transition-all group relative overflow-hidden",
                        isActive
                          ? "bg-gradient-to-r from-emerald-600 to-lime-500 text-white shadow-xl shadow-emerald-600/35 border border-emerald-400/30"
                          : "bg-emerald-950/40 text-emerald-100 hover:bg-emerald-900/40 border border-emerald-500/10"
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shadow-inner",
                          isActive ? "bg-white/20" : "bg-emerald-950/50 border border-emerald-500/20"
                        )}>
                          {React.cloneElement(link.icon as React.ReactElement, {
                            className: cn("w-4.5 h-4.5", isActive ? "text-white" : "text-emerald-400")
                          })}
                        </div>
                        <span className="text-base font-black uppercase tracking-wider">{link.label}</span>
                      </div>
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-transform group-hover:translate-x-1",
                        isActive ? "text-white/60" : "text-emerald-500/60"
                      )} />
                    </button>
                  );
                })}
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="pt-0">
        <AnimatePresence mode="wait">
          <m.div
            key={currentCustomerPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
          >
            {renderContent()}
          </m.div>
        </AnimatePresence>
      </main>

      {/* Professional Footer with green relevant premium design */}
      <footer className="bg-gradient-to-b from-emerald-900 via-emerald-950 to-zinc-950 text-white pt-24 pb-12 overflow-hidden relative">

        {/* Top glowing gradient border line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

        {/* Abstract Background with glowing glassmorphism gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-emerald-500/25 rounded-full blur-[140px] -translate-y-1/3 translate-x-1/3 animate-float-slow" />
          <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] bg-lime-500/15 rounded-full blur-[120px] translate-y-1/3 animate-float-fast" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            <div className="space-y-6 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform duration-300 overflow-hidden p-0.5 border border-slate-100">
                  <img src="https://res.cloudinary.com/dyaufjpai/image/upload/q_auto/f_auto/v1779255158/Logo_final_-_2_unomy8.png" alt="Logesh Vivasayi Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter leading-none">{t('logesh_farmer')}</span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-1">{t('natural_farm')}</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                {t('footer_desc')}
              </p>
              <div className="flex space-x-3 pt-2">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label="Social link"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-500/35 hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all text-slate-300 hover:text-white hover:scale-115 active:scale-95"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="text-left">
              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6">{t('quick_links')}</h4>
              <ul className="space-y-3">
                {navLinks.map(link => (
                  <li key={link.id}>
                    <button
                      onClick={() => handleNavClick(link.id)}
                      className="text-slate-300 hover:text-white text-sm transition-colors flex items-center space-x-2 group font-semibold"
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full bg-emerald-500 transition-all duration-300",
                        currentCustomerPage === link.id ? "scale-100 opacity-100" : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                      )} />
                      <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-left">
              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6">{t('contact')}</h4>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-all flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{t('call_us')}</div>
                    <div className="font-bold text-sm text-slate-200 mt-1.5 group-hover:text-white transition-colors">+91 87546 21690</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-all flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{t('email_us')}</div>
                    <div className="font-bold text-sm text-slate-200 mt-1.5 group-hover:text-white transition-colors">logeshvivasayi@gmail.com</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="text-left">
              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6">{t('admin_area')}</h4>
              <p className="text-slate-300 text-xs mb-4 font-medium">{t('login_to_manage')}</p>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2.5 px-6 py-4 bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-500 text-white rounded-2xl font-black text-xs hover:shadow-lg hover:shadow-emerald-500/25 transition-all group uppercase tracking-widest duration-300 active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" />
                <span>{t('login')}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-[11px] font-semibold text-slate-400">
            <p>© {new Date().getFullYear()} {t('logesh_farmer')}. {t('rights_reserved')}</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-emerald-400 transition-colors">{t('privacy_policy')}</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">{t('terms_of_service')}</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <m.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 left-6 md:bottom-10 md:left-10 z-[100] bg-emerald-600 text-white w-12 h-12 rounded-full shadow-2xl border border-white/20 flex items-center justify-center hover:bg-emerald-700 transition-colors cursor-pointer"
            aria-label="Scroll to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </m.button>
        )}
      </AnimatePresence>
    </div>
  );
}
