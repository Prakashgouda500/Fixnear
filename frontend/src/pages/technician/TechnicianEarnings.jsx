import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, Wallet, ArrowUpRight, TrendingUp } from 'lucide-react';
import api from '../../services/api';

const TechnicianEarnings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/service-requests/jobs');
        if (res.data.success) {
          const completedJobs = res.data.jobs.filter(j => j.status === 'COMPLETED');
          setJobs(completedJobs);
          
          // Calculate earnings dynamically (90% of service price)
          const earningsSum = completedJobs.reduce((sum, j) => sum + ((j.price || 800) * 0.90), 0);
          setTotalEarnings(Math.round(earningsSum));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/technician" className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Dashboard
        </Link>
        <span className="text-xs text-gray-400">Earning Ledger v1.0</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Net Earnings</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">₹{totalEarnings}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Completed Jobs</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{jobs.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Avg. per Job</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              ₹{jobs.length > 0 ? Math.round(totalEarnings / jobs.length) : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-900">Earning Statement</h2>
          <p className="text-xs text-gray-400 mt-0.5">Ledger showing all service completions and matching platform cuts.</p>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No completed jobs found in database. Complete active services to generate earnings.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Completed Date</th>
                <th className="px-6 py-3">Service Reference</th>
                <th className="px-6 py-3 text-right">Job Price</th>
                <th className="px-6 py-3 text-right">Platform Fee (10%)</th>
                <th className="px-6 py-3 text-right text-indigo-600">Net Earned (90%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {jobs.map((job) => {
                const price = job.price || 800;
                const fee = Math.round(price * 0.10);
                const net = price - fee;

                return (
                  <tr key={job._id} className="hover:bg-gray-50/30">
                    <td className="px-6 py-4">{new Date(job.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 truncate max-w-[200px]">{job.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Category: {job.categoryId?.name}</p>
                    </td>
                    <td className="px-6 py-4 text-right">₹{price}</td>
                    <td className="px-6 py-4 text-right text-red-500">-₹{fee}</td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600">₹{net}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TechnicianEarnings;
