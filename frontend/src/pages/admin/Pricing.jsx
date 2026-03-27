import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import { Plus, Edit2, Trash2, CheckCircle2, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Pricing = () => {
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages'); // 'packages' or 'categories'
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Package Form State
  const [formData, setFormData] = useState({
    packageName: '', category: '', isPopular: false, sellingPrice: '', 
    actualPrice: '', description: '', features: [], addOns: [], status: 'active', order: 0
  });
  const [featureInput, setFeatureInput] = useState('');
  const [addOnInput, setAddOnInput] = useState('');

  // Category Form State
  const [categoryData, setCategoryData] = useState({
    name: '', slug: '', description: '', order: 0
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [pkgsRes, catsRes] = await Promise.all([
        api.get('/pricing/admin/all'),
        api.get('/pricing/categories')
      ]);
      setPackages(pkgsRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      toast.error('Failed to load pricing data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Package Handlers
  const handleOpenPackageModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        packageName: pkg.packageName,
        category: pkg.category?._id || '',
        isPopular: pkg.isPopular || false,
        sellingPrice: pkg.sellingPrice.toString(),
        actualPrice: pkg.actualPrice.toString(),
        description: pkg.description || '',
        features: pkg.features || [],
        addOns: pkg.addOns || [],
        status: pkg.status || 'active',
        order: pkg.order || 0
      });
    } else {
      setEditingPackage(null);
      setFormData({
        packageName: '', category: categories[0]?._id || '', isPopular: false, sellingPrice: '', 
        actualPrice: '', description: '', features: [], addOns: [], status: 'active', order: packages.length
      });
    }
    setFeatureInput('');
    setAddOnInput('');
    setIsModalOpen(true);
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
    setFeatureInput('');
  };

  const removeFeature = (index) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  const addAddOn = () => {
    if (!addOnInput.trim()) return;
    setFormData({ ...formData, addOns: [...formData.addOns, addOnInput.trim()] });
    setAddOnInput('');
  };

  const removeAddOn = (index) => {
    setFormData({ ...formData, addOns: formData.addOns.filter((_, i) => i !== index) });
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    if (!formData.packageName || !formData.category || !formData.sellingPrice || !formData.actualPrice) {
      return toast.error('Required fields: Name, Category, Prices');
    }

    try {
      const payload = { 
        ...formData, 
        sellingPrice: Number(formData.sellingPrice),
        actualPrice: Number(formData.actualPrice)
      };
      
      if (editingPackage) {
        await api.put(`/pricing/${editingPackage._id}`, payload);
        toast.success('Package updated');
      } else {
        await api.post('/pricing', payload);
        toast.success('Package created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save package');
    }
  };

  // Category Handlers
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryData({
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        order: cat.order || 0
      });
    } else {
      setEditingCategory(null);
      setCategoryData({
        name: '', slug: '', description: '', order: categories.length
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryData.name || !categoryData.slug) return toast.error('Name and Slug required');

    try {
      if (editingCategory) {
        await api.put(`/pricing/categories/${editingCategory._id}`, categoryData);
        toast.success('Category updated');
      } else {
        await api.post('/pricing/categories', categoryData);
        toast.success('Category created');
      }
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await api.delete(`/pricing/${id}`);
      toast.success('Package removed');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Packages in this category might break.')) return;
    try {
      await api.delete(`/pricing/categories/${id}`);
      toast.success('Category removed');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/pricing/status/${id}`);
      fetchData();
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Pricing Management</h1>
          <p className="text-muted-foreground mt-1">Configure service categories and tiered photography packages.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleOpenCategoryModal()}>
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
          <Button onClick={() => handleOpenPackageModal()}>
            <Plus className="h-4 w-4 mr-2" /> Add Package
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button 
          onClick={() => setActiveTab('packages')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'packages' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Packages
          {activeTab === 'packages' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'categories' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Categories
          {activeTab === 'categories' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader size={36} text="Loading data..." /></div>
      ) : activeTab === 'packages' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.length === 0 ? (
            <div className="col-span-full py-20 text-center border-dashed border rounded-xl bg-muted/10 text-muted-foreground">No packages found.</div>
          ) : (
            packages.map((pkg) => (
              <div key={pkg._id} className={`bg-card border rounded-2xl p-6 shadow-sm relative group flex flex-col justify-between ${pkg.isPopular ? 'ring-2 ring-primary border-transparent' : 'hover:border-primary/50'} transition-all`}>
                {pkg.isPopular && (
                  <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-[10px] font-bold uppercase py-1 px-3 rounded-full shadow-sm">Popular Choice</span>
                )}
                
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background" onClick={() => handleOpenPackageModal(pkg)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full bg-destructive/10 text-destructive border-transparent hover:bg-destructive hover:text-white" onClick={() => handleDeletePackage(pkg._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                      {pkg.category?.name || 'Uncategorized'}
                    </span>
                    <button onClick={() => toggleStatus(pkg._id)} className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${pkg.status === 'active' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-muted text-muted-foreground'}`}>
                      {pkg.status}
                    </button>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground">{pkg.packageName}</h3>
                  <div className="mt-4 mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight">₹{pkg.sellingPrice?.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground line-through">₹{pkg.actualPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6 border-t pt-4">
                    {pkg.features?.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-center text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-primary mr-2 shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                    {pkg.features?.length > 4 && <li className="text-[10px] text-primary font-medium tracking-tight">+ {pkg.features.length - 4} more features</li>}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Categories Tab Content */
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4 font-semibold">{cat.name}</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{cat.slug}</td>
                  <td className="px-6 py-4">{cat.order}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenCategoryModal(cat)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteCategory(cat._id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Package Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPackage ? "Edit Package" : "Create Package"} maxWidth="max-w-3xl">
        <form onSubmit={handlePackageSubmit} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input label="Package Name *" value={formData.packageName} onChange={(e) => setFormData({...formData, packageName: e.target.value})} required placeholder="e.g. Essential Wedding" />
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Category *</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Selling Price (₹) *" type="number" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} required />
                <Input label="Actual Price (₹) *" type="number" value={formData.actualPrice} onChange={(e) => setFormData({...formData, actualPrice: e.target.value})} required />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Brief Description</label>
                <textarea 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isPopular" checked={formData.isPopular} onChange={(e) => setFormData({...formData, isPopular: e.target.checked})} className="h-4 w-4 text-primary" />
                  <label htmlFor="isPopular" className="text-sm font-medium text-primary">⭐ Mark as Most Popular</label>
                </div>
                <div className="flex items-center gap-2">
                   <label className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Order:</label>
                   <input type="number" className="w-12 text-xs border rounded p-1" value={formData.order} onChange={(e) => setFormData({...formData, order: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Features List */}
              <div className="border rounded-xl p-4 bg-muted/5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Package Features</label>
                <div className="flex gap-2">
                  <Input placeholder="e.g. 2 photographers" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} className="flex-1" />
                  <Button type="button" size="sm" onClick={addFeature}>Add</Button>
                </div>
                <ul className="mt-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                  {formData.features.map((f, i) => (
                    <li key={i} className="flex items-center justify-between text-sm bg-background border p-2 rounded-lg group">
                      <span className="truncate pr-4">{f}</span>
                      <button type="button" onClick={() => removeFeature(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Add-ons List */}
              <div className="border rounded-xl p-4 bg-muted/5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Optional Add-ons</label>
                <div className="flex gap-2">
                  <Input placeholder="e.g. Drone shoot (+₹5k)" value={addOnInput} onChange={(e) => setAddOnInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAddOn())} className="flex-1" />
                  <Button type="button" size="sm" variant="outline" onClick={addAddOn}>Add</Button>
                </div>
                <ul className="mt-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                  {formData.addOns.map((a, i) => (
                    <li key={i} className="flex items-center justify-between text-sm bg-background border border-dashed border-primary/20 p-2 rounded-lg">
                      <span className="truncate pr-4">{a}</span>
                      <button type="button" onClick={() => removeAddOn(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Package</Button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title={editingCategory ? "Edit Category" : "Add Category"} maxWidth="max-w-md">
        <form onSubmit={handleCategorySubmit} className="space-y-4 pt-2">
          <Input label="Category Name *" value={categoryData.name} onChange={(e) => setCategoryData({...categoryData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} required />
          <Input label="Slug *" value={categoryData.slug} onChange={(e) => setCategoryData({...categoryData, slug: e.target.value})} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Description</label>
            <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={categoryData.description} onChange={(e) => setCategoryData({...categoryData, description: e.target.value})} />
          </div>
          <Input label="Order" type="number" value={categoryData.order} onChange={(e) => setCategoryData({...categoryData, order: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Category</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Pricing;
