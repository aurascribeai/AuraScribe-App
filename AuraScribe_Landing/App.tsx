
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Compliance } from './components/Compliance';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { Demo } from './components/Demo';
import { VideoSection } from './components/VideoSection';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { Integrations } from './components/Integrations';
import { Contact } from './components/Contact';
import { Background3D } from './components/Background3D';
import { CoreTech } from './components/CoreTech';
import { CookieConsent } from './components/CookieConsent';
const Blog = React.lazy(() => import('./components/Blog'));
const LegalDocs = React.lazy(() => import('./components/LegalDocs'));
const TrustCenter = React.lazy(() => import('./components/TrustCenter'));
const BlogPost = React.lazy(() => import('./components/BlogPost'));
const NotFound = React.lazy(() => import('./components/NotFound'));
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

const AppContent: React.FC = () => {
  const { t, language } = useLanguage();
  const [route, setRoute] = useState<string>('');

  // 1. Sync HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // 2. Handle Hash Changes
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '');
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 3. Define Valid Routes for 404 Logic
  const validSections = [
    'features', 'how-it-works', 'compliance', 'pricing', 'faq',
    'blog', 'contact', 'demo', 'testimonials', 'integrations', 'video'
  ];

  const isLegalPage = ['#privacy', '#terms', '#cookies', '#sale', '#disclaimer'].includes(route);
  const isTrustCenter = route === '#trust';
  const isBlogPost = route.startsWith('#blog/');

  const cleanHash = route.replace('#', '');
  const isValidSection = !route || validSections.includes(cleanHash);
  const isValidRoute = isValidSection || isLegalPage || isTrustCenter || isBlogPost;

  // 4. Handle Title Updates & Scrolling
  useEffect(() => {
    let title = "AuraScribe | AI Medical Scribe for Canada";

    if (route === '#pricing') title = `${t.nav.pricing} | AuraScribe`;
    if (route === '#features') title = `${t.nav.features} | AuraScribe`;
    if (route === '#contact') title = `${t.nav.contact} | AuraScribe`;
    if (route === '#compliance') title = `${t.nav.compliance} | AuraScribe`;
    if (route === '#privacy') title = `${t.legal.privacy.title} | AuraScribe`;
    if (route === '#terms') title = `${t.legal.terms.title} | AuraScribe`;
    if (route === '#cookies') title = `${t.legal.cookies.title} | AuraScribe`;
    if (route === '#sale') title = `${t.legal.sale.title} | AuraScribe`;
    if (route === '#disclaimer') title = `${t.legal.disclaimer.title} | AuraScribe`;
    if (route === '#trust') title = `${t.trustCenter.title} | AuraScribe`;

    if (isBlogPost) {
      const slug = route.replace('#blog/', '');
      const post = t.blog.posts.find(p => p.slug === slug);
      if (post) title = `${post.title} | AuraScribe Insights`;
      else title = "Article Not Found | AuraScribe";
    }

    if (!isValidRoute) {
      title = "Page Not Found | AuraScribe";
    }

    document.title = title;

    if (!isValidRoute) {
      window.scrollTo(0, 0);
      return;
    }

    if (isLegalPage || isBlogPost || isTrustCenter) {
      window.scrollTo(0, 0);
      return;
    }

    if (route && isValidSection) {
      const timer = setTimeout(() => {
        try {
          const element = document.getElementById(cleanHash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (e) {
          console.error("Scroll error:", e);
        }
      }, 100);
      return () => clearTimeout(timer);
    } else if (!route) {
      window.scrollTo(0, 0);
    }
  }, [route, t, language, isValidRoute, cleanHash, isBlogPost, isLegalPage, isTrustCenter, isValidSection]);

  const getLegalType = () => {
    if (route === '#privacy') return 'privacy';
    if (route === '#terms') return 'terms';
    if (route === '#cookies') return 'cookies';
    if (route === '#sale') return 'sale';
    if (route === '#disclaimer') return 'disclaimer';
    return 'privacy';
  };

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden font-sans bg-slate-950 text-slate-50 selection:bg-neon-400 selection:text-slate-950">
      {/* Skip to Content Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only absolute top-2 left-2 z-[100] bg-neon-400 text-slate-950 px-4 py-2 rounded shadow font-bold transition-all"
        tabIndex={0}
      >
        Skip to main content
      </a>
      <Background3D />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main id="main-content" className="flex-grow">
          <React.Suspense fallback={<div className="w-full flex justify-center items-center py-16 text-lg text-slate-400">Loading...</div>}>
            {isValidRoute ? (
              <>
                {isLegalPage && <LegalDocs type={getLegalType() as any} />}
                {route === '#trust' && <TrustCenter />}
                {isBlogPost && <BlogPost />}
                {!isLegalPage && !isBlogPost && !isTrustCenter && (
                  <>
                    <Hero />
                    <VideoSection />
                    <Demo />
                    <CoreTech />
                    <Features />
                    <HowItWorks />
                    <Testimonials />
                    <Compliance />
                    <Integrations />
                    <Pricing />
                    <FAQ />
                    <Blog />
                    <Contact />
                  </>
                )}
              </>
            ) : (
              <NotFound />
            )}
          </React.Suspense>
        </main>
        <Footer />
        <CookieConsent />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
