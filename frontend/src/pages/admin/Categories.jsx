import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import MediaLibrary from './MediaLibrary';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', coverImage: null, order: 0
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    if (!editingCategory) {
      setFormData({ ...formData, name, slug: generateSlug(name) });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        coverImage: category.coverImage,
        order: category.order || 0
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '', slug: '', description: '', coverImage: null, order: categories.length
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      return toast.error('Name and slug are required');
    }

    try {
      const payload = { 
        ...formData, 
        coverImage: formData.coverImage ? formData.coverImage._id : null 
      };
      
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category permanently? This may affect associated stories.')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your portfolio into collections.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader size={36} text="Loading categories..." /></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-muted/10">
          <p className="text-muted-foreground">No categories found. Start organizing your work!</p>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl shadow-sm hidden sm:block overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Cover</th>
                <th className="px-6 py-4">Name & Slug</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-5">
                    {category.coverImage ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border shadow-sm group-hover:shadow-md transition-shadow">
                        <img src={category.coverImage.url} alt={category.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-muted/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground border border-dashed">No Cover</div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-semibold text-foreground text-base mb-1">{category.name}</p>
                    <p className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/50">/{category.slug}</p>
                  </td>
                  <td className="px-6 py-5 font-medium text-muted-foreground">
                    {category.order}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" onClick={() => handleOpenModal(category)} className="h-8 w-8 rounded-full">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(category._id)} className="h-8 w-8 rounded-full bg-destructive/10 text-destructive border-transparent hover:bg-destructive hover:text-destructive-foreground">
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

      {/* Main Category Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCategory ? "Edit Category" : "Create New Category"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input 
            label="Name *" 
            value={formData.name}
            onChange={handleNameChange}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Slug *" 
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              required
            />
            <Input 
              label="Order" 
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({...formData, order: e.target.value})}
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="mt-4 border rounded-md p-4 bg-muted/20">
            <label className="block text-sm font-medium mb-2">Cover Image (Optional)</label>
            {formData.coverImage ? (
              <div className="relative group rounded-md overflow-hidden aspect-video">
                <img src={formData.coverImage.url} alt="Selected" className="w-full h-full object-cover text-center" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setIsMediaModalOpen(true)}>Change</Button>
                  <Button variant="destructive" size="sm" type="button" onClick={() => setFormData({...formData, coverImage: null})}>Remove</Button>
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
            <Button type="submit">Save Category</Button>
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
            setFormData({...formData, coverImage: mediaParam});
            setIsMediaModalOpen(false);
          }} 
        />
      </Modal>
    </div>
  );
};

export default Categories;
