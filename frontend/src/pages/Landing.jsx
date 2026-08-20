import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Wrench, Clock, ArrowRight, Laptop, Smartphone, Wifi, Zap, Droplet, Wind } from 'lucide-react';
import api from '../services/api';

const iconMap = {
  Laptop: Laptop,
  Smartphone: Smartphone,
  Wifi: Wifi,
  Zap: Zap,
  Droplet: Droplet,
  AirVent: Wind,
  Wind: Wind
};

const Landing = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories.slice(0, 6)); // Display first 6 categories
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              F
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Fix<span className="text-indigo-600">Near</span></span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
              Log in
            </Link>
            <Link to="/register" className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm transition-all">
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-indigo-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 mb-6">
                Verified Local Services
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Get your home issues resolved, <span className="text-indigo-600">instantly.</span>
              </h1>
              <p className="mt-4 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl leading-relaxed">
                Connect with verified local technicians for plumbing, electricals, laptop repairs, AC service and more. Diagnosed with smart FixAI.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register?role=customer"
                  className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
                >
                  Book a Service
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/register?role=technician"
                  className="flex items-center justify-center px-6 py-3 border border-gray-200 text-base font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all"
                >
                  Join as Technician
                </Link>
              </div>
            </div>
            <div className="mt-12 sm:mt-16 lg:mt-0 lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md lg:max-w-none">
                <div className="absolute inset-0 bg-indigo-200 rounded-3xl transform rotate-3 scale-95 blur-lg opacity-40"></div>
                <div className="relative bg-white border border-gray-100 rounded-2xl shadow-xl p-8">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <span className="h-3 w-3 bg-red-400 rounded-full"></span>
                      <span className="h-3 w-3 bg-yellow-400 rounded-full"></span>
                      <span className="h-3 w-3 bg-green-400 rounded-full"></span>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">FixAI Diagnoser</span>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-100">
                      <strong>Customer:</strong> "My refrigerator is making a clicking sound and food is getting spoiled."
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">Diagnosis Status</span>
                        <div className="h-px bg-gray-100 flex-1"></div>
                      </div>
                      <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-4 space-y-2 text-xs">
                        <p className="font-semibold text-indigo-900">Recommended Category: Refrigerator Repair</p>
                        <p className="text-indigo-700"><strong>Possible Causes:</strong> Condenser coil dust, failing starter relay, door seal leak.</p>
                        <p className="text-indigo-700"><strong>Troubleshooting:</strong> 1. Unplug and pull away from wall. 2. Vacuum back coils. 3. Check gasket.</p>
                        <p className="font-medium text-red-600">Severity: Medium | Professional assistance advised.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Why Choose FixNear?</h2>
            <p className="mt-4 text-gray-500">We make finding trusted help easy, transparent, and completely automated.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Verified Technicians</h3>
              <p className="mt-2 text-sm text-gray-500">Every technician is manually approved by administrators after verify credentials.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-6">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">FixAI Diagnostics</h3>
              <p className="mt-2 text-sm text-gray-500">Use our AI helper to diagnose your problems and recommend correct categories.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-6">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Real-Time Status</h3>
              <p className="mt-2 text-sm text-gray-500">Track your technician location and service progress directly from your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories preview */}
      {categories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Popular Categories</h2>
                <p className="mt-2 text-gray-500 text-sm">Select a category to get professional assistance.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((cat) => {
                const IconComponent = iconMap[cat.icon] || Wrench;
                return (
                  <Link
                    key={cat._id}
                    to="/login"
                    className="group border border-gray-100 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50/50 rounded-xl p-6 transition-all flex flex-col items-center text-center"
                  >
                    <div className="h-12 w-12 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white rounded-lg flex items-center justify-center text-indigo-600 transition-colors mb-4">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <span className="text-lg font-bold text-white tracking-tight">FixNear</span>
          </div>
          <p className="text-xs">© 2026 FixNear Inc. All rights reserved. Real MERN platform.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
