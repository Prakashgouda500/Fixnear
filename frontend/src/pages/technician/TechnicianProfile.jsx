import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Phone, Briefcase, MapPin, Save, AlertCircle, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';

const TechnicianProfile = () => {
  const { user, updateUserState } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState(true);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      experience: 2,
      serviceArea: '',
      selectedCategories: []
    }
  });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const [catRes, profRes] = await Promise.all([
          api.get('/categories'),
          api.get('/users/profile')
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }

        if (profRes.data.success) {
          const profile = profRes.data.technicianProfile;
          if (profile) {
            setValue('experience', profile.experience);
            setValue('serviceArea', profile.serviceArea.join(', '));
            setAvailability(profile.availability);
            
            // Map category IDs for checkboxes
            const selectedIds = profile.categories.map(c => c._id || c);
            setValue('selectedCategories', selectedIds);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadProfileData();
    if (user) {
      setValue('name', user.name);
      setValue('phone', user.phone);
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setSuccess('');
    setError('');
    setLoading(true);

    const payload = {
      name: data.name,
      phone: data.phone,
      experience: Number(data.experience),
      serviceArea: data.serviceArea.split(',').map(s => s.trim()).filter(Boolean),
      categories: data.selectedCategories,
      availability: availability
    };

    try {
      const res = await api.put('/users/profile', payload);
      if (res.data.success) {
        setSuccess('Profile updated successfully!');
        updateUserState(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Technician Profile Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage your credentials, expertise, availability, and servicing locations.</p>
        </div>

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            <p className="text-xs text-green-700 font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Availability Toggle */}
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-900 block">Duty Availability</span>
              <span className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Toggle offline to stop receiving incoming nearby service requests temporarily.</span>
            </div>
            <button
              type="button"
              onClick={() => setAvailability(!availability)}
              className="focus:outline-none cursor-pointer"
            >
              {availability ? (
                <ToggleRight className="h-10 w-10 text-indigo-600" />
              ) : (
                <ToggleLeft className="h-10 w-10 text-gray-300" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name-tech" className="block text-xs font-semibold text-gray-700">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="name-tech"
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {errors.name && <p className="mt-1 text-[10px] text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="phone-tech" className="block text-xs font-semibold text-gray-700">Phone</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="phone-tech"
                  type="text"
                  {...register('phone', {
                    required: 'Phone is required',
                    pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' }
                  })}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {errors.phone && <p className="mt-1 text-[10px] text-red-600">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="exp-tech" className="block text-xs font-semibold text-gray-700">Years of Experience</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="exp-tech"
                  type="number"
                  {...register('experience', { required: 'Experience required', min: 0 })}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="areas-tech" className="block text-xs font-semibold text-gray-700">Service Cities (Comma separated)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="areas-tech"
                  type="text"
                  {...register('serviceArea', { required: 'Areas required' })}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">My Service Offerings</label>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 border border-gray-100 p-3 rounded-lg max-h-48 overflow-y-auto">
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    value={cat._id}
                    {...register('selectedCategories')}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save Profile Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default TechnicianProfile;
