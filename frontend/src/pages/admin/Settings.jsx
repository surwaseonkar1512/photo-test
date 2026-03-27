import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { Settings as SettingsIcon, Save, Globe, Mail, Share2 } from 'lucide-react';

const Settings = () => {
  const [formData, setFormData] = useState({
    siteName: '', tagline: '', 
    contactEmail: '', contactPhone: '', contactAddress: '',
    socialLinks: { instagram: '', facebook: '', twitter: '' },
    seoTitle: '', seoDescription: '', primaryColor: '#000000'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/settings');
        if (res.data) {
          setFormData({
            siteName: res.data.siteName || '',
            tagline: res.data.tagline || '',
            contactEmail: res.data.contactEmail || '',
            contactPhone: res.data.contactPhone || '',
            contactAddress: res.data.contactAddress || '',
            socialLinks: {
              instagram: res.data.socialLinks?.instagram || '',
              facebook: res.data.socialLinks?.facebook || '',
              twitter: res.data.socialLinks?.twitter || ''
            },
            seoTitle: res.data.seoTitle || '',
            seoDescription: res.data.seoDescription || '',
            primaryColor: res.data.primaryColor || '#000000'
          });
        }
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const socialKey = name.split('_')[1];
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [socialKey]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.put('/settings', formData);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="py-20 flex justify-center"><Loader size={36} text="Loading settings..." /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Site Settings</h1>
          <p className="text-muted-foreground mt-1">Configure global application variables and SEO.</p>
        </div>
        <Button onClick={handleSubmit} isLoading={isSaving}>
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* General Info */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-lg font-semibold border-b pb-2">
            <Globe className="h-5 w-5 text-primary" /> General Identity
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Site Name" 
              name="siteName"
              value={formData.siteName}
              onChange={handleChange}
              placeholder="e.g. John Doe Photography"
            />
            <Input 
              label="Tagline" 
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g. Capturing Moments Beautifully"
            />
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">Primary Brand Color (Hex)</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="h-10 w-12 rounded border cursor-pointer"
                />
                <Input 
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-lg font-semibold border-b pb-2">
            <Mail className="h-5 w-5 text-primary" /> Contact Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Public Email" 
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
            />
            <Input 
              label="Phone Number" 
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
            />
            <div className="md:col-span-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Business Address</label>
                <textarea 
                  name="contactAddress"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.contactAddress}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEO & Social */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-lg font-semibold border-b pb-2">
            <Share2 className="h-5 w-5 text-primary" /> SEO & Social Links
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2 space-y-4">
              <Input 
                label="SEO Meta Title" 
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                placeholder="Title tag for search engines"
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">SEO Meta Description</label>
                <textarea 
                  name="seoDescription"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.seoDescription}
                  onChange={handleChange}
                  maxLength={160}
                  placeholder="Meta description (max 160 chars)"
                />
                <span className="text-xs text-muted-foreground text-right">{formData.seoDescription.length}/160</span>
              </div>
            </div>
            
            <Input 
              label="Instagram URL" 
              name="social_instagram"
              value={formData.socialLinks.instagram}
              onChange={handleChange}
            />
            <Input 
              label="Facebook URL" 
              name="social_facebook"
              value={formData.socialLinks.facebook}
              onChange={handleChange}
            />
            <Input 
              label="Twitter / X URL" 
              name="social_twitter"
              value={formData.socialLinks.twitter}
              onChange={handleChange}
            />
          </div>
        </div>

      </form>
    </div>
  );
};

export default Settings;
