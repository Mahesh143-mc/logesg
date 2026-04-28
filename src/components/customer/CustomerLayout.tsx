import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShoppingCart, Leaf, Phone, MapPin, Mail, Instagram, Facebook, Twitter, LogIn, Menu, X as CloseIcon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { CustomerHome } from '../../pages/customer/CustomerHome';
import { CustomerShop } from '../../pages/customer/CustomerShop';
import { CustomerContact } from '../../pages/customer/CustomerContact';

export function CustomerLayout() {
  const { cart, setCartOpen, currentCustomerPage, setCurrentCustomerPage } = useStore();
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
    { name: 'Overview', id: 'home' },
    { name: 'Products', id: 'product' },
    { name: 'Contact', id: 'contact' },
  ];

  const renderContent = () => {
    switch (currentCustomerPage) {
      case 'home': return <CustomerHome />;
      case 'product': return <CustomerShop initialCategory="All" />;
      case 'contact': return <CustomerContact />;
      default: return <CustomerHome />;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50 selection:bg-indigo-500/30">
      {/* Header */}
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm' 
            : 'bg-white/0 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <button 
              onClick={() => {
                setCurrentCustomerPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform duration-300 shadow-sm">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">Vivasayi</span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    setCurrentCustomerPage(link.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    currentCustomerPage === link.id 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                to="/logesh-vivasayi/login"
                className="hidden md:flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <span>Login</span>
              </Link>
              
              <button 
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 rounded-full transition-all group"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm ring-2 ring-white"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <button 
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[300px] bg-white z-[70] shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 tracking-tight">Vivasayi</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-6 space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => {
                      setCurrentCustomerPage(link.id);
                      setIsMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center justify-between w-full py-4 px-6 rounded-2xl text-sm font-semibold transition-all ${
                      currentCustomerPage === link.id 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{link.name}</span>
                    {currentCustomerPage === link.id && <ArrowRight className="w-4 h-4" />}
                  </button>
                ))}
              </nav>

              <div className="p-6 border-t border-slate-100">
                <Link
                  to="/logesh-vivasayi/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-semibold transition-transform active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Admin Login</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content (Spacer for fixed header) */}
      <main className="pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCustomerPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/60 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            <div className="md:col-span-4 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">Logesh Vivasayi</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-sm">
                Premium agricultural products delivered directly from our farms. Modern tech meeting traditional quality.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-slate-400">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-slate-400">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-slate-400">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-slate-900 font-bold mb-6 text-sm">Platform</h4>
              <ul className="space-y-4 text-sm">
                <li><button onClick={() => { setCurrentCustomerPage('home'); window.scrollTo(0,0); }} className="text-slate-500 hover:text-indigo-600 transition-colors font-medium">Overview</button></li>
                <li><button onClick={() => { setCurrentCustomerPage('product'); window.scrollTo(0,0); }} className="text-slate-500 hover:text-indigo-600 transition-colors font-medium">Products</button></li>
                <li><button onClick={() => { setCurrentCustomerPage('contact'); window.scrollTo(0,0); }} className="text-slate-500 hover:text-indigo-600 transition-colors font-medium">Contact Sales</button></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-slate-900 font-bold mb-6 text-sm">Contact</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>support@vivasayi.com</span>
                </li>
                <li className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Coimbatore, Tamil Nadu</span>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-slate-900 font-bold mb-6 text-sm">Admin</h4>
              <Link
                to="/logesh-vivasayi/login"
                className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors group"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
                <motion.span
                  className="opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-200/60 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-medium text-slate-400 space-y-4 md:space-y-0">
            <p>© {new Date().getFullYear()} Logesh Vivasayi. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
