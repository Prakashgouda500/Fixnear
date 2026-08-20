import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ListCollapse, Plus, Edit3, Trash2, Save, Wrench } from 'lucide-react';
import api from '../../services/api';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      name: '',
      description: '',
      icon: 'Wrench'
    }
  });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        const res = await api.put(`/categories/${editingId}`, data);
        if (res.data.success) {
          setCategories(prev => prev.map(c => c._id === editingId ? res.data.category : c));
          setEditingId(null);
          alert('Category updated successfully!');
        }
      } else {
        const res = await api.post('/categories', data);
        if (res.data.success) {
          setCategories(prev => [...prev, res.data.category]);
          alert('Category created successfully!');
        }
      }
      reset();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setValue('name', cat.name);
    setValue('description', cat.description);
    setValue('icon', cat.icon || 'Wrench');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.data.success) {
        setCategories(prev => prev.filter(c => c._id !== id));
        alert('Category deleted successfully!');
      }
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* List Categories */}
      <div className="md:col-span-7 bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center">
          <ListCollapse className="h-4.5 w-4.5 mr-2 text-indigo-600" />
          Active Categories
        </h2>
        
        <div className="divide-y divide-gray-50 max-h-[450px] overflow-y-auto pr-2">
          {categories.map((cat) => (
            <div key={cat._id} className="py-3 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-gray-800">{cat.name}</p>
                <p className="text-gray-400 text-[10px] mt-0.5">{cat.description}</p>
                <p className="text-[9px] text-indigo-500 font-semibold mt-1">Icon ID: {cat.icon || 'Wrench'}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-1 border border-gray-200 bg-white hover:bg-gray-50 rounded text-gray-500 hover:text-gray-900 shadow-xs cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-1 border border-red-100 bg-red-50 hover:bg-red-100 rounded text-red-500 shadow-xs cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Form */}
      <div className="md:col-span-5 bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>
          <p className="text-[10px] text-gray-400 mt-0.5">Define categories that customers can select during request bookings.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="cat-name" className="block text-xs font-semibold text-gray-700">Category Name</label>
            <input
              id="cat-name"
              type="text"
              {...register('name', { required: true })}
              className="block w-full mt-1.5 border border-gray-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Appliance Service"
            />
          </div>

          <div>
            <label htmlFor="cat-desc" className="block text-xs font-semibold text-gray-700">Description</label>
            <textarea
              id="cat-desc"
              rows={3}
              {...register('description')}
              className="block w-full mt-1.5 border border-gray-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Short category description..."
            ></textarea>
          </div>

          <div>
            <label htmlFor="cat-icon" className="block text-xs font-semibold text-gray-700">Lucide Icon Class</label>
            <select
              id="cat-icon"
              {...register('icon')}
              className="block w-full mt-1.5 border border-gray-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="Wrench">Wrench (Default)</option>
              <option value="Laptop">Laptop</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Wifi">Wifi</option>
              <option value="Zap">Zap (Electrical)</option>
              <option value="Droplet">Droplet (Plumbing)</option>
              <option value="AirVent">AirVent (AC)</option>
              <option value="IceCream">IceCream (Fridge)</option>
              <option value="Activity">Activity (Washing)</option>
              <option value="Cpu">Cpu</option>
              <option value="Video">Video (CCTV)</option>
            </select>
          </div>

          <div className="pt-2 flex space-x-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center justify-center cursor-pointer"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {editingId ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageCategories;
