import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Star, Briefcase, CheckCircle, ShieldAlert, Navigation, Play, Check, MapPin, Phone, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const TechnicianDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('nearby');
  const [customPrices, setCustomPrices] = useState({});

  const fetchData = async () => {
    try {
      // Get technician profile
      const profRes = await api.get('/users/profile');
      if (profRes.data.success) {
        setProfile(profRes.data.technicianProfile);
        
        // Only load requests if technician is approved
        if (profRes.data.technicianProfile?.isApproved === 'approved') {
          const [nearbyRes, jobsRes] = await Promise.all([
            api.get('/service-requests/nearby'),
            api.get('/service-requests/jobs')
          ]);

          if (nearbyRes.data.success) {
            setNearbyRequests(nearbyRes.data.requests);
          }
          if (jobsRes.data.success) {
            setJobs(jobsRes.data.jobs);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load technician dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptJob = async (requestId) => {
    const price = customPrices[requestId] || 800; // Default ₹800
    try {
      const res = await api.post(`/technicians/${requestId}/accept`, { price });
      if (res.data.success) {
        alert('Job accepted successfully!');
        // Remove from nearby list and trigger reload
        setNearbyRequests(prev => prev.filter(r => r._id !== requestId));
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept job');
    }
  };

  const handleStatusTransition = async (jobId, newStatus) => {
    try {
      const res = await api.put(`/service-requests/${jobId}/status`, { status: newStatus });
      if (res.data.success) {
        setJobs(prev => prev.map(job => job._id === jobId ? { ...job, status: newStatus } : job));
        alert(`Status updated to ${newStatus.replace('_', ' ').toLowerCase()}!`);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to transition status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If user registered as tech but profile hasn't loaded or isn't approved
  const isApproved = profile?.isApproved === 'approved';

  const activeJobs = jobs.filter(j => ['ACCEPTED', 'TECHNICIAN_ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');

  return (
    <div className="space-y-8">
      {/* Welcome & Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technician Terminal</h1>
          <p className="text-sm text-gray-500">Manage incoming service bookings and status progression.</p>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="text-xs text-gray-400 font-semibold">Availability</span>
          <span className={`h-2.5 w-2.5 rounded-full ${profile?.availability ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
          <span className="text-xs font-bold text-gray-700">{profile?.availability ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Approval Status Message */}
      {profile?.isApproved === 'pending' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg flex items-start space-x-3">
          <ShieldAlert className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-yellow-800">Verification Pending</h3>
            <p className="text-xs text-yellow-700 mt-1 leading-normal">Your technician application is currently being reviewed by administrators. You will be able to search and accept jobs in the Mumbai area once approved.</p>
          </div>
        </div>
      )}

      {profile?.isApproved === 'rejected' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-800">Application Rejected</h3>
            <p className="text-xs text-red-700 mt-1 leading-normal">Your technician account application was rejected. Please contact administrator support.</p>
          </div>
        </div>
      )}

      {/* Metrics Banner */}
      {isApproved && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Total Earnings</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">₹{profile.totalEarnings}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
            <div className="h-10 w-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center shrink-0">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Rating</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{profile.avgRating} / 5</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Active Jobs</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{activeJobs.length}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
            <div className="h-10 w-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Completed Jobs</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{completedJobs.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      {isApproved && (
        <div className="space-y-4">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('nearby')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all mr-6 cursor-pointer ${
                activeTab === 'nearby'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Nearby Requests ({nearbyRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('active_jobs')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all mr-6 cursor-pointer ${
                activeTab === 'active_jobs'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Active Jobs ({activeJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Completed Jobs ({completedJobs.length})
            </button>
          </div>

          {/* TAB: Nearby Requests */}
          {activeTab === 'nearby' && (
            <div className="space-y-4">
              {nearbyRequests.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
                  <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-gray-700">No requests in your service areas</h3>
                  <p className="text-xs text-gray-400 mt-1">New customer service requests will appear here when they match your category specs.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {nearbyRequests.map((req) => (
                    <div key={req._id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-full">{req.categoryId?.name}</span>
                          <span className="text-[10px] text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">{req.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{req.description}</p>
                        
                        <div className="flex items-center text-[10px] text-gray-400 space-x-4 pt-2">
                          <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1" /> {req.location.city} ({req.location.address})</span>
                        </div>
                      </div>

                      {/* Accept panel */}
                      <div className="pt-3 border-t border-gray-50 flex items-center space-x-3">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-1 max-w-[140px] px-2 py-1">
                          <span className="text-xs text-gray-400 font-bold mr-1">₹</span>
                          <input
                            type="number"
                            value={customPrices[req._id] || 800}
                            onChange={(e) => setCustomPrices({ ...customPrices, [req._id]: Number(e.target.value) })}
                            className="w-full text-xs font-bold text-gray-800 focus:outline-none"
                            placeholder="Price"
                          />
                        </div>
                        <button
                          onClick={() => handleAcceptJob(req._id)}
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                        >
                          Accept Booking
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Active Jobs */}
          {activeTab === 'active_jobs' && (
            <div className="space-y-4">
              {activeJobs.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
                  <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-gray-700">No active jobs</h3>
                  <p className="text-xs text-gray-400 mt-1">Accept nearby requests to start servicing customers.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeJobs.map((job) => (
                    <div key={job._id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-full">{job.categoryId?.name}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded">
                            {job.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">{job.title}</h3>
                        
                        {/* Customer contact panel */}
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-2 text-xs text-gray-700">
                          <p className="font-semibold text-gray-900">Customer: {job.customerId?.name}</p>
                          <p className="flex items-center text-[11px] text-gray-500">
                            <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400 shrink-0" />
                            <a href={`tel:${job.customerId?.phone}`} className="hover:underline text-indigo-600">{job.customerId?.phone}</a>
                          </p>
                          <p className="flex items-start text-[11px] text-gray-500">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400 shrink-0 mt-0.5" />
                            <span>{job.location.address}, {job.location.city}</span>
                          </p>
                        </div>
                      </div>

                      {/* State transitions */}
                      <div className="pt-3 border-t border-gray-50 flex space-x-2">
                        {['ACCEPTED', 'TECHNICIAN_ASSIGNED'].includes(job.status) && (
                          <button
                            onClick={() => handleStatusTransition(job._id, 'ON_THE_WAY')}
                            className="w-full flex items-center justify-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                          >
                            <Navigation className="h-3.5 w-3.5 mr-1.5" />
                            Mark On The Way
                          </button>
                        )}

                        {job.status === 'ON_THE_WAY' && (
                          <button
                            onClick={() => handleStatusTransition(job._id, 'IN_PROGRESS')}
                            className="w-full flex items-center justify-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                          >
                            <Play className="h-3.5 w-3.5 mr-1.5" />
                            Start Service Work
                          </button>
                        )}

                        {job.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleStatusTransition(job._id, 'COMPLETED')}
                            className="w-full flex items-center justify-center py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5 mr-1.5" />
                            Complete Service
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Completed Jobs */}
          {activeTab === 'completed' && (
            <div className="space-y-4">
              {completedJobs.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
                  <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-gray-700">No completed jobs yet</h3>
                  <p className="text-xs text-gray-400 mt-1">Finished orders and service history will show up here.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                    <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3">Job Description</th>
                        <th className="px-6 py-3">Completed On</th>
                        <th className="px-6 py-3">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                      {completedJobs.map((job) => (
                        <tr key={job._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 font-bold text-gray-900">{job.customerId?.name}</td>
                          <td className="px-6 py-4 truncate max-w-[200px]">{job.title}</td>
                          <td className="px-6 py-4">{new Date(job.updatedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-bold text-indigo-600">₹{job.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
