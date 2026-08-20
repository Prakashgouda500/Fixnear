import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Phone, Wrench, Briefcase, MapPin, AlertCircle } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const Register = () => {
  const { register: registerUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'technician' ? 'technician' : 'customer';

  const [role, setRole] = useState(initialRole);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      experience: 2,
      serviceArea: '',
      selectedCategories: []
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

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: role
    };

    if (role === 'technician') {
      payload.experience = Number(data.experience);
      payload.serviceArea = data.serviceArea.split(',').map(s => s.trim()).filter(Boolean);
      payload.categories = data.selectedCategories;

      if (!payload.categories || !payload.categories.length) {
        setError('Please select at least one service category');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await registerUser(payload);
      if (res.success) {
        if (role === 'customer') {
          navigate('/customer');
        } else {
          navigate('/technician');
        }
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-2">
          <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            F
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Fix<span className="text-indigo-600">Near</span></span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Role selector */}
          <div className="flex bg-gray-100 p-1.5 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                role === 'customer'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('technician')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                role === 'technician'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Technician
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="text"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit phone number'
                    }
                  })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                  placeholder="9876543210"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Technician fields */}
            {role === 'technician' && (
              <div className="space-y-6 pt-4 border-t border-gray-100">
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="experience"
                      type="number"
                      {...register('experience', {
                        required: 'Experience is required',
                        min: { value: 0, message: 'Cannot be negative' }
                      })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                      placeholder="5"
                    />
                  </div>
                  {errors.experience && (
                    <p className="mt-1 text-xs text-red-600">{errors.experience.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="serviceArea" className="block text-sm font-medium text-gray-700">
                    Service Areas (Comma separated cities)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="serviceArea"
                      type="text"
                      {...register('serviceArea', { required: 'Service area is required' })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                      placeholder="Mumbai, Navi Mumbai"
                    />
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">Specify matching areas (e.g. Mumbai) to see nearby jobs.</span>
                  {errors.serviceArea && (
                    <p className="mt-1 text-xs text-red-600">{errors.serviceArea.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Categories
                  </label>
                  {categories.length === 0 ? (
                    <p className="text-xs text-gray-400">Loading categories...</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100 max-h-48 overflow-y-auto">
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
                  )}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
