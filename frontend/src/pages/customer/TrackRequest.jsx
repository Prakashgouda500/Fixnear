import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Shield, CheckCircle2, Circle, Play, Award } from 'lucide-react';
import api from '../../services/api';

const steps = [
  { status: 'PENDING', label: 'Requested', desc: 'Waiting for technician assignment' },
  { status: 'ACCEPTED', label: 'Accepted', desc: 'Technician has accepted your booking' },
  { status: 'ON_THE_WAY', label: 'On The Way', desc: 'Technician is heading to your location' },
  { status: 'IN_PROGRESS', label: 'In Progress', desc: 'Service is currently being performed' },
  { status: 'COMPLETED', label: 'Completed', desc: 'Job completed successfully' }
];

const TrackRequest = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchRequest = async () => {
    try {
      const res = await api.get(`/service-requests/${id}`);
      if (res.data.success) {
        setRequest(res.data.request);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load service request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
    // Poll request status every 8 seconds for pseudo-real-time updates!
    const interval = setInterval(fetchRequest, 8000);
    return () => clearInterval(interval);
  }, [id]);

  const getCurrentStepIndex = () => {
    if (!request) return 0;
    if (request.status === 'CANCELLED') return -1;
    // Map TECHNICIAN_ASSIGNED to ACCEPTED in steps
    const statusMap = request.status === 'TECHNICIAN_ASSIGNED' ? 'ACCEPTED' : request.status;
    return steps.findIndex(step => step.status === statusMap);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-white p-6 border border-gray-100 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-red-600">Error Loading Request</h2>
        <p className="text-xs text-gray-500 mt-2">{error || 'Service request not found'}</p>
        <Link to="/customer" className="mt-4 inline-flex items-center text-xs font-semibold text-indigo-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const currentStepIdx = getCurrentStepIndex();

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customer')}
          className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Dashboard
        </button>
        <span className="text-xs text-gray-400">Request ID: {request._id}</span>
      </div>

      {/* Main card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        
        {/* Left Column: Progress Steps */}
        <div className="p-6 md:col-span-5 bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-900 mb-6">Service Tracking</h2>
          
          {request.status === 'CANCELLED' ? (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start space-x-2">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-800">Job Cancelled</p>
                <p className="text-[10px] text-red-600 mt-0.5 leading-normal">This request has been cancelled and cannot be processed further.</p>
              </div>
            </div>
          ) : (
            <div className="relative pl-6 border-l border-gray-200 ml-3 space-y-6 py-2">
              {steps.map((step, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isActive = idx === currentStepIdx;
                
                return (
                  <div key={idx} className="relative">
                    {/* Circle Node */}
                    <span className={`absolute -left-[31px] top-0.5 rounded-full h-5 w-5 flex items-center justify-center bg-white border-2 transition-all ${
                      isCompleted ? 'border-green-600 text-green-600' :
                      isActive ? 'border-indigo-600 text-indigo-600 animate-pulse' :
                      'border-gray-200 text-gray-300'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-4.5 w-4.5 fill-green-50" /> : <span className="h-1.5 w-1.5 bg-current rounded-full"></span>}
                    </span>
                    
                    {/* Step Labels */}
                    <div className="pl-2">
                      <p className={`text-xs font-bold ${isActive ? 'text-indigo-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Request Details */}
        <div className="p-6 md:col-span-7 space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">
              {request.categoryId?.name}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{request.title}</h1>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{request.description}</p>
          </div>

          {/* Location and time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-gray-50 py-4 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-gray-500 block">Service Address</span>
              <div className="flex items-start text-gray-700">
                <MapPin className="h-4 w-4 mr-1 text-gray-400 shrink-0 mt-0.5" />
                <span>{request.location.address}, {request.location.city}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-gray-500 block">Preferred Schedule</span>
              <div className="flex items-start text-gray-700">
                <Clock className="h-4 w-4 mr-1 text-gray-400 shrink-0 mt-0.5" />
                <span>{new Date(request.preferredDateTime).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Uploaded images */}
          {request.images && request.images.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2">Problem Images</h3>
              <div className="flex flex-wrap gap-2">
                {request.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Problem ${idx + 1}`}
                    className="h-16 w-16 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Technician Details */}
          {request.technicianId ? (
            <div className="bg-indigo-50/50 border border-indigo-50 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-indigo-900">Your Assigned Technician</h3>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                  {request.technicianId.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{request.technicianId.name}</p>
                  <p className="text-[10px] text-gray-500">Contact: {request.technicianId.phone}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-indigo-100/50 flex justify-between text-[11px] text-indigo-700 font-semibold">
                <span>Service Price: ₹{request.price || 800}</span>
                {request.status === 'COMPLETED' ? (
                  <span className="text-green-600 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> Service Done</span>
                ) : (
                  <span>ETA: Dynamic</span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
              <p className="text-xs font-semibold text-gray-500">Finding the best technician near you...</p>
              <p className="text-[10px] text-gray-400 mt-1">Technicians in Mumbai matching this category have been notified.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackRequest;
