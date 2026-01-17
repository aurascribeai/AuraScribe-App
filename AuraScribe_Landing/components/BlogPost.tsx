import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Calendar, Clock, Share2, Linkedin, Twitter, Link } from 'lucide-react';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';

const BlogPost = () => {
    const { t } = useLanguage();
    // Parse slug from hash safely
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const slug = hash.replace('#blog/', '');

    // Find post in current language
    const post = t.blog.posts.find(p => p.slug === slug);

    // Image mapping reused for consistency
    const getPostImage = (category: string) => {
        if (category === 'Burnout') {
            return "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?q=80&w=2099&auto=format&fit=crop";
        }
        if (category === 'IA Médicale' || category === 'Medical AI') {
            return "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=2006&auto=format&fit=crop";
        }
        return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop";
    };

    if (!post) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-3xl font-bold text-white mb-4">Article not found</h2>
                <p className="text-slate-400 mb-8">The article you are looking for does not exist or has been moved.</p>
                <Button variant="primary" href="#blog">Return to Blog</Button>
            </div>
        );
    }

    return (
        <article className="pt-24 pb-24 min-h-screen bg-slate-950 relative">

            {/* Hero Image / Header */}
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden mb-12">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${getPostImage(post.category)})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

                <div className="absolute inset-0 flex items-end">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12">
                        <Button
                            variant="glass"
                            href="#blog"
                            size="sm"
                            className="mb-8 hover:bg-white/10 text-white border-white/20"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            {t.blog.title}
                        </Button>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full bg-neon-400 text-slate-950 text-xs font-bold uppercase tracking-wider">
                                    {post.category}
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-300 text-sm font-medium">
                                    <Calendar size={14} /> {post.date}
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-300 text-sm font-medium">
                                    <Clock size={14} /> {post.readTime}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl drop-shadow-lg">
                                {post.title}
                            </h1>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Main Text */}
                    <div className="flex-grow">
                        <div
                            className="prose prose-lg prose-invert prose-headings:text-white prose-headings:font-bold prose-p:text-slate-300 prose-a:text-neon-400 prose-strong:text-white prose-li:text-slate-300"
                            dangerouslySetInnerHTML={{ __html: post.content || '' }}
                        />

                        <div className="mt-16 pt-8 border-t border-white/10">
                            <h4 className="text-white font-bold mb-4">Share this article</h4>
                            <div className="flex gap-4">
                                <button className="p-3 rounded-full bg-white/5 hover:bg-blue-600 text-white transition-colors">
                                    <Linkedin size={20} />
                                </button>
                                <button className="p-3 rounded-full bg-white/5 hover:bg-sky-500 text-white transition-colors">
                                    <Twitter size={20} />
                                </button>
                                <button className="p-3 rounded-full bg-white/5 hover:bg-neon-400 hover:text-slate-950 text-white transition-colors">
                                    <Link size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </article>
    );
};

export default BlogPost;
