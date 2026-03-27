import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import { CheckCircle2, Star, Sparkles, MessageCircle } from 'lucide-react';

const Pricing = () => {
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setIsLoading(true);
        const [catsRes, pkgsRes] = await Promise.all([
          api.get('/pricing/categories'),
          api.get('/pricing')
        ]);
        
        const sortedCats = catsRes.data.sort((a, b) => a.order - b.order);
        setCategories(sortedCats);
        setPackages(pkgsRes.data);
        
        if (sortedCats.length > 0) {
          setActiveCategory(sortedCats[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load packages. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const handleBookNow = (pkg) => {
    setSelectedPackage(pkg);
    setValue('serviceType', pkg.category?.name || '');
    setValue('package', pkg.packageName);
    setIsModalOpen(true);
  };

  const onInquirySubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        package: selectedPackage.packageName,
        message: `Booking Inquiry for ${selectedPackage.packageName} (${selectedPackage.category?.name})\n---\n${data.message}`
      };
      await api.post('/leads', { ...payload, source: 'pricing' });
      toast.success('Booking request sent successfully! We will contact you soon.');
      setIsModalOpen(false);
      reset();
    } catch (err) {
      toast.error('Failed to send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPackages = packages.filter(p => p.category?._id === activeCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={40} text="Loading our premium collections..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6 md:px-12">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-primary font-medium tracking-widest uppercase text-xs mb-4 block"
        >
          Invest in Memories
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6"
        >
          Framing Your <span className="italic">Stories.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Transparent pricing for extraordinary visual experiences. Choose a collection that fits your vision, or contact us for a bespoke package.
        </motion.p>
      </div>

      {/* Category Selection */}
      <div className="flex flex-wrap justify-center gap-2 mb-16 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((cat, idx) => (
          <motion.button
            key={cat._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-8 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${
              activeCategory === cat._id 
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105' 
                : 'bg-card text-muted-foreground border-border hover:border-primary/50'
            }`}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"
          >
            {filteredPackages.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground italic bg-muted/5 w-full rounded-2xl border border-dashed border-border">
                No active packages in this category yet. Please check back soon or contact us for details.
              </div>
            ) : (
              filteredPackages.map((pkg, idx) => (
                <div 
                  key={pkg._id}
                  className={`relative flex flex-col w-full max-w-md bg-card border rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group ${
                    pkg.isPopular ? 'ring-2 ring-primary border-transparent' : 'hover:border-primary/30'
                  }`}
                >
                  {pkg.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase py-1.5 px-4 rounded-full shadow-xl flex items-center gap-1.5 z-10">
                      <Star className="h-3 w-3 fill-current" /> Most Popular
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-serif font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{pkg.packageName}</h3>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold tracking-tighter">₹{pkg.sellingPrice?.toLocaleString()}</span>
                      {pkg.actualPrice > pkg.sellingPrice && (
                        <>
                          <span className="text-lg text-muted-foreground line-through decoration-primary/30">₹{pkg.actualPrice?.toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 uppercase tracking-tighter">
                            {Math.round(((pkg.actualPrice - pkg.sellingPrice) / pkg.actualPrice) * 100)}% Discount
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-8 leading-relaxed h-[3rem] line-clamp-2">
                    {pkg.description || "Capture your moments with our exclusive high-quality photography session tailored to your needs."}
                  </p>

                  <div className="space-y-4 mb-10 flex-grow">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 block border-b pb-2">Includes:</span>
                    <ul className="space-y-3">
                      {pkg.features?.map((feature, i) => (
                        <li key={i} className="flex items-start text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                          <CheckCircle2 className="h-4 w-4 text-primary mr-3 mt-0.5 shrink-0 opacity-70 group-hover:opacity-100" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {pkg.addOns?.length > 0 && (
                    <div className="mb-10 p-4 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block mb-2">Available Add-ons:</span>
                      <div className="flex flex-wrap gap-2">
                        {pkg.addOns.map((add, i) => (
                          <span key={i} className="text-[9px] font-medium bg-background/50 px-2 py-1 rounded-lg border border-border/50">{add}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    className={`w-full py-6 rounded-2xl font-bold transition-all duration-300 ${pkg.isPopular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-foreground text-background hover:bg-foreground/90'}`}
                    onClick={() => handleBookNow(pkg)}
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> Book This Collection
                  </Button>
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Booking Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedPackage ? `Booking Inquiry: ${selectedPackage.packageName}` : 'Inquiry'}
        maxWidth="max-w-lg"
      >
        <div className="p-2">
          {selectedPackage && (
            <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-primary/70">Selected Package</p>
                <p className="text-sm font-semibold">{selectedPackage.packageName}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-widest text-primary/70">Estimated Price</p>
                <p className="text-sm font-bold">₹{selectedPackage.sellingPrice?.toLocaleString()}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onInquirySubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Name *" 
                {...register('name', { required: 'Name is required' })} 
                error={errors.name?.message} 
                placeholder="Your full name"
              />
              <Input 
                label="Phone *" 
                {...register('phone', { required: 'Phone is required' })} 
                error={errors.phone?.message}
                placeholder="Contact number"
              />
            </div>
            
            <Input 
              label="Email *" 
              type="email" 
              {...register('email', { required: 'Email is required' })} 
              error={errors.email?.message}
              placeholder="hello@example.com"
            />
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Event/Shoot Date (Optional)</label>
              <input 
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none"
                {...register('datePreference')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Message / Special Notes</label>
              <textarea 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none"
                placeholder="Tell us more about your event..."
                {...register('message')}
              />
            </div>

            <Button type="submit" className="w-full py-4 text-md bg-primary text-primary-foreground" isLoading={isSubmitting}>
              <MessageCircle className="mr-2 h-4 w-4" /> Send Request
            </Button>
          </form>
        </div>
      </Modal>

      {/* FAQ/CTA Bottom section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="mt-32 max-w-4xl mx-auto text-center border-t border-border/50 pt-20"
      >
        <h2 className="text-3xl font-serif font-bold mb-6">Need a Custom Package?</h2>
        <p className="text-muted-foreground mb-8">
          Every story is unique. If our standard collections don't quite fit your vision, reach out to us for a custom-tailored experience.
        </p>
        <Button variant="outline" className="px-10 py-4 rounded-full" onClick={() => window.location.href='/contact'}>
          Contact Us for Bespoke Pricing
        </Button>
      </motion.div>
    </div>
  );
};

export default Pricing;
