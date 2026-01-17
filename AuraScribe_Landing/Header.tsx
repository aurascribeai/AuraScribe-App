import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Moon, Sun } from 'lucide-react';
import { Button } from './ui/Button';
import { Logo } from './ui/Logo';
import { LOGIN_URL, SIGNUP_URL } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export const Header: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: t.nav.features, href: '#features' },
    { label: t.nav.howItWorks, href: '#how-it-works' },
    { label: t.nav.compliance, href: '#compliance' },
    { label: t.nav.blog, href: '#blog' },
    { label: t.nav.pricing, href: '#pricing' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm shadow-sm py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <a href="#" className="flex items-center gap-2 group">
              <div className="bg-teal-800 rounded-lg group-hover:bg-teal-900 transition-colors p-1">
                 <Logo className="w-8 h-8" />
              </div>
              <span className={`text-2xl font-serif font-bold tracking-tight ${isScrolled ? 'text-teal-900 dark:text-teal-100' : 'text-teal-900 dark:text-teal-100'}`}>
                AuraScribe
              </span>
            </a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a 
                key={item.label}
                href={item.href} 
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-800 dark:hover:text-teal-400 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
             <button 
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-teal-800 dark:hover:text-teal-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
             <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-800 dark:hover:text-teal-400 transition-colors mr-2"
            >
              <Globe size={16} />
              {language.toUpperCase()}
            </button>
            <Button variant="ghost" size="sm" href={LOGIN_URL} className="dark:text-slate-200 dark:hover:text-teal-400 dark:hover:bg-slate-800">
              {t.nav.login}
            </Button>
            <Button variant="primary" size="sm" href={SIGNUP_URL}>
              {t.nav.startTrial}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button 
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-teal-800 dark:hover:text-teal-400"
            >
               {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
             <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-800"
            >
              {language.toUpperCase()}
            </button>
            <button 
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-teal-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-lg p-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <a 
              key={item.label}
              href={item.href}
              className="text-base font-medium text-slate-700 dark:text-slate-200 py-2 border-b border-slate-50 dark:border-slate-800 hover:text-teal-800 dark:hover:text-teal-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-2">
            <Button variant="outline" href={LOGIN_URL} className="w-full dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
              {t.nav.login}
            </Button>
            <Button variant="primary" href={SIGNUP_URL} className="w-full">
              {t.nav.startTrial}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
