import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Clock, MapPin, XCircle } from 'lucide-react';
import api from '../../services/api';

const ViewServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/service-requests');
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      const res = await api.delete(`/service-requests/${id}`);
      if (res.data.success) {
        setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'CANCELLED' } : r));
        alert('Service request cancelled successfully!');
      }
    } catch (err) {
      alert('Failed to cancel service request');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20',
      ACCEPTED: 'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-600/20',
      TECHNICIAN_ASSIGNED: 'bg-indigo-50 text-indigo-800 ring-1 ring-inset ring-indigo-600/20',
      ON_THE_WAY: 'bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-600/20',
      IN_PROGRESS: 'bg-purple-50 text-purple-800 ring-1 ring-inset ring-purple-600/20',
      COMPLETED: 'bg-green-50 text-green-800 ring-1 ring-inset ring-green-600/20',
      CANCELLED: 'bg-red-50 text-red-800 ring-1 ring-inset ring-red-600/20',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${styles[status] || styles.PENDING}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-indigo-600" />
          Service Requests Ledger
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Audit trail of all service requests, technician matching, and status logs.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {requests.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No service requests placed yet.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Request Details</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Technician</th>
                <th className="px-6 py-3">Schedule</th>
                <th className="px-6 py-3 text-right">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {requests.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50/30">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{r.title}</p>
                    <span className="inline-block mt-1 text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {r.categoryId?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{r.customerId?.name}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{r.customerId?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    {r.technicianId ? (
                      <div>
                        <p className="font-semibold text-gray-800">{r.technicianId.name}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">{r.technicianId.email}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="flex items-center text-[10px] text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(r.preferredDateTime).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(r.preferredDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">₹{r.price || 0}</td>
                  <td className="px-6 py-4">{getStatusBadge(r.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {['PENDING', 'ACCEPTED', 'TECHNICIAN_ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(r.status) && (
                      <button
                        onClick={() => handleCancelRequest(r._id)}
                        className="inline-flex items-center p-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                        title="Force Cancel"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewServiceRequests;
