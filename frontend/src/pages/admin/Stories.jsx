import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import MediaLibrary from './MediaLibrary';
import { Plus, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState(null); // 'cover' or 'gallery'
  const [editingStory, setEditingStory] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', slug: '', subTitle: '', slogan: '', description: '', category: '', coverImage: null, 
    images: [], videoUrls: [], highlights: [], eventDate: '', clientName: '', location: '', status: 'draft', isFeatured: false
  });
  
  // Dynamic inputs
  const [highlightInput, setHighlightInput] = useState('');
  const [videoInput, setVideoInput] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [storiesRes, categoriesRes] = await Promise.all([
        api.get('/stories/admin/all'),
        api.get('/categories')
      ]);
      setStories(storiesRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    if (!editingStory) {
      setFormData({ ...formData, title, slug: generateSlug(title) });
    } else {
      setFormData({ ...formData, title });
    }
  };

  const handleOpenModal = (story = null) => {
    if (story) {
      setEditingStory(story);
      setFormData({
        title: story.title || '',
        slug: story.slug || '',
        subTitle: story.subTitle || '',
        slogan: story.slogan || '',
        description: story.description || '',
        category: story.category ? story.category._id : '',
        coverImage: story.coverImage,
        images: story.images || [],
        videoUrls: story.videoUrls || [],
        highlights: story.highlights || [],
        eventDate: story.eventDate ? new Date(story.eventDate).toISOString().split('T')[0] : '',
        clientName: story.clientName || '',
        location: story.location || '',
        status: story.status || 'draft',
        isFeatured: story.isFeatured || false
      });
    } else {
      setEditingStory(null);
      setFormData({
        title: '', slug: '', subTitle: '', slogan: '', description: '', category: categories.length > 0 ? categories[0]._id : '', 
        coverImage: null, images: [], videoUrls: [], highlights: [], eventDate: '', clientName: '', location: '', status: 'draft', isFeatured: false
      });
    }
    setHighlightInput('');
    setVideoInput('');
    setIsModalOpen(true);
  };

  const handleMediaSelect = (media) => {
    if (mediaTarget === 'cover') {
      setFormData({ ...formData, coverImage: media });
    } else if (mediaTarget === 'gallery') {
      // Avoid duplicates
      if (!formData.images.find(img => img._id === media._id)) {
        setFormData({ ...formData, images: [...formData.images, media] });
      }
    }
    setIsMediaModalOpen(false);
  };

  const removeGalleryImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormData({ ...formData, highlights: [...formData.highlights, highlightInput.trim()] });
    setHighlightInput('');
  };

  const removeHighlight = (idx) => {
    setFormData({ ...formData, highlights: formData.highlights.filter((_, i) => i !== idx) });
  };

  const addVideo = () => {
    if (!videoInput.trim()) return;
    setFormData({ ...formData, videoUrls: [...formData.videoUrls, videoInput.trim()] });
    setVideoInput('');
  };

  const removeVideo = (idx) => {
    setFormData({ ...formData, videoUrls: formData.videoUrls.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.category || !formData.coverImage) {
      return toast.error('Title, Slug, Category, and Cover Image are required');
    }

    try {
      const payload = { 
        ...formData, 
        coverImage: formData.coverImage._id,
        images: formData.images.map(img => img._id)
      };
      
      if (editingStory) {
        await api.put(`/stories/${editingStory._id}`, payload);
        toast.success('Story updated');
      } else {
        await api.post('/stories', payload);
        toast.success('Story created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save story');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this story permanently?')) return;
    try {
      await api.delete(`/stories/${id}`);
      toast.success('Story deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete story');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Stories & Events</h1>
          <p className="text-muted-foreground mt-1">Manage individual shoots, weddings, or events.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" /> Add Story
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader size={36} text="Loading stories..." /></div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-muted/10">
          <p className="text-muted-foreground">No stories found. Start publishing!</p>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl shadow-sm hidden sm:block overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Cover</th>
                <th className="px-6 py-4">Title & Category</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {stories.map((story) => (
                <tr key={story._id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-5">
                    {story.coverImage ? (
                      <div className="w-20 h-16 rounded-lg overflow-hidden border shadow-sm group-hover:shadow-md transition-shadow">
                        <img src={story.coverImage.url} alt={story.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-16 bg-muted/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground border border-dashed">No Cover</div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-semibold text-foreground text-base mb-1">{story.title}</p>
                    <p className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/50">
                      {story.category?.name || 'Uncategorized'}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    {story.isFeatured ? (
                      <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm">Featured</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" onClick={() => handleOpenModal(story)} className="h-8 w-8 rounded-full">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(story._id)} className="h-8 w-8 rounded-full bg-destructive/10 text-destructive border-transparent hover:bg-destructive hover:text-destructive-foreground">
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

      {/* Main Story Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingStory ? "Edit Story" : "Create New Story"}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input label="Title *" value={formData.title} onChange={handleTitleChange} required />
              <Input label="Slug *" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} required />
              <Input label="Sub-title / Slogan" value={formData.subTitle} onChange={(e) => setFormData({...formData, subTitle: e.target.value})} placeholder="e.g. A Magical Evening" />
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Category *</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Client Name" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} />
                <Input label="Event Date" type="date" value={formData.eventDate} onChange={(e) => setFormData({...formData, eventDate: e.target.value})} />
              </div>
              <Input label="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Venice, Italy" />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  className="flex h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell the story behind this shoot..."
                />
              </div>

              <div className="border rounded-md p-4 bg-muted/20">
                <label className="block text-sm font-medium mb-2">Cover Image *</label>
                {formData.coverImage ? (
                  <div className="relative group rounded-md overflow-hidden h-32">
                    <img src={formData.coverImage.url} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <Button variant="secondary" size="sm" type="button" onClick={() => { setMediaTarget('cover'); setIsMediaModalOpen(true); }}>Change</Button>
                    </div>
                  </div>
                ) : (
                  <Button type="button" variant="outline" className="w-full py-8 border-dashed" onClick={() => { setMediaTarget('cover'); setIsMediaModalOpen(true); }}>
                    <ImageIcon className="mr-2 h-5 w-5 text-muted-foreground" /> Select Cover
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
            {/* Highlights List */}
            <div>
              <label className="text-sm font-medium mb-2 block">Story Highlights (Bullet Points)</label>
              <div className="flex gap-2 mb-3">
                <Input 
                  placeholder="e.g. Breathtaking sunset portraits" 
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                  className="flex-1"
                />
                <Button type="button" onClick={addHighlight} variant="secondary">Add</Button>
              </div>
              <ul className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {formData.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded-md border text-sm">
                    <span className="truncate pr-4">{highlight}</span>
                    <button type="button" onClick={() => removeHighlight(idx)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Videos List */}
            <div>
              <label className="text-sm font-medium mb-2 block">YouTube Embed Links</label>
              <div className="flex gap-2 mb-3">
                <Input 
                  placeholder="https://youtube.com/watch?v=..." 
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVideo())}
                  className="flex-1"
                />
                <Button type="button" onClick={addVideo} variant="secondary">Add</Button>
              </div>
              <ul className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {formData.videoUrls.map((vid, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded-md border text-sm">
                    <span className="truncate pr-4 text-xs font-mono">{vid}</span>
                    <button type="button" onClick={() => removeVideo(idx)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium">Full Gallery Images</label>
              <Button type="button" size="sm" variant="outline" onClick={() => { setMediaTarget('gallery'); setIsMediaModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Add Images
              </Button>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group rounded-md overflow-hidden aspect-square border">
                  <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-destructive/80 hover:bg-destructive rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {formData.images.length === 0 && (
                <div className="col-span-full py-8 text-center border-dashed border rounded-md text-muted-foreground text-sm">
                  No gallery images added yet. Click 'Add Images' to build your grid.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <div className="flex gap-4 items-center">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Status</label>
                <select 
                  className="flex h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input 
                  type="checkbox" 
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  className="rounded border-gray-300 h-4 w-4"
                />
                <label htmlFor="isFeatured" className="text-sm font-medium text-blue-600">Feature on Homepage?</label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Story</Button>
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

export default Stories;
