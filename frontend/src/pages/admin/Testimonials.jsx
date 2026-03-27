import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import MediaLibrary from './MediaLibrary';
import { Plus, Edit2, Trash2, Star, Image as ImageIcon } from 'lucide-react';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    clientName: '', content: '', rating: 5, avatar: null, isVisible: true
  });

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      // We use the public route that likely fetches all or we need an admin route. 
      // The backend testimonials route gets all if not filtered.
      const res = await api.get('/testimonials');
      setTestimonials(res.data);
    } catch (err) {
      toast.error('Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenModal = (testimonial = null) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        clientName: testimonial.clientName,
        content: testimonial.content,
        rating: testimonial.rating || 5,
        avatar: testimonial.avatar || null,
        isVisible: testimonial.isVisible !== undefined ? testimonial.isVisible : true
      });
    } else {
      setEditingTestimonial(null);
      setFormData({
        clientName: '', content: '', rating: 5, avatar: null, isVisible: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.content) {
      return toast.error('Client name and content are required');
    }

    try {
      const payload = { 
        ...formData, 
        avatar: formData.avatar ? formData.avatar._id : undefined 
      };
      
      if (editingTestimonial) {
        await api.put(`/testimonials/${editingTestimonial._id}`, payload);
        toast.success('Testimonial updated');
      } else {
        await api.post('/testimonials', payload);
        toast.success('Testimonial created');
      }
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save testimonial');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial permanently?')) return;
    try {
      await api.delete(`/testimonials/${id}`);
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch (err) {
      toast.error('Failed to delete testimonial');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground mt-1">Manage client reviews and feedback.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" /> Add Testimonial
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader size={36} text="Loading testimonials..." /></div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-muted/10">
          <p className="text-muted-foreground">No testimonials found. Add your first review!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial._id} className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between hover:border-border">
              <div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleOpenModal(testimonial)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full bg-destructive/10 text-destructive border-transparent hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDelete(testimonial._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 mb-4 mt-2 sm:mt-0">
                  {testimonial.avatar ? (
                    <img src={testimonial.avatar.url} alt={testimonial.clientName} className="h-12 w-12 rounded-full object-cover ring-2 ring-muted/50" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold ring-2 ring-primary/5">
                      {testimonial.clientName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">{testimonial.clientName}</h4>
                    <div className="flex text-amber-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < testimonial.rating ? 'fill-current' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 italic leading-relaxed">"{testimonial.content}"</p>
              </div>
              
              {!testimonial.isVisible && (
                <div className="mt-4 pt-4 border-t inline-flex items-center">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold tracking-wider rounded-md border">
                    Draft / Hidden
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Testimonial Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input 
            label="Client Name *" 
            value={formData.clientName}
            onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            required
          />
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Review Content *</label>
            <textarea 
              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Rating (1-5)</label>
            <input 
              type="number"
              min="1" max="5"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
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
            <label className="block text-sm font-medium mb-2">Avatar Image (Optional)</label>
            {formData.avatar ? (
              <div className="flex items-center gap-4">
                <img src={formData.avatar.url} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsMediaModalOpen(true)}>Change</Button>
                <Button variant="ghost" size="sm" type="button" onClick={() => setFormData({...formData, avatar: null})}>Remove</Button>
              </div>
            ) : (
              <Button type="button" variant="outline" className="w-full py-4 border-dashed" onClick={() => setIsMediaModalOpen(true)}>
                <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Select Avatar
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Testimonial</Button>
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
            setFormData({...formData, avatar: mediaParam});
            setIsMediaModalOpen(false);
          }} 
        />
      </Modal>
    </div>
  );
};

export default Testimonials;
