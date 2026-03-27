import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Mail, Phone, ExternalLink } from 'lucide-react';
import Loader from '../../components/ui/Loader';

const About = () => {
  const [settings, setSettings] = useState(null);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const [settingsRes, mediaRes] = await Promise.all([
          api.get('/settings'),
          api.get('/media') // Just to grab an image dynamically for the about hero
        ]);
        setSettings(settingsRes.data);
        if (mediaRes.data.length > 0) {
          // Grab the first or a random image for the About Hero
          setFeaturedImage(mediaRes.data[Math.floor(Math.random() * Math.min(mediaRes.data.length, 5))].url);
        }
      } catch (err) {
        console.error("Failed to fetch about data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={36} text="Loading our story..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pt-16">
      
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-muted">
        {featuredImage && (
          <img 
            src={featuredImage} 
            alt="About Studio" 
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white p-6 max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-4">
              Our Vision
            </h1>
            <p className="text-lg md:text-2xl font-light text-gray-200">
              {settings?.tagline || "Dedicated to preserving moments through the lens."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Content */}
      <section className="py-24 px-6 md:px-12 bg-card">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary font-medium tracking-widest uppercase text-sm block"
          >
            The Story Behind {settings?.siteName || "The Studio"}
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl leading-tight text-foreground"
          >
            We believe that photography is more than just taking pictures; it's about telling a story, capturing an emotion, and stopping time in its purest form.
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed space-y-6 text-left mt-12"
          >
            <p>
              Based out of {settings?.contactAddress?.split(',')[0] || "our central studio"}, we have spent years perfecting the art of light, composition, and visual narrative. Our approach is deeply personal—we work closely with every client to understand their unique vision and translate it into striking, timeless imagery.
            </p>
            <p>
              Whether we are shooting an intimate wedding, a high-fashion editorial, or a comprehensive branding campaign, our goal remains the same: to produce work that resonates emotionally and stands the test of time. We use state-of-the-art equipment and draw inspiration from classic cinematic aesthetics to ensure every frame is a masterpiece.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact & Social Integration */}
      <section className="py-24 px-6 md:px-12 bg-muted/30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-serif text-3xl font-bold tracking-tight mb-8">Get In Touch</h3>
            <div className="space-y-6 text-muted-foreground">
              {settings?.contactEmail && (
                <a href={`mailto:${settings.contactEmail}`} className="flex items-center hover:text-primary transition-colors text-lg">
                  <Mail className="mr-4 h-5 w-5" />
                  {settings.contactEmail}
                </a>
              )}
              {settings?.contactPhone && (
                <a href={`tel:${settings.contactPhone}`} className="flex items-center hover:text-primary transition-colors text-lg">
                  <Phone className="mr-4 h-5 w-5" />
                  {settings.contactPhone}
                </a>
              )}
              {settings?.contactAddress && (
                <div className="flex items-start text-lg pt-4 border-t">
                  <span className="font-medium text-foreground mr-4">Location:</span> 
                  <span className="whitespace-pre-line">{settings.contactAddress}</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="font-serif text-3xl font-bold tracking-tight mb-8">Follow Our Journey</h3>
            <div className="flex flex-col gap-4">
              {settings?.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted transition-colors group">
                  <span className="font-medium text-lg">Instagram</span>
                  <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              )}
              {settings?.socialLinks?.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted transition-colors group">
                  <span className="font-medium text-lg">Facebook</span>
                  <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              )}
              {settings?.socialLinks?.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted transition-colors group">
                  <span className="font-medium text-lg">Twitter / X</span>
                  <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
