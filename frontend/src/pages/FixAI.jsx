import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Sparkles, Brain, AlertTriangle, CheckCircle, ChevronRight, HelpCircle } from 'lucide-react';
import api from '../services/api';

const FixAI = () => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDiagnose = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/ai/diagnose', { description });
      if (res.data.success) {
        setResult(res.data.diagnosis);
      } else {
        setError('Diagnosis failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during diagnosis.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!result) return;
    const catId = result.recommendedCategory || '';
    const title = description.split('.')[0].substring(0, 50); // Use first sentence as default title
    navigate(`/customer/create?categoryId=${catId}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(description)}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            FixAI Diagnostics <span className="ml-2.5 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">Beta</span>
          </h1>
          <p className="text-sm text-gray-500">Describe your problem in plain words and let AI diagnose the issue.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Input Form Column */}
        <div className="md:col-span-5">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 sticky top-24">
            <form onSubmit={handleDiagnose} className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  What is the issue?
                </label>
                <textarea
                  id="description"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                  placeholder="Example: My laptop becomes very slow when I open multiple Chrome tabs, and the fan makes a loud noise..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading || !description.trim()}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Analyzing problem...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Diagnose Problem
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Column */}
        <div className="md:col-span-7">
          {!result && !loading && (
            <div className="h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-white">
              <HelpCircle className="h-10 w-10 text-gray-300 mb-3" />
              <h3 className="text-sm font-bold text-gray-700">No diagnosis yet</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">Enter details of the issue on the left and tap diagnose to see possible causes and recommended actions.</p>
            </div>
          )}

          {loading && (
            <div className="h-64 border border-gray-100 rounded-xl bg-white flex flex-col items-center justify-center p-6 shadow-sm">
              <div className="animate-pulse flex space-y-4 w-full">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                      <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-6 font-medium animate-bounce">Consulting FixAI database...</p>
            </div>
          )}

          {result && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-6">
              {/* Recommended service */}
              <div className="border-b border-gray-100 pb-5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Recommended Service Category</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-5 w-5 text-indigo-600" />
                    <span className="text-lg font-bold text-gray-900">{result.categoryObj?.name || 'Home Service'}</span>
                  </div>
                  <button
                    onClick={handleBookNow}
                    className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Book Now
                    <ChevronRight className="h-4 w-4 ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Status parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Estimated Severity</span>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium mt-1 ${
                    result.severity === 'High' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10' :
                    result.severity === 'Medium' ? 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/10' :
                    'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10'
                  }`}>
                    {result.severity}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Professional Assistance</span>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium mt-1 ${
                    result.professionalHelp ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/10' :
                    'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10'
                  }`}>
                    {result.professionalHelp ? 'Recommended' : 'Self-Fix Possible'}
                  </span>
                </div>
              </div>

              {/* Possible causes */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2.5">Possible Causes</h3>
                <ul className="space-y-2">
                  {result.causes.map((cause, i) => (
                    <li key={i} className="flex items-start text-xs text-gray-600">
                      <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full mt-1.5 mr-2 shrink-0"></span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Troubleshooting */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2.5 font-sans">Basic Troubleshooting Steps</h3>
                <ol className="space-y-2">
                  {result.troubleshooting.map((step, i) => (
                    <li key={i} className="flex items-start text-xs text-gray-600">
                      <span className="font-bold text-indigo-600 mr-2.5 shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Booking CTAs */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-[10px] text-gray-400 leading-normal mb-3">FixAI diagnostics are guidelines generated by analysis models and should not replace safety precautions. Switch off circuit breakers for high electrical loads.</p>
                <button
                  onClick={handleBookNow}
                  className="w-full flex items-center justify-center py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  Book Service for {result.categoryObj?.name || 'This Category'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixAI;
