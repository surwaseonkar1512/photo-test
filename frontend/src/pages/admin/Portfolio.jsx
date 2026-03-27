import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import MediaLibrary from './MediaLibrary';
import { Plus, Edit2, Trash2, Image as ImageIcon, CheckCircle2, X, GripVertical } from 'lucide-react';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', category: '', story: '', image: null, tags: [], order: 0, status: 'active'
  });
  const [tagInput, setTagInput] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [portfolioRes, categoriesRes, storiesRes] = await Promise.all([
        api.get('/portfolio/admin'),
        api.get('/categories'),
        api.get('/stories/admin/all')
      ]);
      setPortfolio(portfolioRes.data);
      setCategories(categoriesRes.data);
      setStories(storiesRes.data);
    } catch (err) {
      toast.error('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        category: item.category ? item.category._id : '',
        story: item.story ? item.story._id : '',
        image: item.image,
        tags: item.tags || [],
        order: item.order || 0,
        status: item.status || 'active'
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '', 
        category: categories.length > 0 ? categories[0]._id : '', 
        story: '', 
        image: null, 
        tags: [], 
        order: portfolio.length, 
        status: 'active'
      });
    }
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleMediaSelect = (media) => {
    setFormData({ ...formData, image: media });
    setIsMediaModalOpen(false);
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image || !formData.category) {
      return toast.error('Image and Category are required');
    }

    try {
      const payload = { 
        ...formData, 
        image: {
          url: formData.image.url,
          public_id: formData.image.public_id
        },
        category: formData.category,
        story: formData.story || null
      };
      
      if (editingItem) {
        await api.put(`/portfolio/${editingItem._id}`, payload);
        toast.success('Portfolio item updated');
      } else {
        await api.post('/portfolio', payload);
        toast.success('Added to portfolio');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this image from portfolio?')) return;
    try {
      await api.delete(`/portfolio/${id}`);
      toast.success('Removed successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/portfolio/status/${id}`);
      fetchData();
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Portfolio Gallery</h1>
          <p className="text-muted-foreground mt-1">Manage your category-wise showcases and story links.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" /> Add Image
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader size={36} text="Loading portfolio..." /></div>
      ) : portfolio.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-muted/10">
          <p className="text-muted-foreground">No portfolio items found. Showcase your best work!</p>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {portfolio.map((item) => (
                <tr key={item._id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="w-24 h-16 rounded-lg overflow-hidden border shadow-sm group-hover:shadow-md transition-all">
                      <img src={item.image.url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-semibold text-foreground text-base mb-1">{item.title || 'Untitled Work'}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-tight">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                        {item.category?.name || 'Uncategorized'}
                      </span>
                      {item.story && (
                        <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded border border-blue-500/20">
                          Linked to Story
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => toggleStatus(item._id)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                        item.status === 'active' 
                          ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20' 
                          : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                      }`}
                    >
                      {item.status === 'active' ? 'Publicly Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" onClick={() => handleOpenModal(item)} className="h-8 w-8 rounded-full">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(item._id)} className="h-8 w-8 rounded-full bg-destructive/10 text-destructive border-transparent hover:bg-destructive hover:text-white">
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

      {/* Item Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? "Edit Portfolio Item" : "Add to Portfolio"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-medium mb-2">Portfolio Image *</label>
              {formData.image ? (
                <div className="relative group rounded-2xl overflow-hidden aspect-[4/3] shadow-lg border">
                  <img src={formData.image.url} alt="Selected" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" type="button" onClick={() => setIsMediaModalOpen(true)}>Change Image</Button>
                  </div>
                </div>
              ) : (
                <Button type="button" variant="outline" className="w-full py-20 border-dashed rounded-2xl flex flex-col gap-3" onClick={() => setIsMediaModalOpen(true)}>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-muted-foreground">Select from Media Library</span>
                </Button>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              <Input 
                label="Image Title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Elegant Bridal Portrait"
              />
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Category *</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Link to Story (Optional)</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.story}
                  onChange={(e) => setFormData({...formData, story: e.target.value})}
                >
                  <option value="">No Story Link</option>
                  {stories.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                </select>
                <p className="text-[10px] text-muted-foreground italic mt-1 font-medium">Linking a story will show a "View Story" button on hover.</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Tags</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. Wedding, Candid" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1"
                  />
                  <Button type="button" variant="secondary" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  {formData.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md border">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <div className="flex gap-4 items-center">
               <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Display Order</label>
                  <input type="number" className="w-20 border rounded-md p-2 text-sm" value={formData.order} onChange={(e) => setFormData({...formData, order: e.target.value})} />
               </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save to Portfolio</Button>
            </div>
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
          onSelect={handleMediaSelect} 
        />
      </Modal>
    </div>
  );
};

export default Portfolio;
