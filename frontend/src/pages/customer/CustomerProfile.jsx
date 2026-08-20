import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Phone, Lock, Save, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';

const CustomerProfile = () => {
  const { user, updateUserState } = useContext(AuthContext);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Complaint section state
  const [requests, setRequests] = useState([]);
  const [complaintSuccess, setComplaintSuccess] = useState('');
  const [complaintError, setComplaintError] = useState('');
  const [complaintLoading, setComplaintLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      password: ''
    }
  });

  const { register: registerComplaint, handleSubmit: handleSubmitComplaint, reset: resetComplaint } = useForm({
    defaultValues: {
      serviceRequestId: '',
      title: '',
      description: ''
    }
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('phone', user.phone);
    }
    
    // Fetch completed/active requests to lodge complaint against
    const fetchRequests = async () => {
      try {
        const res = await api.get('/service-requests');
        if (res.data.success) {
          setRequests(res.data.requests);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRequests();
  }, [user, setValue]);

  const onUpdateProfile = async (data) => {
    setSuccess('');
    setError('');
    setLoading(true);

    const payload = {
      name: data.name,
      phone: data.phone
    };
    if (data.password) {
      payload.password = data.password;
    }

    try {
      const res = await api.put('/users/profile', payload);
      if (res.data.success) {
        updateUserState(res.data.user);
        setSuccess('Profile updated successfully!');
        setValue('password', ''); // clear password field
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitComplaint = async (data) => {
    setComplaintSuccess('');
    setComplaintError('');
    setComplaintLoading(true);

    try {
      const res = await api.post('/complaints', data);
      if (res.data.success) {
        setComplaintSuccess('Support ticket logged successfully. The admin will review it.');
        resetComplaint();
      }
    } catch (err) {
      setComplaintError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setComplaintLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Profile Details (Left column) */}
      <div className="md:col-span-6 bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-gray-900">Profile Settings</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage your personal information and login credentials.</p>
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

        <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-gray-700">Name</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {errors.name && <p className="mt-1 text-[10px] text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-gray-700">Phone</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="phone"
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

          <div>
            <label htmlFor="password-profile" className="block text-xs font-semibold text-gray-700">New Password (Leave blank to keep current)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="password-profile"
                type="password"
                {...register('password', {
                  minLength: { value: 6, message: 'Minimum 6 characters' }
                })}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-[10px] text-red-600">{errors.password.message}</p>}
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

      {/* Support / Complaints Section (Right column) */}
      <div className="md:col-span-6 bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-gray-900">File a Support Ticket / Complaint</h2>
          <p className="text-xs text-gray-400 mt-0.5">Let our administration review issues with your service requests.</p>
        </div>

        {complaintSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            <p className="text-xs text-green-700 font-medium">{complaintSuccess}</p>
          </div>
        )}

        {complaintError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-xs text-red-700">{complaintError}</p>
          </div>
        )}

        <form onSubmit={handleSubmitComplaint(onSubmitComplaint)} className="space-y-4">
          <div>
            <label htmlFor="serviceRequestId" className="block text-xs font-semibold text-gray-700">Relates to Service Request</label>
            <select
              id="serviceRequestId"
              {...registerComplaint('serviceRequestId', { required: 'Please select a request reference' })}
              className="block w-full mt-1 border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Select request reference...</option>
              {requests.map(req => (
                <option key={req._id} value={req._id}>
                  {req.title} ({req.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="complaint-title" className="block text-xs font-semibold text-gray-700">Issue Subject</label>
            <input
              id="complaint-title"
              type="text"
              {...registerComplaint('title', { required: 'Complaint subject is required' })}
              className="block w-full mt-1 border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Technician arrived very late"
            />
          </div>

          <div>
            <label htmlFor="complaint-desc" className="block text-xs font-semibold text-gray-700">Elaborate Details</label>
            <textarea
              id="complaint-desc"
              rows={3}
              {...registerComplaint('description', { required: 'Description is required' })}
              className="block w-full mt-1 border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Provide context for our support team to investigate..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={complaintLoading || requests.length === 0}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
          >
            <FileText className="h-4 w-4 mr-1.5" />
            File Ticket
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfile;
