import React, { useState, useEffect } from 'react';
import { Users, ShieldAlert, ShieldCheck, Trash2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/status`);
      if (res.data.success) {
        setUsers(prev => prev.map(u => u._id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
        alert('User status toggled successfully!');
      }
    } catch (err) {
      alert('Failed to change user status');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user permanently? This cannot be undone.')) return;
    try {
      const res = await api.delete(`/admin/users/${id}`);
      if (res.data.success) {
        setUsers(prev => prev.filter(u => u._id !== id));
        alert('User deleted successfully!');
      }
    } catch (err) {
      alert('Failed to delete user');
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
          <Users className="h-5 w-5 mr-2 text-indigo-600" />
          Customer Accounts
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage customer permissions, access state, and details.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {users.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No customers registered yet.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Customer Details</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Registered On</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/30">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{u.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{u.email}</p>
                  </td>
                  <td className="px-6 py-4 font-mono">{u.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      u.status === 'active' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10' : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(u._id)}
                      className={`inline-flex items-center p-1.5 rounded-lg border shadow-sm transition-colors cursor-pointer ${
                        u.status === 'active'
                          ? 'border-yellow-200 bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                          : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                      title={u.status === 'active' ? 'Suspend User' : 'Activate User'}
                    >
                      {u.status === 'active' ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="inline-flex items-center p-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

export default ManageUsers;
