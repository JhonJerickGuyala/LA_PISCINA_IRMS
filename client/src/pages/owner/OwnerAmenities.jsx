import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Image as ImageIcon, X, Save, UploadCloud, Filter, Layers } from 'lucide-react';

const OwnerAmenities = ({ amenities, fetchAmenities }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // --- FILTER STATE ---
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [form, setForm] = useState({
    name: '', 
    description: '', 
    price: '', 
    type: 'kubo', 
    capacity: '', 
    quantity: 0, 
    booked: 0,
    available: true,
  });

  const categories = ['All', 'Kubo', 'Cabin', 'Table', 'Pool', 'Room'];

  const filteredAmenities = useMemo(() => {
    if (selectedCategory === 'All') return amenities;
    return amenities.filter(a => a.type?.toLowerCase() === selectedCategory.toLowerCase());
  }, [amenities, selectedCategory]);

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', type: 'kubo', capacity: '', quantity: 0, booked: 0, available: true });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const startEditing = (amenity) => {
    setEditingId(amenity.id);
    setIsAdding(false);
    setForm({
      name: amenity.name,
      description: amenity.description,
      price: amenity.price,
      type: amenity.type || amenity.category,
      capacity: amenity.capacity,
      quantity: (amenity.quantity !== undefined && amenity.quantity !== null) ? amenity.quantity : 0, 
      booked: amenity.booked || 0,
      available: amenity.available,
    });
    setPreviewUrl(amenity.image);
    setSelectedFile(null);
  };

  const handleSave = async (id = null) => {
    try {
      if(!form.name || !form.price) {
          alert("Please fill in Name and Price.");
          return;
      }

      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.type);
      formData.append('capacity', form.capacity);
      
      const finalQty = form.quantity !== '' ? form.quantity : 0;
      formData.append('quantity', finalQty);
      
      formData.append('status', finalQty > form.booked ? 'available' : 'unavailable');
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (id) {
        await axios.put(`http://localhost:5000/api/owner/amenities/${id}`, formData, config);
      } else {
        await axios.post('http://localhost:5000/api/owner/amenities', formData, config);
      }
      
      await fetchAmenities();
      resetForm();
    } catch (error) {
      alert('Error saving amenity: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sigurado ka bang gusto mong i-delete ito?')) {
      try {
        await axios.delete(`http://localhost:5000/api/owner/amenities/${id}`);
        await fetchAmenities();
      } catch {
        alert('Error deleting amenity');
      }
    }
  };

  const getAvailabilityDisplay = (amenity) => {
    const total = (amenity.quantity !== undefined && amenity.quantity !== null) ? amenity.quantity : 0;
    const used = amenity.booked || 0;
    const remaining = total - used;
    const isFullyBooked = remaining <= 0;

    return {
        text: isFullyBooked ? 'FULLY BOOKED' : `${remaining} / ${total} LEFT`,
        colorClass: isFullyBooked ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white',
        pulse: !isFullyBooked && total > 0 
    };
  };

  const renderFormFields = () => (
    <div className="space-y-3">
       {/* Image Upload */}
       <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center group hover:border-lp-orange transition-colors cursor-pointer">
          {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
              <div className="text-center text-gray-400">
                  <UploadCloud size={32} className="mx-auto mb-1" />
                  <span className="text-xs font-medium">Click to Upload Image</span>
              </div>
          )}
          <input type="file" onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
          <div className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
             <Edit size={14} className="text-lp-orange"/>
          </div>
       </div>

       {/* Basic Info */}
       <input 
         type="text" placeholder="Amenity Name" value={form.name} 
         onChange={e => setForm({...form, name: e.target.value})} 
         className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lp-orange focus:border-transparent outline-none transition-all"
       />
       
       <textarea 
         placeholder="Description" rows="2" value={form.description} 
         onChange={e => setForm({...form, description: e.target.value})} 
         className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lp-orange focus:border-transparent outline-none text-sm transition-all"
       />

       {/* Numeric Fields */}
       <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Price (₱)</label>
            <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md focus:ring-lp-orange outline-none" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Capacity (Pax per unit)</label>
            <input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md focus:ring-lp-orange outline-none" />
          </div>
       </div>

       {/* Inventory & Type */}
       <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Total Units (Inventory)</label>
            <div className="relative">
                <input 
                    type="number" 
                    min="0"
                    value={form.quantity} 
                    onChange={e => setForm({...form, quantity: parseInt(e.target.value) || 0})} 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-lp-orange outline-none pl-8" 
                />
                <Layers size={14} className="absolute left-2.5 top-3 text-gray-400" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Set to 0 to mark as unavailable.</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Type</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-lp-orange outline-none">
                <option value="kubo">Kubo</option>
                <option value="cabin">Cabin</option>
                <option value="table">Table</option>
                <option value="pool">Pool</option>
                <option value="room">Room</option>
            </select>
          </div>
       </div>
    </div>
  );

  // FIX: Changed from component (const AddModal = ...) to a render function to prevent focus loss
  const renderAddModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 relative">
            <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold text-lp-orange flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg"><Plus size={20}/></div>
                    Add New Amenity
                </h3>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X size={24}/></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 gap-6">
                    {renderFormFields()}
                </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex items-center gap-3">
                <button onClick={resetForm} className="flex-1 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 text-gray-600 font-medium transition-colors">Cancel</button>
                <button onClick={() => handleSave()} className="flex-[2] bg-lp-orange text-white py-2.5 rounded-xl hover:bg-orange-600 flex items-center justify-center gap-2 font-medium shadow-md transition-all hover:shadow-lg">
                    <Save size={18} /> Save Amenity
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Amenities</h2>
            <p className="text-gray-500 text-sm">Manage your resort facilities and inventory limit.</p>
        </div>
        
        {!isAdding && !editingId && (
            <button onClick={() => setIsAdding(true)} className="group flex items-center gap-2 px-5 py-2.5 bg-lp-orange text-white rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200 active:scale-95">
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300"/> 
                <span className="font-medium">Add New Amenity</span>
            </button>
        )}
      </div>

      {/* Filter Tabs */}
      {!isAdding && !editingId && (
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
            {categories.map(cat => {
                const count = cat === 'All' 
                    ? amenities.length 
                    : amenities.filter(a => a.type?.toLowerCase() === cat.toLowerCase()).length;

                return (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                            selectedCategory === cat 
                            ? 'bg-lp-orange text-white shadow-md' 
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        {cat} <span className={`ml-1 text-xs ${selectedCategory === cat ? 'text-white/80' : 'text-gray-400'}`}>({count})</span>
                    </button>
                );
            })}
        </div>
      )}

      {/* Portal for Add Modal */}
      {/* FIX: Calling renderAddModal() directly instead of <AddModal /> */}
      {isAdding && createPortal(renderAddModal(), document.body)}

      {/* Grid Display */}
      {filteredAmenities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
            {filteredAmenities.map((amenity) => {
             const availability = getAvailabilityDisplay(amenity);
             
             return (
            <div key={amenity.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${editingId === amenity.id ? 'ring-2 ring-lp-orange ring-offset-2 scale-[1.02] z-10' : ''}`}>
                
                {/* --- EDIT MODE (Inline) --- */}
                {editingId === amenity.id ? (
                    <div className="p-5 flex flex-col h-full bg-white">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b">
                            <span className="font-bold text-lp-orange flex items-center gap-2"><Edit size={16}/> Editing...</span>
                            <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} className="text-gray-400"/></button>
                        </div>
                        {renderFormFields()}
                        <div className="mt-5 flex gap-3">
                            <button onClick={resetForm} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
                            <button onClick={() => handleSave(amenity.id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-medium shadow-md">Save Changes</button>
                        </div>
                    </div>
                ) : (
                    // --- VIEW MODE ---
                    <>
                        <div className="relative h-56 group cursor-pointer" onClick={() => startEditing(amenity)}>
                            <img 
                                src={amenity.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                                alt={amenity.name}
                                className="w-full h-full object-cover" 
                                onError={(e) => {e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'}}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                            
                            {/* Category Badge */}
                            <div className="absolute top-3 left-3">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold rounded-full shadow-sm uppercase tracking-wide">
                                    {amenity.type}
                                </span>
                            </div>

                            {/* Dynamic Availability Badge */}
                            <div className="absolute top-3 right-3">
                                <span className={`px-3 py-1 text-xs rounded-full font-bold shadow-sm flex items-center gap-1 ${availability.colorClass}`}>
                                    <div className={`w-2 h-2 rounded-full bg-white ${availability.pulse ? 'animate-pulse' : ''}`}></div>
                                    {availability.text}
                                </span>
                            </div>

                            {/* Name & Price Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <h3 className="text-xl font-bold leading-tight drop-shadow-md mb-1">{amenity.name}</h3>
                                <p className="text-orange-300 font-bold text-lg drop-shadow-sm">₱{parseFloat(amenity.price).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="p-5 flex flex-col flex-grow">
                            <div className="flex items-start gap-2 mb-4 min-h-[40px]">
                                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{amenity.description || "No description provided."}</p>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-5 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex flex-col items-center flex-1 border-r border-gray-200">
                                    <span className="font-semibold text-gray-700 text-sm">{amenity.capacity}</span>
                                    <span className="uppercase tracking-wider text-[10px]">Pax/Unit</span>
                                </div>
                                {/* Total Units Display */}
                                <div className="flex flex-col items-center flex-1">
                                    <span className="font-semibold text-gray-700 text-sm flex items-center gap-1">
                                        <Layers size={12} className="text-gray-400"/>
                                        {/* FIX: Removed || 1 here so it shows real 0 */}
                                        {amenity.quantity !== undefined ? amenity.quantity : 0}
                                    </span>
                                    <span className="uppercase tracking-wider text-[10px]">Total Units</span>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-auto pt-2 border-t border-gray-100">
                                <button 
                                    onClick={() => startEditing(amenity)} 
                                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-blue-600 transition-all text-sm font-semibold group"
                                >
                                    <Edit size={16} className="group-hover:scale-110 transition-transform"/> Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(amenity.id)} 
                                    className="flex-none w-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all"
                                    title="Delete Amenity"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            );
           })}
        </div>
      ) : (
        <div className="text-center py-20">
            <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Filter size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No amenities found</h3>
            <p className="text-gray-500">Try selecting a different category or add a new amenity.</p>
        </div>
      )}
    </div>
  );
};

export default OwnerAmenities;