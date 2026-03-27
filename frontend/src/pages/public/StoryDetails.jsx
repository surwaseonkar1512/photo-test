import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { ArrowLeft, Calendar, User, MapPin, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const StoryDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/stories/${slug}`);
        setStory(res.data);
      } catch (err) {
        console.error("Failed to load story", err);
        navigate('/portfolio');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [slug, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={36} text="Loading story..." />
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Cover */}
      <section className="relative h-[85vh] w-full bg-muted">
        {story.coverImage && (
          <img 
            src={story.coverImage.url} 
            alt={story.title} 
            className="w-full h-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <div className="absolute top-8 left-6 md:left-12 z-20">
          <Link to="/portfolio" className="inline-flex items-center text-white/90 hover:text-white transition-colors bg-black/20 hover:bg-black/40 px-5 py-2.5 rounded-full backdrop-blur-md text-sm font-medium border border-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Portfolio
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 pb-16 md:pb-24">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-3xl">
                  <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-medium tracking-widest uppercase text-xs mb-6">
                    {story.category?.name || 'Story'}
                  </span>
                  <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-white leading-tight drop-shadow-lg mb-4">
                    {story.title}
                  </h1>
                  {story.subTitle && (
                    <h2 className="text-2xl md:text-3xl font-light text-white/90 mb-4">{story.subTitle}</h2>
                  )}
                  {story.slogan && (
                    <p className="text-lg text-primary-foreground/80 italic border-l-2 border-primary pl-4">{story.slogan}</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-3 text-sm text-white/80 font-medium bg-black/20 p-6 rounded-2xl backdrop-blur-md border border-white/10 shrink-0 min-w-[200px]">
                  {story.eventDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-3 text-white/60" />
                      {format(new Date(story.eventDate), 'MMMM d, yyyy')}
                    </div>
                  )}
                  {story.clientName && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-3 text-white/60" />
                      {story.clientName}
                    </div>
                  )}
                  {story.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-3 text-white/60" />
                      {story.location}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Content & Description */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-32 pb-16">
        {story.description && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="prose prose-lg dark:prose-invert max-w-3xl mx-auto text-center"
          >
            <p className="text-xl text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {story.description}
            </p>
          </motion.div>
        )}
      </div>

      {/* Story Highlights */}
      {story.highlights && story.highlights.length > 0 && (
        <section className="bg-muted/30 py-16 border-y">
          <div className="max-w-4xl mx-auto px-6 md:px-12">
            <h3 className="text-2xl font-serif font-bold mb-8 text-center text-foreground">Client Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {story.highlights.map((highlight, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start bg-card p-4 rounded-xl shadow-sm border"
                >
                  <CheckCircle2 className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                  <span className="text-foreground/90 leading-relaxed">{highlight}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video Content */}
      {story.videoUrls && story.videoUrls.length > 0 && (
        <section className="bg-background py-24 border-b">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <div className="space-y-12">
              {story.videoUrls.map((vid, idx) => {
                let embedUrl = vid;
                if (vid.includes('youtube.com/watch?v=')) {
                  embedUrl = vid.replace('watch?v=', 'embed/').split('&')[0];
                } else if (vid.includes('youtu.be/')) {
                  embedUrl = vid.replace('youtu.be/', 'youtube.com/embed/').split('?')[0];
                }

                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black border ring-1 ring-white/10"
                  >
                    {embedUrl.includes('embed') || embedUrl.includes('vimeo') ? (
                      <iframe 
                        src={embedUrl} 
                        title={`${story.title} Video ${idx + 1}`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <a href={vid} target="_blank" rel="noreferrer" className="underline hover:text-white transition-colors">
                          Watch Video External Link
                        </a>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Images Layout */}
      {story.images && story.images.length > 0 && (
        <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {story.images.map((img, idx) => (
              <motion.div
                key={img._id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: (idx % 3) * 0.1 }}
                className="break-inside-avoid rounded-xl overflow-hidden bg-muted"
              >
                <img 
                  src={img.url.replace('/upload/', '/upload/w_1000,q_auto/')} 
                  alt={`${story.title} - Gallery ${idx + 1}`} 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Next Step / CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center px-6 mt-12">
        <div className="max-w-3xl mx-auto">
          <span className="font-medium tracking-widest uppercase text-sm mb-4 block text-primary-foreground/70">Inspired?</span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight mb-8">Let's craft your story next.</h2>
          <Link to="/contact" className="inline-block bg-background text-foreground px-10 py-4 rounded-full font-medium text-lg hover:shadow-lg hover:-translate-y-1 transition-all">
            Inquire Now
          </Link>
        </div>
      </section>

    </div>
  );
};

export default StoryDetails;
