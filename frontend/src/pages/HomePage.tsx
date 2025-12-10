import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, UserPlus, Building, Shield, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: 'Find Blood Fast',
      description: 'Quickly search for available blood units by type and location'
    },
    {
      icon: UserPlus,
      title: 'Easy Donor Registration',
      description: 'Simple signup process for donors with eligibility checking'
    },
    {
      icon: Building,
      title: 'Hospital Management',
      description: 'Comprehensive tools for hospitals to manage blood requests'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Advanced security measures to protect sensitive data'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Live inventory updates and request status tracking'
    },
    {
      icon: MapPin,
      title: 'Location-based',
      description: 'Find nearest donors, blood banks, and hospitals'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 via-red-700 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Heart className="h-16 w-16 text-white animate-pulse" />
              <h1 className="text-5xl md:text-6xl font-bold">RaktSetu</h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Connecting hearts, saving lives. A comprehensive blood bank management system 
              that bridges donors, hospitals, and those in need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/seeker/search"
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Find Blood Now
              </Link>
              <Link
                to="/donor/register"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-red-600 transition-all duration-300 transform hover:scale-105"
              >
                Become a Donor
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Portal Links Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Your Portal</h2>
            <p className="text-lg text-gray-600">Choose your role to access dedicated features and dashboard</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: 'Admin Portal', 
                path: '/admin/login', 
                icon: Shield, 
                description: 'Manage system, users, and analytics',
                color: 'bg-blue-600' 
              },
              { 
                title: 'Donor Portal', 
                path: '/donor/login', 
                icon: Heart, 
                description: 'Track donations and eligibility',
                color: 'bg-red-600' 
              },
              { 
                title: 'Blood Seeker', 
                path: '/seeker/search', 
                icon: Search, 
                description: 'Find and request blood units',
                color: 'bg-green-600' 
              },
              { 
                title: 'Hospital Portal', 
                path: '/hospital/login', 
                icon: Building, 
                description: 'Manage requests and inventory',
                color: 'bg-purple-600' 
              }
            ].map((portal, index) => (
              <motion.div
                key={portal.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Link
                  to={portal.path}
                  className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-6"
                >
                  <div className={`${portal.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <portal.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{portal.title}</h3>
                  <p className="text-gray-600">{portal.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RaktSetu?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our advanced platform makes blood management efficient, secure, and accessible for everyone
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Save Lives?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join our community of heroes making a difference every day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/donor/register"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Register as Donor
              </Link>
              <Link
                to="/hospital/register"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
              >
                Register Hospital
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};