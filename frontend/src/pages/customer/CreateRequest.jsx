import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Wrench, Calendar, MapPin, AlignLeft, FileText, Image as ImageIcon, ArrowLeft, Brain } from 'lucide-react';
import api from '../../services/api';

const CreateRequest = () => {
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const navigate = useNavigate();

  // Load category, title, and desc from FixAI params if present
  const paramCategoryId = searchParams.get('categoryId') || '';
  const paramTitle = searchParams.get('title') || '';
  const paramDesc = searchParams.get('desc') || '';

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      categoryId: paramCategoryId,
      title: paramTitle,
      description: paramDesc,
      address: '',
      city: 'Mumbai',
      lat: 19.076, // default Mumbai coordinates
      long: 72.877,
      preferredDateTime: ''
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Update dynamic values if search params load later
  useEffect(() => {
    if (paramCategoryId) setValue('categoryId', paramCategoryId);
    if (paramTitle) setValue('title', paramTitle);
    if (paramDesc) setValue('description', paramDesc);
  }, [paramCategoryId, paramTitle, paramDesc, setValue]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('categoryId', data.categoryId);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('address', data.address);
    formData.append('city', data.city);
    formData.append('lat', data.lat);
    formData.append('long', data.long);
    formData.append('preferredDateTime', data.preferredDateTime);

    // Append images
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const res = await api.post('/service-requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        alert('Service request created successfully!');
        navigate('/customer');
      } else {
        setError('Failed to create request. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please verify inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('lat', parseFloat(position.coords.latitude.toFixed(6)));
          setValue('long', parseFloat(position.coords.longitude.toFixed(6)));
          alert('GPS coordinates captured!');
        },
        (err) => {
          alert('Could not capture location. Using default Mumbai coordinates.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/customer')}
        className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Dashboard
      </button>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Request a Service</h1>
            <p className="text-xs text-indigo-100 mt-1">Book a certified technician in your neighborhood.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/fixai')}
            className="flex items-center text-xs font-semibold bg-white/20 hover:bg-white/30 text-white border border-white/20 px-3 py-1.5 rounded-lg shadow-sm transition-all"
          >
            <Brain className="h-4 w-4 mr-1" />
            Use FixAI Helper
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Service Category */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700">
              Select Service Category
            </label>
            <div className="mt-1.5 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Wrench className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="categoryId"
                {...register('categoryId', { required: 'Please select a category' })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Problem Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
              Problem Title
            </label>
            <div className="mt-1.5 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="title"
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                placeholder="Brief summary of the issue (e.g. Kitchen tap leaking)"
              />
            </div>
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Problem Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
              Detailed Description
            </label>
            <div className="mt-1.5 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                <AlignLeft className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="description"
                rows={4}
                {...register('description', { required: 'Please describe the problem' })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                placeholder="Provide detailed description of the problem (e.g. Leak is under the sink, water is dropping at 1 drop per second)"
              ></textarea>
            </div>
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Upload Problem Images (Max 5)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg px-4 py-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-all relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">Choose images to upload</span>
              <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, JPEG up to 5MB total</span>
            </div>
            {imageFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {imageFiles.map((file, idx) => (
                  <span key={idx} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                    {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Preferred date time */}
          <div>
            <label htmlFor="preferredDateTime" className="block text-sm font-semibold text-gray-700">
              Preferred Date & Time
            </label>
            <div className="mt-1.5 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="preferredDateTime"
                type="datetime-local"
                {...register('preferredDateTime', { required: 'Preferred date & time is required' })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {errors.preferredDateTime && (
              <p className="mt-1 text-xs text-red-600">{errors.preferredDateTime.message}</p>
            )}
          </div>

          {/* Location inputs */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Service Location</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-xs font-semibold text-gray-700">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  {...register('city', { required: 'City is required' })}
                  className="block w-full mt-1.5 border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-xs font-semibold text-gray-700">
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  {...register('address', { required: 'Address is required' })}
                  className="block w-full mt-1.5 border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Flat 302, Sea Green Apartments"
                />
              </div>
            </div>

            {/* Latitude Longitude */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lat" className="block text-xs font-semibold text-gray-700">
                  Latitude (Optional)
                </label>
                <input
                  id="lat"
                  type="number"
                  step="0.000001"
                  {...register('lat')}
                  className="block w-full mt-1.5 border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="long" className="block text-xs font-semibold text-gray-700">
                  Longitude (Optional)
                </label>
                <input
                  id="long"
                  type="number"
                  step="0.000001"
                  {...register('long')}
                  className="block w-full mt-1.5 border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <MapPin className="h-4 w-4 mr-1 text-indigo-600" />
              Capture My GPS Coordinates
            </button>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Submitting request...' : 'Book Technician'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
