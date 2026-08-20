import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle, XCircle, ShieldAlert, ShieldCheck, Trash2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const ManageTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/admin/technicians');
      if (res.data.success) {
        setTechnicians(res.data.technicians);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleApproveStatus = async (id, status) => {
    try {
      const res = await api.put(`/admin/technicians/${id}/approve`, { status });
      if (res.data.success) {
        setTechnicians(prev => prev.map(t => t._id === id ? { ...t, isApproved: status } : t));
        alert(`Technician status updated to ${status}!`);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/status`);
      if (res.data.success) {
        setTechnicians(prev => prev.map(t => {
          if (t.userId?._id === userId) {
            const updatedUser = { ...t.userId, status: t.userId.status === 'active' ? 'suspended' : 'active' };
            return { ...t, userId: updatedUser };
          }
          return t;
        }));
        alert('User access state toggled!');
      }
    } catch (err) {
      alert('Failed to toggle user status');
    }
  };

  const handleDeleteTechnician = async (userId, techId) => {
    if (!window.confirm('Are you sure you want to delete this technician profile and account permanently?')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setTechnicians(prev => prev.filter(t => t._id !== techId));
        alert('Technician deleted successfully!');
      }
    } catch (err) {
      alert('Failed to delete technician');
    }
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
          <Wrench className="h-5 w-5 mr-2 text-indigo-600" />
          Technician Management
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Approve incoming technician applications and manage active listings.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {technicians.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No technicians registered.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Technician</th>
                <th className="px-6 py-3">Categories & Experience</th>
                <th className="px-6 py-3">Service Areas</th>
                <th className="px-6 py-3">Verify State</th>
                <th className="px-6 py-3">Account State</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {technicians.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50/30">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{t.userId?.name || 'Deleted User'}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{t.userId?.email}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{t.userId?.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {t.categories.map((cat) => (
                        <span key={cat._id} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[9px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                          {cat.name}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Exp: {t.experience} years</span>
                  </td>
                  <td className="px-6 py-4 truncate max-w-[120px]">{t.serviceArea.join(', ')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      t.isApproved === 'approved' ? 'bg-green-50 text-green-700' :
                      t.isApproved === 'rejected' ? 'bg-red-50 text-red-700' :
                      'bg-yellow-50 text-yellow-800'
                    }`}>
                      {t.isApproved}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {t.userId && (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        t.userId.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {t.userId.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-1.5">
                    {t.isApproved === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveStatus(t._id, 'approved')}
                          className="inline-flex items-center p-1.5 border border-green-200 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                          title="Approve Application"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleApproveStatus(t._id, 'rejected')}
                          className="inline-flex items-center p-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                          title="Reject Application"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {t.userId && (
                      <button
                        onClick={() => handleToggleUserStatus(t.userId._id)}
                        className={`inline-flex items-center p-1.5 rounded-lg border shadow-sm transition-colors cursor-pointer ${
                          t.userId.status === 'active'
                            ? 'border-yellow-200 bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                            : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                        title={t.userId.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      >
                        {t.userId.status === 'active' ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </button>
                    )}
                    {t.userId && (
                      <button
                        onClick={() => handleDeleteTechnician(t.userId._id, t._id)}
                        className="inline-flex items-center p-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                        title="Delete Permanently"
                      >
                        <Trash2 className="h-4 w-4" />
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

export default ManageTechnicians;
