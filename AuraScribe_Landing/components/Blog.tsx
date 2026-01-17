import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, Calendar, Search, Mail, Sparkles, Tag, Loader2, X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';

export const Blog: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setActiveCategory(t.blog.categories.all);
  }, [t.blog.categories.all]);

  const categories = [t.blog.categories.all, ...Array.from(new Set(t.blog.posts.map(post => post.category)))];

  // Use local AI_Images for blog post images, cycle through if more posts than images
  const blogImages = [
    '/AI_Images/AI_Image_9.jpg',
    '/AI_Images/AI_Image_10.jpg',
    '/AI_Images/AI_Image_11.jpg',
    '/AI_Images/AI_Image_12.jpg',
    '/AI_Images/AI_Image_13.jpg',
    '/AI_Images/AI_Image_14.jpg',
    '/AI_Images/AI_Image_1.jpg',
    '/AI_Images/AI_Image_2.jpg',
    '/AI_Images/AI_Image_3.jpg',
    '/AI_Images/AI_Image_4.jpg',
    '/AI_Images/AI_Image_5.jpg',
    '/AI_Images/AI_Image_6.jpg',
    '/AI_Images/AI_Image_7.jpg',
    '/AI_Images/AI_Image_8.jpg',
  ];

  const getPostImage = (_category: string, idx?: number) => {
    // Use index if available, otherwise fallback to 0
    return blogImages[idx !== undefined ? idx % blogImages.length : 0];
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubscribed(true);
      setEmail('');
    }, 1500);
  };

  const filteredPosts = t.blog.posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === t.blog.categories.all || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="blog" className="py-24 bg-slate-950 border-t border-white/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-neon-400 text-xs font-mono uppercase mb-4"
            >
              <Sparkles size={14} />
              <span>Insights</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
            >
              {t.blog.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-400 font-light"
            >
              {t.blog.subtitle}
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-80"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-400 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder={t.blog.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-neon-400/50 focus:border-neon-400/50 text-white placeholder-slate-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] hover:bg-slate-900/80 focus:bg-slate-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Categories Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 mb-12 border-b border-white/5 pb-6"
        >
          {categories.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 overflow-hidden group border ${activeCategory === cat
                ? 'border-neon-400/50 text-slate-950 shadow-[0_0_15px_rgba(0,255,163,0.3)]'
                : 'border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10'
                }`}
            >
              {activeCategory === cat && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-neon-400"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {idx > 0 && <Tag size={14} className={activeCategory === cat ? 'opacity-80' : 'opacity-50'} />}
                {cat}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => {
                // Layout logic: First post spans 2 cols if visible and search is empty
                const isFeatured = index === 0 && !searchQuery && activeCategory === t.blog.categories.all;

                return (
                  <motion.article
                    key={post.title}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      group flex flex-col h-full bg-slate-900/60 backdrop-blur-md 
                      rounded-3xl overflow-hidden border border-white/10 
                      hover:border-neon-400/40 transition-all duration-500 
                      hover:shadow-[0_0_40px_rgba(0,255,163,0.15)] relative
                      ${isFeatured ? 'md:col-span-2' : 'col-span-1'}
                    `}
                  >
                    {/* Clickable Card Link Overlay */}
                    <a href={`#blog/${post.slug || ''}`} className="absolute inset-0 z-20 focus:outline-none focus:ring-2 focus:ring-neon-400 focus:ring-inset rounded-3xl">
                      <span className="sr-only">{t.blog.readMore} about {post.title}</span>
                    </a>

                    <div className={`${isFeatured ? 'h-72' : 'h-56'} relative overflow-hidden`}>
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${getPostImage(post.category, index)})` }}
                      ></div>
                      <div className="absolute inset-0 bg-slate-900/30 mix-blend-multiply group-hover:bg-transparent transition-all duration-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-neon-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white border border-white/10 z-10 flex items-center gap-2 shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-400 shadow-[0_0_8px_#00FFA3]"></span>
                        {post.category}
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-grow relative z-10">
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 font-mono uppercase tracking-wide">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {post.date}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {post.readTime}
                        </div>
                      </div>

                      <h3 className={`font-bold text-white mb-4 leading-tight group-hover:text-neon-400 transition-colors ${isFeatured ? 'text-3xl' : 'text-xl'}`}>
                        {post.title}
                      </h3>

                      <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5 group-hover:border-white/10 transition-colors">
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                          {t.blog.readMore}
                        </span>

                        <div className="flex items-center gap-2 text-neon-400 font-bold text-sm bg-neon-400/10 px-3 py-1.5 rounded-full group-hover:bg-neon-400 group-hover:text-slate-950 transition-all duration-300">
                          Read <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-1 md:col-span-2 lg:col-span-3 py-24 flex flex-col items-center justify-center text-center bg-white/5 rounded-3xl border border-white/5 border-dashed"
              >
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 mb-6 shadow-inner">
                  <Search size={32} />
                </div>
                <h3 className="text-xl text-white font-medium mb-2">No articles found</h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-6">
                  We couldn't find any posts matching "{searchQuery}".
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory(t.blog.categories.all); }}
                  className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-neon-400 text-sm font-medium transition-colors border border-white/5"
                >
                  Clear search & filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-sm p-8 md:p-16 text-center shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-400/50 to-transparent"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto bg-slate-950 rounded-2xl flex items-center justify-center text-neon-400 mb-8 border border-white/10 shadow-lg group">
              <Mail size={32} className="group-hover:scale-110 transition-transform duration-300" />
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              {subscribed ? "Welcome to the future!" : t.blog.subscribeTitle}
            </h3>
            <p className="text-slate-400 mb-10 text-lg">
              {subscribed ? "You've successfully subscribed to our newsletter." : t.blog.subscribeDesc}
            </p>

            {!subscribed && (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="relative flex-grow">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    required
                    placeholder={t.blog.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-neon-400 focus:border-neon-400 transition-all shadow-inner"
                  />
                </div>
                <Button variant="primary" type="submit" disabled={isSubmitting} className="whitespace-nowrap h-auto py-4 rounded-xl">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : t.blog.subscribeBtn}
                </Button>
              </form>
            )}
            <p className="mt-6 text-xs text-slate-500">
              By subscribing, you agree to our Privacy Policy. No spam, ever.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Blog;
