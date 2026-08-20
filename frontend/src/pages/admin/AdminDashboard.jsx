import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Wrench, FileText, CheckCircle, TrendingUp, AlertTriangle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, compRes, payRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/complaints'),
        api.get('/admin/payments')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (compRes.data.success) {
        setComplaints(compRes.data.complaints.slice(0, 5)); // top 5 complaints
      }
      if (payRes.data.success) {
        setPayments(payRes.data.payments.slice(0, 5)); // top 5 payments
      }
    } catch (err) {
      console.error('Failed to fetch admin dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveComplaint = async (id) => {
    try {
      const res = await api.put(`/admin/complaints/${id}/resolve`);
      if (res.data.success) {
        setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: 'RESOLVED' } : c));
        alert('Complaint marked as resolved!');
      }
    } catch (err) {
      alert('Failed to resolve complaint');
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
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Control Panel</h1>
        <p className="text-sm text-gray-500">System overview, financial analytics, and user account management.</p>
      </div>

      {/* Grid of stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Total Customers</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
            <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Technicians</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {stats.totalTechnicians} <span className="text-[10px] text-yellow-600">({stats.pendingApprovals} pending)</span>
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
            <div className="h-10 w-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Active Bookings</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{stats.activeRequests}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
            <div className="h-10 w-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Commission Earning</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">₹{stats.platformCommission}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* User Growth Line Chart */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm lg:col-span-7">
            <h3 className="text-sm font-bold text-gray-900 mb-6">User Acquisition Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.userGrowth.length > 0 ? stats.userGrowth : [{ date: 'None', count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                  <YAxis stroke="#9ca3af" fontSize={10} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Bar Chart */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm lg:col-span-5">
            <h3 className="text-sm font-bold text-gray-900 mb-6">Job Distribution by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryStats.length > 0 ? stats.categoryStats : [{ category: 'None', count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="category" stroke="#9ca3af" fontSize={9} />
                  <YAxis stroke="#9ca3af" fontSize={10} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Unresolved Complaints */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Complaints Log</h3>
            <span className="text-[10px] text-gray-400 font-semibold">Pending Review</span>
          </div>

          {complaints.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">No support tickets reported.</div>
          ) : (
            <div className="space-y-3">
              {complaints.map((comp) => (
                <div key={comp._id} className="border border-gray-100 rounded-lg p-4 space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{comp.title}</p>
                      <p className="text-gray-500 mt-1 leading-normal">{comp.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] rounded font-semibold tracking-wider ${
                      comp.status === 'RESOLVED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {comp.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                    <span>Filed by: {comp.reporterId?.name} ({comp.reporterId?.role})</span>
                    {comp.status === 'PENDING' && (
                      <button
                        onClick={() => handleResolveComplaint(comp._id)}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                      >
                        Resolve Ticket
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Checkout Transactions</h3>
            <span className="text-[10px] text-gray-400 font-semibold">Latest 5</span>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">No completed payments found.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {payments.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-gray-900">₹{p.amount}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Comm: ₹{p.platformFee} | Tech: {p.technicianId?.name}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">{p.transactionId}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
