import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import MediaLibrary from './MediaLibrary';
import { Settings as SettingsIcon, Save, Globe, Mail, Share2, Image as ImageIcon, MessageCircle, Plus, Facebook, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';

const Settings = () => {
  const [formData, setFormData] = useState({
    siteName: '', tagline: '',
    contactEmail: '', contactPhone: '', contactAddress: '',
    companyLogoUrl: '', navbarLogoUrl: '', footerLogoUrl: '',
    socialLinks: { instagram: '', facebook: '', twitter: '', youtube: '', linkedin: '', whatsapp: '' },
    seoTitle: '', seoDescription: '', seoKeywords: '', primaryColor: '#000000'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [currentLogoType, setCurrentLogoType] = useState(null); // 'company', 'navbar', 'footer'

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
            companyLogoUrl: res.data.companyLogoUrl || '',
            navbarLogoUrl: res.data.navbarLogoUrl || '',
            footerLogoUrl: res.data.footerLogoUrl || '',
            socialLinks: {
              instagram: res.data.socialLinks?.instagram || '',
              facebook: res.data.socialLinks?.facebook || '',
              twitter: res.data.socialLinks?.twitter || '',
              youtube: res.data.socialLinks?.youtube || '',
              linkedin: res.data.socialLinks?.linkedin || '',
              whatsapp: res.data.socialLinks?.whatsapp || ''
            },
            seoTitle: res.data.seoTitle || '',
            seoDescription: res.data.seoDescription || '',
            seoKeywords: res.data.seoKeywords || '',
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

  const LogoUploader = ({ label, value, type }) => (
    <div className="space-y-2">
      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{label}</label>
      <div
        onClick={() => { setCurrentLogoType(type); setIsMediaModalOpen(true); }}
        className="relative group h-32 w-full rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 bg-muted/10 hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-center overflow-hidden"
      >
        {value ? (
          <>
            <img src={value} alt={label} className="h-full w-full object-contain p-4" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold uppercase tracking-widest">Change</span>
            </div>
          </>
        ) : (
          <div className="text-center">
            <Plus className="h-6 w-6 text-muted-foreground/30 mx-auto mb-1" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground/50">Select Logo</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
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

        {/* Branding Logos */}
        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Brand Assets</h3>
              <p className="text-xs text-muted-foreground">Manage logos for different parts of your application.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <LogoUploader label="Company Logo (Quotation)" value={formData.companyLogoUrl} type="companyLogoUrl" />
            <LogoUploader label="Navbar Logo" value={formData.navbarLogoUrl} type="navbarLogoUrl" />
            <LogoUploader label="Footer Logo" value={formData.footerLogoUrl} type="footerLogoUrl" />
          </div>
        </div>

        {/* General Info */}
        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">General Identity</h3>
              <p className="text-xs text-muted-foreground">Site name, tagline and brand colors.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Site Name"
              name="siteName"
              value={formData.siteName}
              onChange={handleChange}
              placeholder="e.g. Visionary Studio"
              className="rounded-2xl"
            />
            <Input
              label="Tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g. Capturing your timeless moments"
              className="rounded-2xl"
            />
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">Primary Brand Color</label>
              <div className="flex gap-4">
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor || '#000000'}
                  onChange={handleChange}
                  className="h-12 w-20 rounded-2xl border cursor-pointer bg-white p-1"
                />
                <Input
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="flex-1 rounded-2xl"
                  placeholder="#000000"
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
        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">SEO & Connect</h3>
              <p className="text-xs text-muted-foreground">Search engine presence and social media profiles.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="SEO Meta Title"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                placeholder="Title tag for search engines"
                className="rounded-2xl"
              />
              <Input
                label="SEO Meta Keywords"
                name="seoKeywords"
                value={formData.seoKeywords}
                onChange={handleChange}
                placeholder="photography, wedding, events..."
                className="rounded-2xl"
              />
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">SEO Meta Description</label>
                <textarea
                  name="seoDescription"
                  className="flex min-h-[100px] w-full rounded-2xl border border-input bg-transparent px-5 py-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.seoDescription}
                  onChange={handleChange}
                  maxLength={160}
                  placeholder="Summarize your site for Google (max 160 chars)"
                />
                <span className="text-[10px] font-bold text-muted-foreground text-right mt-1">{formData.seoDescription.length}/160</span>
              </div>
            </div>

            <div className="border-t pt-8">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-6">Social Media Profiles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#E1306C]/10 flex items-center justify-center text-[#E1306C]">
                      <Instagram className="h-5 w-5" />
                    </div>
                    <Input
                      name="social_instagram"
                      value={formData.socialLinks.instagram}
                      onChange={handleChange}
                      placeholder="Instagram URL"
                      className="flex-1 rounded-2xl"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#4267B2]/10 flex items-center justify-center text-[#4267B2]">
                      <Facebook className="h-5 w-5" />
                    </div>
                    <Input
                      name="social_facebook"
                      value={formData.socialLinks.facebook}
                      onChange={handleChange}
                      placeholder="Facebook URL"
                      className="flex-1 rounded-2xl"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#FF0000]/10 flex items-center justify-center text-[#FF0000]">
                      <Youtube className="h-5 w-5" />
                    </div>
                    <Input
                      name="social_youtube"
                      value={formData.socialLinks.youtube}
                      onChange={handleChange}
                      placeholder="YouTube URL"
                      className="flex-1 rounded-2xl"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#0077B5]/10 flex items-center justify-center text-[#0077B5]">
                      <Linkedin className="h-5 w-5" />
                    </div>
                    <Input
                      name="social_linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleChange}
                      placeholder="LinkedIn URL"
                      className="flex-1 rounded-2xl"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Twitter className="h-5 w-5" />
                    </div>
                    <Input
                      name="social_twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleChange}
                      placeholder="Twitter URL"
                      className="flex-1 rounded-2xl"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <Input
                      name="social_whatsapp"
                      value={formData.socialLinks.whatsapp}
                      onChange={handleChange}
                      placeholder="WhatsApp URL"
                      className="flex-1 rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </form>

      {/* Media Selector Modal */}
      <Modal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        title="Select Logo Asset"
        maxWidth="max-w-4xl"
      >
        <MediaLibrary
          isSelector={true}
          onSelect={(media) => {
            setFormData({ ...formData, [currentLogoType]: media.url });
            setIsMediaModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Settings;
