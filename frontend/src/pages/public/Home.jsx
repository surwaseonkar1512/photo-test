import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ChevronRight, ArrowRight, Star } from 'lucide-react';

const HeroSlider = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return (
    <div className="h-[80vh] bg-muted flex items-center justify-center text-muted-foreground">
      No banners configured.
    </div>
  );

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-black">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {currentBanner.image && (
            <img 
              src={currentBanner.image.url} 
              alt={currentBanner.title} 
              className="w-full h-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-4 max-w-4xl"
            >
              {currentBanner.title}
            </motion.h1>
            
            {currentBanner.subtitle && (
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-lg md:text-2xl font-light mb-8 max-w-2xl text-gray-200"
              >
                {currentBanner.subtitle}
              </motion.p>
            )}

            {currentBanner.buttonText && currentBanner.link && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <Link 
                  to={currentBanner.link} 
                  className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors inline-block"
                >
                  {currentBanner.buttonText}
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-10">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const [data, setData] = useState({
    banners: [],
    categories: [],
    testimonials: [],
    settings: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [bannersRes, categoriesRes, testimonialsRes, settingsRes] = await Promise.all([
          api.get('/banners'),
          api.get('/categories'),
          api.get('/testimonials'),
          api.get('/settings')
        ]);
        
        setData({
          banners: bannersRes.data,
          categories: categoriesRes.data.slice(0, 4), // Show top 4 categories
          testimonials: testimonialsRes.data.filter(t => t.isVisible),
          settings: settingsRes.data
        });
      } catch (err) {
        console.error("Failed to fetch home data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-muted-foreground tracking-widest uppercase text-sm font-medium">Loading Experience</p>
        </div>
      </div>
    );
  }

  // Set page title
  if (data.settings?.seoTitle) {
    document.title = data.settings.seoTitle;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSlider banners={data.banners} />

      {/* Featured Portfolio Categories */}
      <section className="py-24 bg-background px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <span className="text-primary font-medium tracking-widest uppercase text-sm mb-2 block">Our Expertise</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">Portfolio Collections</h2>
              <p className="text-muted-foreground mt-4 text-lg">Curated moments spanning various disciplines, capturing the essence of every subject.</p>
            </div>
            <Link to="/portfolio" className="hidden md:inline-flex items-center text-primary font-medium hover:underline mt-6 md:mt-0 group">
              View All Work <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.categories.map((category, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                key={category._id} 
                className="group relative h-[400px] rounded-2xl overflow-hidden block"
              >
                <Link to={`/portfolio#${category.slug}`} className="absolute inset-0 z-10 w-full h-full">
                  <span className="sr-only">View {category.name}</span>
                </Link>
                {category.coverImage && (
                  <img 
                    src={category.coverImage.url} 
                    alt={category.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-8 w-full z-20 pointer-events-none">
                  <h3 className="text-3xl font-serif text-white font-semibold mb-2">{category.name}</h3>
                  <div className="flex items-center text-white/80 text-sm font-medium tracking-widest uppercase">
                    Explore <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center md:hidden">
            <Link to="/portfolio" className="inline-flex items-center text-primary font-medium hover:underline group">
              View All Work <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy / About Section Highlight */}
      <section className="py-24 bg-muted/30 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-6"
          >
            <span className="text-primary font-medium tracking-widest uppercase text-sm mb-2 block">Our Philosophy</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
              {data.settings?.tagline || "We capture the moments that define your life."}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Based in {data.settings?.contactAddress?.split(',')[0] || 'the core of the city'}, we are a premium photography studio dedicated to visual storytelling. We believe every image should evoke emotion and preserve a timeless narrative.
            </p>
            <div className="pt-4">
              <Link to="/about" className="inline-block border border-primary text-primary px-8 py-3 rounded-full font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                Learn our story
              </Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full"
          >
            {/* If there's an about highlight image from settings in the future, use it. For now, use a placeholder or style box. */}
            <div className="aspect-[4/5] bg-muted rounded-2xl overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                 <span className="font-serif text-3xl text-muted-foreground opacity-50">Studio Image</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Client Testimonials */}
      {data.testimonials.length > 0 && (
        <section className="py-24 bg-background px-6 md:px-12">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <span className="text-primary font-medium tracking-widest uppercase text-sm mb-2 block">Client Stories</span>
            <h2 className="font-serif text-4xl font-bold tracking-tight mb-8">Words of Praise</h2>
          </div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.testimonials.slice(0, 3).map((t, idx) => (
              <motion.div 
                key={t._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-card border rounded-2xl p-8 shadow-sm flex flex-col h-full"
              >
                <div className="flex text-yellow-500 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'fill-current' : 'text-muted'}`} />
                  ))}
                </div>
                <p className="text-lg text-muted-foreground italic mb-8 flex-1">"{t.content}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  {t.avatar ? (
                    <img src={t.avatar.url} alt={t.clientName} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {t.clientName.charAt(0)}
                    </div>
                  )}
                  <h4 className="font-semibold">{t.clientName}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground text-center px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to create together?</h2>
          <p className="text-xl text-primary-foreground/80 mb-10">Let's discuss your next project, event, or vision.</p>
          <Link to="/contact" className="inline-block bg-background text-foreground px-10 py-4 rounded-full font-medium text-lg hover:shadow-lg hover:-translate-y-1 transition-all">
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
