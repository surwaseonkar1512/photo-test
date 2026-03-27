import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { UploadCloud, Trash2, Search, Link as LinkIcon, Files } from 'lucide-react';

const MediaLibrary = ({ isSelector = false, onSelect }) => {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/media');
      setMedia(res.data);
    } catch (err) {
      toast.error('Failed to load media');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'gallery');

    try {
      setIsUploading(true);
      await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Image uploaded successfully');
      fetchMedia();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image permanently?')) return;
    
    try {
      await api.delete(`/media/${id}`);
      setMedia(media.filter(img => img._id !== id));
      toast.success('Image deleted');
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const filteredMedia = media.filter(m => 
    m.public_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${!isSelector ? 'animate-in fade-in slide-in-from-bottom-4 duration-500' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        {!isSelector && (
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Media Library</h1>
            <p className="text-muted-foreground mt-1">Manage all your master images in one place.</p>
          </div>
        )}
        
        {/* Upload Button visible in both modes */}
        <div className={isSelector ? "w-full flex justify-end" : ""}>
          <input 
            type="file" 
            id={`file-upload-${isSelector ? 'modal' : 'page'}`} 
            className="hidden" 
            accept="image/*,video/*"
            onChange={handleUpload}
          />
          <label htmlFor={`file-upload-${isSelector ? 'modal' : 'page'}`}>
            <span className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 h-10 py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm">
              {isUploading ? <Loader size={18} className="mr-2 text-primary-foreground" /> : <UploadCloud className="h-4 w-4 mr-2" />}
              Upload New File
            </span>
          </label>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input 
          type="text"
          placeholder="Search by filename..." 
          className="flex h-10 w-full rounded-md border border-input bg-transparent pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader size={36} text="Loading media..." /></div>
      ) : filteredMedia.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/20">
          <Files className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No media found</h3>
          <p className="text-muted-foreground text-sm">Upload some files to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div 
              key={item._id} 
              className="group relative rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all aspect-square"
            >
              <img 
                src={item.url.replace('/upload/', '/upload/w_300,q_auto/')} // Cloudinary auto optimization
                alt={item.public_id}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {isSelector ? (
                  <Button size="sm" onClick={() => onSelect(item)}>
                    Select
                  </Button>
                ) : (
                  <>
                    <button 
                      onClick={() => copyUrl(item.url)}
                      className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors text-white"
                      title="Copy URL"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="p-2 bg-destructive/80 hover:bg-destructive rounded-full transition-colors text-white"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
