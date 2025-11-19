import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

const OwnerAmenities = ({ amenities, fetchAmenities }) => {
  const [showAmenityModal, setShowAmenityModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [amenityForm, setAmenityForm] = useState({
    name: '',
    description: '',
    price: '',
    type: 'kubo',
    capacity: '',
    available: true,
  });

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddAmenity = async () => {
    try {
      const formData = new FormData();
      formData.append('name', amenityForm.name);
      formData.append('description', amenityForm.description);
      formData.append('price', amenityForm.price);
      formData.append('category', amenityForm.type);
      formData.append('capacity', amenityForm.capacity);
      formData.append('status', amenityForm.available ? 'available' : 'unavailable');
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (editingAmenity) {
        await axios.put(`http://localhost:5000/api/owner/amenities/${editingAmenity.id}`, formData, config);
      } else {
        await axios.post('http://localhost:5000/api/owner/amenities', formData, config);
      }
      
      closeModal();
      fetchAmenities(); // Refresh list
    } catch (error) {
      alert('Error saving amenity: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteAmenity = async (id) => {
    if (window.confirm('Are you sure you want to delete this amenity?')) {
      try {
        await axios.delete(`http://localhost:5000/api/owner/amenities/${id}`);
        fetchAmenities();
      } catch {
        alert('Error deleting amenity');
      }
    }
  };

  const handleEditAmenity = (amenity) => {
    setEditingAmenity(amenity);
    setAmenityForm({
      name: amenity.name,
      description: amenity.description,
      price: amenity.price,
      type: amenity.type || amenity.category,
      capacity: amenity.capacity,
      available: amenity.available === true || amenity.available === "true" || amenity.available === 1,
    });
    
    // FIX: Diretso na nating gamitin ang amenity.image dahil full URL na ito galing backend
    setPreviewUrl(amenity.image);
    
    setSelectedFile(null);
    setShowAmenityModal(true);
  };

  const closeModal = () => {
    setShowAmenityModal(false);
    setEditingAmenity(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAmenityForm({ 
      name: '', description: '', price: '', type: 'kubo', capacity: '', available: true 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-lp-dark">Manage Amenities</h2>
        <button
          onClick={() => setShowAmenityModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-lp-orange text-white rounded-lg hover:bg-lp-orange-hover transition"
        >
          <Plus size={18} /> Add Amenity
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {amenities.map((amenity) => (
          <div key={amenity.id} className="bg-white rounded-lg shadow p-6 flex flex-col">
            
            {/* Image Display */}
            <div className="h-48 w-full mb-4 bg-gray-200 rounded-md overflow-hidden relative">
                {amenity.image ? (
                    <img 
                        src={amenity.image} // FIX: Wala nang IMAGE_BASE_URL concatenation
                        alt={amenity.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'}}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon /></div>
                )}
                 <span className={`absolute top-2 right-2 px-3 py-1 text-xs rounded-full font-medium shadow-sm ${
                  (amenity.available === true || amenity.available === "Yes" || amenity.available === 1)
                    ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {(amenity.available === true || amenity.available === "Yes" || amenity.available === 1) ? 'Available' : 'Unavailable'}
                </span>
            </div>
            
            <h3 className="text-lg font-semibold text-lp-dark">{amenity.name}</h3>
            <p className="text-sm text-gray-600 mb-3 flex-grow">{amenity.description}</p>
            <div className="flex justify-between items-center pt-3 border-t mt-auto">
              <span className="text-lg font-bold text-lp-orange">₱{amenity.price}</span>
              <div className="flex gap-2">
                <button onClick={() => handleEditAmenity(amenity)} className="text-blue-600 p-2 bg-blue-50 rounded-full"><Edit size={18} /></button>
                <button onClick={() => handleDeleteAmenity(amenity.id)} className="text-red-600 p-2 bg-red-50 rounded-full"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAmenityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-lp-dark mb-6">{editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}</h2>
            
            <div className="space-y-4">
              {/* IMAGE UPLOAD FIELD */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <label className="block text-sm font-medium text-lp-dark mb-2">Upload Image</label>
                <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lp-orange file:text-white hover:file:bg-lp-orange-hover"
                />
                {/* Preview */}
                {previewUrl && (
                    <div className="mt-3">
                        <img src={previewUrl} alt="Preview" className="h-32 w-full object-cover rounded-lg mx-auto" />
                    </div>
                )}
              </div>

              {/* Normal Fields */}
              <div>
                <label className="block text-sm font-medium text-lp-dark mb-1">Name</label>
                <input type="text" value={amenityForm.name} onChange={(e) => setAmenityForm({...amenityForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-lp-dark mb-1">Description</label>
                <textarea value={amenityForm.description} onChange={(e) => setAmenityForm({...amenityForm, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-lp-dark mb-1">Price</label>
                    <input type="number" value={amenityForm.price} onChange={(e) => setAmenityForm({...amenityForm, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-lp-dark mb-1">Capacity</label>
                    <input type="number" value={amenityForm.capacity} onChange={(e) => setAmenityForm({...amenityForm, capacity: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-lp-dark mb-1">Type</label>
                    <select value={amenityForm.type} onChange={(e) => setAmenityForm({...amenityForm, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                        <option value="kubo">Kubo</option>
                        <option value="cabin">Cabin</option>
                        <option value="table">Table</option>
                        <option value="pool">Pool</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-lp-dark mb-1">Status</label>
                    <select value={amenityForm.available ? "true" : "false"} onChange={(e) => setAmenityForm({...amenityForm, available: e.target.value === "true"})} className="w-full px-3 py-2 border rounded-lg">
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                    </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddAmenity} className="flex-1 px-4 py-2 bg-lp-orange text-white rounded-lg hover:bg-lp-orange-hover">
                {editingAmenity ? 'Update' : 'Add Amenity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerAmenities;