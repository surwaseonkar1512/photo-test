import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import MediaLibrary from './MediaLibrary';
import { Plus, Edit2, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', subtitle: '', link: '', buttonText: '', image: null, isVisible: true, order: 0
  });

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/banners/all');
      setBanners(res.data);
    } catch (err) {
      toast.error('Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || '',
        link: banner.link || '',
        buttonText: banner.buttonText || '',
        image: banner.image,
        isVisible: banner.isVisible,
        order: banner.order
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '', subtitle: '', link: '', buttonText: '', image: null, isVisible: true, order: banners.length
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      return toast.error('Please select an image');
    }

    try {
      const payload = { ...formData, image: formData.image._id };
      
      if (editingBanner) {
        await api.put(`/banners/${editingBanner._id}`, payload);
        toast.success('Banner updated');
      } else {
        await api.post('/banners', payload);
        toast.success('Banner created');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner permanently?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (err) {
      toast.error('Failed to delete banner');
    }
  };

  const toggleVisibility = async (id, currentVisibility) => {
    try {
      await api.put(`/banners/${id}`, { isVisible: !currentVisibility });
      fetchBanners();
    } catch (err) {
      toast.error('Failed to update visibility');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Banner Management</h1>
          <p className="text-muted-foreground mt-1">Manage the hero slides on the homepage.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" /> Add Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader size={36} text="Loading banners..." /></div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-muted/10">
          <p className="text-muted-foreground">No banners found. Create your first hero slide!</p>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden hidden sm:block">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Title & Subtitle</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {banners.map((banner) => (
                <tr key={banner._id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-5">
                    {banner.image ? (
                      <div className="w-32 h-16 rounded-lg overflow-hidden border shadow-sm group-hover:shadow-md transition-shadow">
                        <img src={banner.image.url} alt={banner.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-32 h-16 bg-muted/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground border border-dashed">No Image</div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-semibold text-foreground text-base mb-1">{banner.title}</p>
                    <p className="text-muted-foreground truncate max-w-xs">{banner.subtitle || 'No subtitle'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => toggleVisibility(banner._id, banner.isVisible)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${banner.isVisible ? 'bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20' : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'}`}
                    >
                      {banner.isVisible ? 'Live on Site' : 'Draft / Hidden'}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" onClick={() => handleOpenModal(banner)} className="h-8 w-8 rounded-full">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(banner._id)} className="h-8 w-8 rounded-full bg-destructive/10 text-destructive border-transparent hover:bg-destructive hover:text-destructive-foreground">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Main Banner Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingBanner ? "Edit Banner" : "Create New Banner"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Title *" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <Input 
              label="Order" 
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({...formData, order: e.target.value})}
            />
          </div>
          <Input 
            label="Subtitle" 
            value={formData.subtitle}
            onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Button Text (Optional)" 
              value={formData.buttonText}
              onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
            />
            <Input 
              label="Button Link URL" 
              value={formData.link}
              onChange={(e) => setFormData({...formData, link: e.target.value})}
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="isVisible"
              checked={formData.isVisible}
              onChange={(e) => setFormData({...formData, isVisible: e.target.checked})}
              className="rounded border-gray-300"
            />
            <label htmlFor="isVisible" className="text-sm font-medium">Visible on public site?</label>
          </div>

          <div className="mt-4 border rounded-md p-4 bg-muted/20">
            <label className="block text-sm font-medium mb-2">Banner Image *</label>
            {formData.image ? (
              <div className="relative group rounded-md overflow-hidden aspect-video">
                <img src={formData.image.url} alt="Selected" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" type="button" onClick={() => setIsMediaModalOpen(true)}>Change Image</Button>
                </div>
              </div>
            ) : (
              <Button type="button" variant="outline" className="w-full py-8 border-dashed" onClick={() => setIsMediaModalOpen(true)}>
                <ImageIcon className="mr-2 h-5 w-5 text-muted-foreground" /> Select from Library
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Banner</Button>
          </div>
        </form>
      </Modal>

      {/* Media Selector Modal */}
      <Modal 
        isOpen={isMediaModalOpen} 
        onClose={() => setIsMediaModalOpen(false)} 
        title="Select Media"
        maxWidth="max-w-4xl"
      >
        <MediaLibrary 
          isSelector={true} 
          onSelect={(mediaParam) => {
            setFormData({...formData, image: mediaParam});
            setIsMediaModalOpen(false);
          }} 
        />
      </Modal>
    </div>
  );
};

export default Banners;
