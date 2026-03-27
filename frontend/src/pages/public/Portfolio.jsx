import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { Maximize2, Link as LinkIcon, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const Portfolio = () => {
  const [categories, setCategories] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Lightbox State
  const [selectedImageIdx, setSelectedImageIdx] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catRes, portfolioRes] = await Promise.all([
          api.get('/categories'),
          api.get('/portfolio')
        ]);
        
        setCategories(catRes.data);
        setPortfolioItems(portfolioRes.data);

        // Check hash for direct category linking
        const hash = location.hash.replace('#', '');
        if (hash) {
          const match = catRes.data.find(c => c.slug === hash);
          if (match) setActiveCategory(match._id);
        }
      } catch (err) {
        console.error("Failed to load portfolio", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [location.hash]);

  const filteredItems = activeCategory === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category && item.category._id === activeCategory);

  const openLightbox = (index) => {
    setSelectedImageIdx(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImageIdx(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIdx((prev) => (prev + 1) % filteredItems.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setSelectedImageIdx((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader size={46} text="Curating your visual experience..." />
      </div>
    );
  }

  const selectedItem = selectedImageIdx !== null ? filteredItems[selectedImageIdx] : null;

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-medium tracking-[0.2em] uppercase text-xs mb-4 block"
          >
            Portfolio
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-8"
          >
            Captured <span className="italic">Essence.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Explore our visual narrative across diverse categories. Each frame is a testament to our commitment to detail, emotion, and the art of storytelling.
          </motion.p>
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-16 overflow-x-auto pb-4 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 border ${
              activeCategory === 'all' 
                ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105' 
                : 'bg-card text-muted-foreground border-border hover:border-primary/40'
            }`}
          >
            Show All
          </button>
          {categories.map((cat, idx) => (
            <motion.button
              key={cat._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setActiveCategory(cat._id)}
              className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 border ${
                activeCategory === cat._id 
                  ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105' 
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              {cat.name}
            </motion.button>
          ))}
        </div>

        {/* Gallery Grid (Pinterest Style) */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-32 rounded-[2.5rem] border border-dashed border-border bg-muted/5">
            <p className="text-muted-foreground italic text-lg">No masterpieces found in this category yet. Stay tuned!</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="break-inside-avoid"
                >
                  <div className="group relative rounded-2xl overflow-hidden bg-muted cursor-zoom-in" onClick={() => openLightbox(idx)}>
                    <img 
                      src={item.image.url.replace('/upload/', '/upload/w_1200,q_auto,f_auto/')} 
                      alt={item.title || 'Portfolio Work'} 
                      className="w-full h-auto object-cover transition-all duration-1000 group-hover:scale-110 group-hover:blur-[2px]"
                      loading="lazy"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 text-white">
                      <div className="flex justify-between items-end transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
                            {item.category?.name}
                          </span>
                          <h3 className="text-2xl font-serif font-bold leading-tight line-clamp-2">
                            {item.title || 'Visual Story'}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                           <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md hover:bg-white hover:text-black transition-all">
                              <Maximize2 className="h-4 w-4" />
                           </div>
                        </div>
                      </div>
                      
                      {item.story && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/portfolio/${item.story.slug}`);
                          }}
                          className="mt-6 w-full py-4 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 delay-100"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View Full Story
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
              onClick={closeLightbox}
            >
              {/* Close Button */}
              <button className="absolute top-8 right-8 z-[110] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
                <X className="h-6 w-6" />
              </button>

              {/* Navigation */}
              <button 
                className="absolute left-8 top-1/2 -translate-y-1/2 z-[110] p-4 rounded-full bg-white/5 text-white hover:bg-white/20 transition-all hidden md:block"
                onClick={prevImage}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button 
                className="absolute right-8 top-1/2 -translate-y-1/2 z-[110] p-4 rounded-full bg-white/5 text-white hover:bg-white/20 transition-all hidden md:block"
                onClick={nextImage}
              >
                <ChevronRight className="h-8 w-8" />
              </button>

              <div className="max-w-6xl w-full h-full flex flex-col justify-center relative" onClick={e => e.stopPropagation()}>
                <motion.img 
                  key={selectedItem._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={selectedItem.image.url}
                  alt={selectedItem.title}
                  className="max-h-[85vh] w-auto mx-auto object-contain rounded-lg shadow-2xl shadow-primary/10"
                />
                
                <div className="mt-8 text-center text-white">
                   <span className="text-primary font-bold text-xs tracking-widest uppercase mb-2 block">
                      {selectedItem.category?.name}
                   </span>
                   <h2 className="text-3xl font-serif font-bold mb-4">{selectedItem.title || 'Visual Story'}</h2>
                   
                   {selectedItem.story && (
                     <button 
                      onClick={() => {
                        navigate(`/portfolio/${selectedItem.story.slug}`);
                        closeLightbox();
                      }}
                      className="px-8 py-3 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                     >
                       Explore Full Story
                     </button>
                   )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* CTA Section */}
      <div className="mt-32 border-t border-border/50 pt-24 text-center">
        <h2 className="text-4xl font-serif font-bold mb-6">Inspired by Our Vision?</h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto">Let's collaborate to create your own unforgettable story. Our lenses are waiting for your unique moment.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigate('/contact')} className="px-12 py-5 rounded-full bg-primary text-primary-foreground font-bold uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">Book Your Session</button>
          <button onClick={() => navigate('/pricing')} className="px-12 py-5 rounded-full bg-foreground text-background font-bold uppercase text-xs tracking-widest hover:scale-105 transition-all">View Investment</button>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
