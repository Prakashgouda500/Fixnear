import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Wrench, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, CreditCard, Star, MapPin } from 'lucide-react';
import api from '../../services/api';

const CustomerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('active');

  // Checkout modal state
  const [checkoutRequest, setCheckoutRequest] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mock_card');
  const [paying, setPaying] = useState(false);

  // Review modal state
  const [reviewRequest, setReviewRequest] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Tracking payment status per request in memory
  const [payments, setPayments] = useState({});
  const [reviews, setReviews] = useState({});

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [reqRes, catRes] = await Promise.all([
        api.get('/service-requests'),
        api.get('/categories')
      ]);

      if (reqRes.data.success) {
        setRequests(reqRes.data.requests);
        
        // Fetch payments and reviews for completed requests
        const completedRequests = reqRes.data.requests.filter(r => r.status === 'COMPLETED');
        const paymentsData = {};
        const reviewsData = {};
        
        await Promise.all(completedRequests.map(async (req) => {
          try {
            const payRes = await api.get(`/payments/${req._id}`);
            if (payRes.data.success && payRes.data.payment) {
              paymentsData[req._id] = payRes.data.payment;
            }
          } catch (err) { /* No payment found */ }

          try {
            const revRes = await api.get(`/reviews/${req._id}`);
            if (revRes.data.success && revRes.data.review) {
              reviewsData[req._id] = revRes.data.review;
            }
          } catch (err) { /* No review found */ }
        }));
        
        setPayments(paymentsData);
        setReviews(reviewsData);
      }

      if (catRes.data.success) {
        setCategories(catRes.data.categories);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      const res = await api.delete(`/service-requests/${id}`);
      if (res.data.success) {
        setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'CANCELLED' } : r));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  // Mock Payment Flow
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutRequest) return;
    setPaying(true);
    try {
      const res = await api.post('/payments/checkout', {
        serviceRequestId: checkoutRequest._id,
        paymentMethod
      });
      if (res.data.success) {
        setPayments(prev => ({ ...prev, [checkoutRequest._id]: res.data.payment }));
        setCheckoutRequest(null);
        alert('Payment completed successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setPaying(false);
    }
  };

  // Review Submission Flow
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRequest) return;
    setReviewing(true);
    try {
      const res = await api.post('/reviews', {
        serviceRequestId: reviewRequest._id,
        rating,
        comment
      });
      if (res.data.success) {
        setReviews(prev => ({ ...prev, [reviewRequest._id]: res.data.review }));
        setReviewRequest(null);
        setComment('');
        alert('Thank you for your feedback!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewing(false);
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
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${styles[status] || styles.PENDING}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'active') {
      return ['PENDING', 'ACCEPTED', 'TECHNICIAN_ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(r.status);
    } else {
      return ['COMPLETED', 'CANCELLED'].includes(r.status);
    }
  });

  const activeCount = requests.filter(r => ['PENDING', 'ACCEPTED', 'TECHNICIAN_ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === 'COMPLETED').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your active service requests and request history.</p>
        </div>
        <Link
          to="/customer/create"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5 mr-1.5" />
          Request Service
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Active Requests</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Completed Jobs</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{completedCount}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Total Spent</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              ₹{Object.values(payments).reduce((sum, p) => sum + p.amount, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Categories shortcut */}
      {categories.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Request Service Directly</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat._id}
                to={`/customer/create?categoryId=${cat._id}`}
                className="flex items-center space-x-2.5 p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all text-left group"
              >
                <div className="h-8 w-8 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white rounded flex items-center justify-center text-indigo-600 transition-colors shrink-0">
                  <Wrench className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors truncate">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main tabs and list */}
      <div className="space-y-4">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all mr-6 cursor-pointer ${
              activeTab === 'active'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Active Service Requests ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Service History ({requests.length - activeCount})
          </button>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
            <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-700">No service requests found</h3>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'active'
                ? "You don't have any active service requests right now."
                : "You haven't completed or cancelled any requests yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => (
              <div key={req._id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">
                        {req.categoryId?.name}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-1.5">{req.title}</h3>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{req.description}</p>
                  
                  {/* Location & Preferred time */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-gray-400 border-t border-gray-50">
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-gray-300" />
                      <span className="truncate">{req.location.address}, {req.location.city}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1 text-gray-300" />
                      <span>{new Date(req.preferredDateTime).toLocaleDateString()} at {new Date(req.preferredDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Technician assignment detail */}
                {req.technicianId && (
                  <div className="bg-indigo-50/40 border border-indigo-50 rounded-lg p-3 text-xs flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-indigo-600 font-semibold block">Assigned Technician</span>
                      <span className="font-bold text-gray-800">{req.technicianId.name}</span>
                    </div>
                    <a
                      href={`tel:${req.technicianId.phone}`}
                      className="text-[10px] font-semibold text-indigo-600 bg-white border border-indigo-100 px-2 py-1 rounded shadow-sm hover:bg-indigo-50"
                    >
                      Call: {req.technicianId.phone}
                    </a>
                  </div>
                )}

                {/* Actions row */}
                <div className="flex space-x-2 pt-2 border-t border-gray-50">
                  <Link
                    to={`/customer/track/${req._id}`}
                    className="flex-1 flex items-center justify-center py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200 transition-colors"
                  >
                    Track Status
                  </Link>

                  {/* Cancel button */}
                  {['PENDING', 'ACCEPTED', 'TECHNICIAN_ASSIGNED'].includes(req.status) && (
                    <button
                      onClick={() => handleCancelRequest(req._id)}
                      className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold border border-red-100 transition-colors cursor-pointer"
                    >
                      Cancel Job
                    </button>
                  )}

                  {/* Pay button */}
                  {req.status === 'COMPLETED' && !payments[req._id] && (
                    <button
                      onClick={() => setCheckoutRequest(req)}
                      className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <CreditCard className="h-3.5 w-3.5 mr-1" />
                      Pay ₹{req.price || 800}
                    </button>
                  )}

                  {/* Review button */}
                  {req.status === 'COMPLETED' && payments[req._id] && !reviews[req._id] && (
                    <button
                      onClick={() => setReviewRequest(req)}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <Star className="h-3.5 w-3.5 mr-1" />
                      Leave Review
                    </button>
                  )}

                  {/* Status labels for processed request items */}
                  {req.status === 'COMPLETED' && payments[req._id] && reviews[req._id] && (
                    <span className="flex-1 text-center py-2 text-xs font-semibold text-green-600 bg-green-50 rounded-lg border border-green-100">
                      Paid & Reviewed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {checkoutRequest && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Secure Mock Checkout</h3>
              <button onClick={() => setCheckoutRequest(null)} className="text-gray-400 hover:text-gray-900 font-bold text-lg">×</button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-100 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Service Title</span>
                <span className="font-semibold text-gray-900 truncate max-w-[200px]">{checkoutRequest.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service Price</span>
                <span className="font-semibold text-gray-900">₹{checkoutRequest.price || 800}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-sm">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-indigo-600">₹{checkoutRequest.price || 800}</span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Select Mock Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="mock_card"
                      checked={paymentMethod === 'mock_card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-gray-800">Mock Card</span>
                  </label>
                  <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="mock_upi"
                      checked={paymentMethod === 'mock_upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-gray-800">Mock UPI</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setCheckoutRequest(null)}
                  className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {paying ? 'Authorizing...' : `Pay ₹${checkoutRequest.price || 800}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewRequest && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Leave Technician Review</h3>
              <button onClick={() => setReviewRequest(null)} className="text-gray-400 hover:text-gray-900 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Rating (1 to 5 Stars)</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-gray-300 hover:text-yellow-400 focus:outline-none transition-colors cursor-pointer"
                    >
                      <Star className={`h-8 w-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-xs font-semibold text-gray-700 mb-2">Your Feedback</label>
                <textarea
                  id="comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your experience with the technician..."
                  required
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setReviewRequest(null)}
                  className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {reviewing ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
