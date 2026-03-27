import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const packageQuery = searchParams.get('package');

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      serviceType: packageQuery || ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await api.post('/leads', { ...data, source: 'contact' });
      toast.success('Your message has been sent successfully. We will be in touch soon!');
      reset({ serviceType: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-24 px-6 md:px-12 flex items-center">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          <span className="text-primary font-medium tracking-widest uppercase text-sm mb-4 block">Let's Connect</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-6">
            Tell us about your next visionary moment.
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Whether it's a wedding, a brand campaign, or a personal portrait session, we'd love to hear from you. Fill out the form and we'll get back to you within 24 hours.
          </p>
          
          <div className="space-y-6">
            <div className="border-l-2 border-primary pl-4">
              <h4 className="font-semibold text-lg">Studio Hours</h4>
              <p className="text-muted-foreground">Monday - Friday: 9am - 6pm</p>
              <p className="text-muted-foreground">Weekends: By Appointment Only</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card border rounded-3xl p-8 md:p-10 shadow-lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Full Name *"
                error={errors.name?.message}
                {...register('name', { required: 'Name is required' })}
              />
              <Input 
                label="Email Address *"
                type="email"
                error={errors.email?.message}
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Phone Number"
                type="tel"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input 
                label="Preferred Date"
                type="date"
                error={errors.datePreference?.message}
                {...register('datePreference')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Service of Interest</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('serviceType')}
              >
                <option value="">Select an option</option>
                <option value="Wedding">Wedding</option>
                <option value="Portrait">Portrait</option>
                <option value="Commercial">Commercial / Branding</option>
                <option value="Editorial">Editorial</option>
                <option value="Other">Other (Specify in message)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Project Details & Message *</label>
              <textarea 
                className={`flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.message ? 'border-destructive' : ''}`}
                placeholder="Tell us a bit about what you're looking for..."
                {...register('message', { required: 'Message is required' })}
              />
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
            </div>

            <Button type="submit" className="w-full py-4 text-md" isLoading={isSubmitting}>
              Send Inquiry
            </Button>
          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default Contact;
