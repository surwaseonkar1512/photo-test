import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import {
  Phone, Mail, Calendar, MapPin,
  MoreVertical, CheckCircle2,
  ChevronRight, XCircle,
  DollarSign, Clock, Download,
  Trash2, Save, ExternalLink, Image as ImageIcon,
  Plus,
  FileText,
  Send
} from 'lucide-react';
import { format } from 'date-fns';

const COLUMNS = [
  { id: 'new', title: 'New Leads', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  { id: 'quotation-sent', title: 'Quotation Sent', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
  { id: 'won', title: 'Won / Confirmed', color: 'bg-green-500/10 text-green-600 border-green-200' },
  { id: 'lost', title: 'Lost', color: 'bg-red-500/10 text-red-600 border-red-200' },
];

const CRM = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadQuotations, setLeadQuotations] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [generatedQuotation, setGeneratedQuotation] = useState(null);

  // Quote Generation State
  const [quoteForm, setQuoteForm] = useState({
    actualPrice: 0,
    sellingPrice: 0,
    discount: 0,
    gstPercentage: 18,
    gstType: 'excluded', // or 'included'
    bullets: ['Full day coverage', '400+ color graded photos', 'Cinematic highlight video (5-7 mins)', 'Premium Flush Mount Album']
  });
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/leads');
      setLeads(res.data);
    } catch (err) {
      toast.error('Failed to load CRM data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeadQuotations = async (leadId) => {
    try {
      const res = await api.get(`/quotations/lead/${leadId}`);
      setLeadQuotations(res.data);
    } catch (err) {
      console.error('Failed to fetch lead quotations', err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (selectedLead) {
      fetchLeadQuotations(selectedLead._id);
    }
  }, [selectedLead]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const leadId = draggableId;
    const newStatus = destination.droppableId;

    // Optimistic Update
    const updatedLeads = leads.map(l => l._id === leadId ? { ...l, status: newStatus } : l);
    setLeads(updatedLeads);

    try {
      await api.patch(`/leads/${leadId}/status`, { status: newStatus });
      toast.success(`Moved to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
      fetchLeads(); // Revert on failure
    }
  };

  const updateLeadDetails = async (id, data) => {
    try {
      const res = await api.put(`/leads/${id}`, data);
      setLeads(leads.map(l => l._id === id ? res.data : l));
      setSelectedLead(res.data);
      toast.success('Lead updated successfully');
    } catch (err) {
      toast.error('Failed to update lead');
    }
  };

  const generateQuotation = async () => {
    try {
      setIsGeneratingQuote(true);
      const gstAmount = quoteForm.gstType === 'excluded'
        ? (Number(quoteForm.sellingPrice) * Number(quoteForm.gstPercentage)) / 100
        : 0;

      const finalAmount = Number(quoteForm.sellingPrice) + gstAmount;

      const payload = {
        leadId: selectedLead._id,
        templateData: {
          clientName: selectedLead.name,
          clientEmail: selectedLead.email,
          clientPhone: selectedLead.phone,
          location: selectedLead.location || 'N/A',
          eventType: selectedLead.category,
          eventDate: selectedLead.eventDate ? format(new Date(selectedLead.eventDate), 'PPP') : 'N/A',
          services: quoteForm.bullets
        },
        actualPrice: Number(quoteForm.actualPrice),
        discount: Number(quoteForm.discount),
        sellingPrice: Number(quoteForm.sellingPrice),
        gstPercentage: Number(quoteForm.gstPercentage),
        gstType: quoteForm.gstType,
        gst: gstAmount,
        finalAmount: finalAmount
      };

      const res = await api.post('/quotations', payload);
      setGeneratedQuotation(res.data);
      setLeadQuotations([res.data, ...leadQuotations]);
      toast.success('Quotation generated successfully!');

      // Update local lead state since status changed to quotation-sent
      const updatedLead = { ...selectedLead, status: 'quotation-sent', totalAmount: finalAmount };
      setLeads(leads.map(l => l._id === selectedLead._id ? updatedLead : l));
      setSelectedLead(updatedLead);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate quotation');
    } finally {
      setIsGeneratingQuote(false);
    }
  };

  const sendQuotationEmail = async (quoteId) => {
    const qId = quoteId || generatedQuotation?._id;
    if (!qId) return;
    try {
      setIsSendingEmail(true);
      await api.post('/quotations/send-email', { quotationId: qId });
      toast.success('Quotation sent to client email!');
    } catch (err) {
      toast.error('Failed to send email. Check SMTP settings.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const shareOnWhatsApp = (lead, quoteUrl) => {
    const eventInfo = lead.category ? ` for your ${lead.category}` : '';
    const message = `Hi ${lead.name}, 📸\n\nIt was a pleasure connecting! Here is your custom photography quotation${eventInfo}.\n\n📄 View Quotation PDF: ${quoteUrl}\n\nLooking forward to capturing your beautiful moments!\n\n- Visionary Studio`;
    const whatsappUrl = `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      setLeads(leads.filter(l => l._id !== id));
      setIsDetailsOpen(false);
      toast.success('Lead removed');
    } catch (err) {
      toast.error('Failed to delete lead');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader size={40} text="Loading CRM Pipeline..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] space-y-6">
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">CRM Pipeline</h1>
          <p className="text-muted-foreground mt-1">Manage your business funnel and conversion lifecycle.</p>
        </div>
        <Button onClick={() => setIsAddLeadOpen(true)} className="flex items-center gap-2 rounded-2xl">
          <Plus className="h-4 w-4" /> Add Manual Lead
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 px-2 scrollbar-hide">
          {COLUMNS.map(column => (
            <div key={column.id} className="flex-shrink-0 w-80 flex flex-col bg-muted/30 rounded-3xl border border-border/60">
              <div className={`p-5 flex justify-between items-center rounded-t-3xl border-b bg-white`}>
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${column.color.split(' ')[0]}`} />
                  <h3 className="font-bold text-sm tracking-tight">{column.title}</h3>
                </div>
                <span className="bg-muted px-3 py-0.5 rounded-full text-xs font-bold text-muted-foreground">
                  {leads.filter(l => l.status === column.id).length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`p-4 flex-1 overflow-y-auto space-y-4 min-h-[100px] transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                  >
                    {leads
                      .filter(l => l.status === column.id)
                      .map((lead, index) => (
                        <Draggable key={lead._id} draggableId={lead._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => { setSelectedLead(lead); setIsDetailsOpen(true); }}
                              className={`bg-card border rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group scale-100 ${snapshot.isDragging ? 'rotate-2 shadow-2xl ring-2 ring-primary border-transparent' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-md leading-tight group-hover:text-primary transition-colors">{lead.name}</h4>
                                <MoreVertical className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100" />
                              </div>

                              <div className="space-y-2 mb-4">
                                {lead.category && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                      {lead.category}
                                    </div>
                                    {lead.source !== 'contact' && (
                                      <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${lead.source === 'pricing' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {lead.source}
                                      </div>
                                    )}
                                  </div>
                                )}
                                <div className="flex items-center text-xs text-muted-foreground gap-2">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{lead.location || 'No location set'}</span>
                                </div>
                                {lead.eventDate && (
                                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                                    <Clock className="h-3 w-3 shrink-0" />
                                    <span>{format(new Date(lead.eventDate), 'MMM d, yyyy')}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-dashed">
                                <div className="flex -space-x-2">
                                  <div className="h-6 w-6 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary">
                                    {lead.name.charAt(0)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {lead.totalAmount > 0 && (
                                    <p className="text-[10px] font-bold text-primary">₹{lead.totalAmount.toLocaleString()}</p>
                                  )}
                                  <p className="text-[9px] text-muted-foreground leading-none">{format(new Date(lead.createdAt), 'MMM d')}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Lead Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Manage Lead Information"
        maxWidth="max-w-4xl"
      >
        {selectedLead && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-2">

            {/* Left Col: Info & Actions */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between border-b pb-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-2xl font-serif text-primary">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-bold tracking-tight">{selectedLead.name}</h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${COLUMNS.find(c => c.id === selectedLead.status)?.color}`}>
                        {selectedLead.status}
                      </span>
                      <span>•</span>
                      <span>Source: <span className="capitalize text-foreground font-medium">{selectedLead.source}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Contact Details</h4>
                  <div className="space-y-3">
                    <a href={`mailto:${selectedLead.email}`} className="flex items-center p-3 rounded-2xl bg-muted/30 hover:bg-primary/5 hover:text-primary transition-all border border-transparent hover:border-primary/10">
                      <Mail className="h-4 w-4 mr-3 opacity-60" />
                      <span className="text-sm font-medium">{selectedLead.email}</span>
                    </a>
                    {selectedLead.phone && (
                      <a href={`tel:${selectedLead.phone}`} className="flex items-center p-3 rounded-2xl bg-muted/30 hover:bg-primary/5 hover:text-primary transition-all border border-transparent hover:border-primary/10">
                        <Phone className="h-4 w-4 mr-3 opacity-60" />
                        <span className="text-sm font-medium">{selectedLead.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Event Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 rounded-2xl bg-muted/30 border border-transparent">
                      <Calendar className="h-4 w-4 mr-3 opacity-60" />
                      <span className="text-sm font-medium">{selectedLead.eventDate ? format(new Date(selectedLead.eventDate), 'PPPP') : 'Date not set'}</span>
                    </div>
                    <div className="flex items-center p-3 rounded-2xl bg-muted/30 border border-transparent">
                      <MapPin className="h-4 w-4 mr-3 opacity-60" />
                      <span className="text-sm font-medium truncate">{selectedLead.location || 'Location not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Notes & History</h4>
                <textarea
                  className="w-full min-h-[100px] rounded-3xl bg-muted/30 border-none px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Add private notes about this client interaction..."
                  defaultValue={selectedLead.notes}
                  onBlur={(e) => updateLeadDetails(selectedLead._id, { notes: e.target.value })}
                />
              </div>

              {/* Quotation History */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Quotation History</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-primary">{leadQuotations.length} total</span>
                    {leadQuotations.length > 0 && (
                      <button
                        onClick={() => { setGeneratedQuotation(null); setIsQuoteModalOpen(true); }}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> New Quote
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {leadQuotations.length === 0 ? (
                    <div className="p-10 border border-dashed rounded-[2.5rem] text-center bg-muted/5 group hover:bg-primary/5 transition-all">
                      <FileText className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3 group-hover:text-primary/20 transition-colors" />
                      <p className="text-xs text-muted-foreground mb-4">No quotations generated yet</p>
                      <Button
                        variant="outline"
                        onClick={() => { setGeneratedQuotation(null); setIsQuoteModalOpen(true); }}
                        className="rounded-2xl border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white"
                      >
                        + Generate First Quotation
                      </Button>
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                      {leadQuotations.map(quote => (
                        <div key={quote._id} className="p-4 bg-muted/40 rounded-3xl border border-transparent hover:border-border hover:bg-white transition-all group shadow-sm hover:shadow-md">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-xs font-bold font-serif">{quote.quotationNumber}</p>
                              <p className="text-[10px] text-muted-foreground">{format(new Date(quote.createdAt), 'MMMM d, yyyy')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-primary">₹{quote.finalAmount.toLocaleString()}</p>
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${quote.status === 'sent' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{quote.status}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); window.open(quote.pdfUrl, '_blank'); }}
                              className="flex items-center justify-center py-2.5 rounded-2xl bg-white border text-[9px] font-bold uppercase tracking-wider hover:text-primary hover:border-primary transition-all shadow-sm active:scale-95"
                            >
                              <ImageIcon className="h-3 w-3 mr-1.5" /> View Quotation
                            </button>
                            <button
                              onClick={() => shareOnWhatsApp(selectedLead, quote.pdfUrl)}
                              className="flex items-center justify-center py-2.5 rounded-2xl bg-white border text-[9px] font-bold uppercase tracking-wider text-[#128C7E] hover:bg-[#25D366] hover:text-white transition-all shadow-sm active:scale-95"
                            >
                              <Send className="h-3 w-3 mr-1.5" /> WhatsApp
                            </button>
                            <button
                              onClick={() => sendQuotationEmail(quote._id)}
                              className="flex items-center justify-center py-2.5 rounded-2xl bg-white border text-[9px] font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
                            >
                              <Mail className="h-3 w-3 mr-1.5" /> Email
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t font-serif">
                <Button variant="ghost" className="text-red-500 hover:bg-red-50 rounded-xl" onClick={() => handleDelete(selectedLead._id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Lead
                </Button>
                <div className="flex gap-2">
                  {selectedLead.status !== 'won' && (
                    <Button onClick={() => updateLeadDetails(selectedLead._id, { status: 'won' })} className="bg-green-600 hover:bg-green-700 text-white rounded-2xl">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Deal
                    </Button>
                  )}
                  <Button onClick={() => { setGeneratedQuotation(null); setIsQuoteModalOpen(true); }} variant="outline" className="rounded-2xl border-primary text-primary hover:bg-primary/5">
                    <FileText className="h-4 w-4 mr-2" /> Generate Quotation
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Col: Financial Tracking */}
            <div className="space-y-8 bg-muted/20 p-6 rounded-[2rem] border border-border/50">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-6">Payment Tracking</h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Total Project Value</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="number"
                        className="w-full bg-white border rounded-2xl pl-10 pr-4 py-3 text-lg font-bold"
                        defaultValue={selectedLead.totalAmount}
                        onBlur={(e) => updateLeadDetails(selectedLead._id, { totalAmount: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-green-600">Advance Received</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                      <input
                        type="number"
                        className="w-full bg-white border rounded-2xl pl-10 pr-4 py-3 text-lg font-bold text-green-600"
                        defaultValue={selectedLead.receivedAmount}
                        onBlur={(e) => updateLeadDetails(selectedLead._id, { receivedAmount: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="pt-6 border-t mt-4 text-center">
                    <p className="text-[10px] uppercase font-bold text-red-400">Balance Remaining</p>
                    <h3 className="text-3xl font-black mt-1">₹{selectedLead.remainingAmount?.toLocaleString()}</h3>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Quick Actions</h4>
                {selectedLead.phone && (
                  <button
                    onClick={() => window.open(`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`, '_blank')}
                    className="w-full py-4 rounded-2xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                  >
                    Contact on WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Add Lead Modal */}
      <Modal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
        title="Add New Lead Manually"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          try {
            const res = await api.post('/leads', { ...data, source: 'manual' });
            setLeads([res.data, ...leads]);
            setIsAddLeadOpen(false);
            toast.success('Lead added successfully');
          } catch (err) {
            toast.error('Failed to add lead');
          }
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name *" name="name" required />
            <Input label="Phone" name="phone" />
          </div>
          <Input label="Email *" name="email" type="email" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" name="category" placeholder="e.g. Wedding" />
            <Input label="Location" name="location" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Event Date</label>
            <input type="date" name="eventDate" className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
          </div>
          <Button type="submit" className="w-full py-4">Save New Lead</Button>
        </form>
      </Modal>

      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title={generatedQuotation ? "Quotation Ready!" : "Professional Quotation Builder"}
        maxWidth={generatedQuotation ? "max-w-md" : "max-w-xl"}
      >
        {!generatedQuotation ? (
          <div className="space-y-6">
            <div className="p-4 bg-muted/30 rounded-2xl border flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Client Information</p>
                <p className="text-sm font-bold">{selectedLead?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedLead?.location}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Lead ID</p>
                <p className="text-xs font-mono">{selectedLead?._id.substring(18)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Service Highlights</h4>
              {quoteForm.bullets.map((bullet, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    value={bullet}
                    onChange={(e) => {
                      const newBullets = [...quoteForm.bullets];
                      newBullets[idx] = e.target.value;
                      setQuoteForm({ ...quoteForm, bullets: newBullets });
                    }}
                    className="flex-1 bg-muted/20 border-border border rounded-xl px-4 py-2 text-sm"
                  />
                  <button
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                    onClick={() => {
                      const newBullets = quoteForm.bullets.filter((_, i) => i !== idx);
                      setQuoteForm({ ...quoteForm, bullets: newBullets });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setQuoteForm({ ...quoteForm, bullets: [...quoteForm.bullets, 'New Service Item'] })}
                className="w-full py-2 border border-dashed border-primary/40 rounded-xl text-xs font-bold text-primary hover:bg-primary/5 transition-all"
              >
                + Add More Service Details
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Actual Menu Price</label>
                  <input
                    type="number"
                    value={quoteForm.actualPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setQuoteForm({ ...quoteForm, actualPrice: val, sellingPrice: val - quoteForm.discount });
                    }}
                    className="w-full bg-white border rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Discount (₹)</label>
                  <input
                    type="number"
                    value={quoteForm.discount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setQuoteForm({ ...quoteForm, discount: val, sellingPrice: quoteForm.actualPrice - val });
                    }}
                    className="w-full bg-white border rounded-xl px-3 py-2 text-sm text-red-500 font-medium"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Final Selling Price (Before GST)</label>
                  <input
                    type="number"
                    value={quoteForm.sellingPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setQuoteForm({ ...quoteForm, sellingPrice: val, discount: quoteForm.actualPrice - val });
                    }}
                    className="w-full bg-white border border-primary/30 rounded-xl px-3 py-2 text-sm font-bold text-primary"
                  />
                </div>
                <div className="flex items-center justify-between p-2 mt-2 bg-white rounded-xl border border-dashed">
                  <span className="text-[10px] font-bold uppercase">GST Type</span>
                  <div className="flex gap-1 bg-muted p-0.5 rounded-lg">
                    <button
                      onClick={() => setQuoteForm({ ...quoteForm, gstType: 'included' })}
                      className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${quoteForm.gstType === 'included' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'}`}
                    >INC</button>
                    <button
                      onClick={() => setQuoteForm({ ...quoteForm, gstType: 'excluded' })}
                      className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${quoteForm.gstType === 'excluded' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'}`}
                    >EXC</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">GST Percentage (%)</label>
                <select
                  value={quoteForm.gstPercentage}
                  onChange={(e) => setQuoteForm({ ...quoteForm, gstPercentage: Number(e.target.value) })}
                  className="w-full bg-white border rounded-xl px-3 py-2 text-sm"
                  disabled={quoteForm.gstType === 'included'}
                >
                  <option value={0}>0% (Exempted)</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                </select>
              </div>
              <div className="text-right flex flex-col justify-end">
                <p className="text-[10px] uppercase font-bold text-primary/70">Final Quoted Total</p>
                <p className="text-3xl font-black text-primary">₹{(
                  quoteForm.gstType === 'excluded'
                    ? Number(quoteForm.sellingPrice) + (Number(quoteForm.sellingPrice) * Number(quoteForm.gstPercentage) / 100)
                    : Number(quoteForm.sellingPrice)
                ).toLocaleString()}</p>
              </div>
            </div>

            <Button
              onClick={generateQuotation}
              className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-primary to-indigo-600 text-white font-bold uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
              isLoading={isGeneratingQuote}
            >
              <ImageIcon className="h-5 w-5" /> Save & Generate Image
            </Button>
          </div>
        ) : (
          <div className="space-y-8 text-center py-4">
            <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold">Successfully Generated</h3>
              <p className="text-muted-foreground mt-2">Quotation #{generatedQuotation.quotationNumber} is ready to be shared with {selectedLead.name}.</p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full py-4 rounded-2xl bg-foreground text-background font-bold tracking-widest uppercase text-xs"
                onClick={() => window.open(generatedQuotation.pdfUrl, '_blank')}
              >
                <ImageIcon className="h-4 w-4 mr-2" /> Preview Quotation Image
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="bg-[#25D366] text-white hover:bg-[#128C7E] rounded-2xl font-bold uppercase text-[10px] tracking-widest"
                  onClick={() => shareOnWhatsApp(selectedLead, generatedQuotation.pdfUrl)}
                >
                  <Send className="h-3.5 w-3.5 mr-2" /> WhatsApp
                </Button>
                <Button
                  className="bg-primary text-white hover:bg-primary/90 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
                  onClick={sendQuotationEmail}
                  isLoading={isSendingEmail}
                >
                  <Mail className="h-3.5 w-3.5 mr-2" /> Send Email
                </Button>
              </div>
            </div>

            <button
              onClick={() => setIsQuoteModalOpen(false)}
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              Close & Open Pipeline
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CRM;
