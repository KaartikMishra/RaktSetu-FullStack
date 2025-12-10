/**
 * BloodSearchPage - Search for blood and find hospitals
 * 
 * This page allows blood seekers to:
 * 1. Search for hospitals by location
 * 2. View available blood units
 * 3. Contact hospitals directly
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { HospitalList, type Hospital } from '../../components/HospitalList';
import { PlaceholdersAndVanishInput } from '../../components/ui/placeholders-and-vanish-input';
import { AnimatedTooltip } from '../../components/ui/animated-tooltip';

import {
  Search,
  MapPin,
  Phone,
  Clock,
  Heart,
  Filter,
  AlertCircle,
  Building2,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';

// API base URL - adjust based on your setup
const API_BASE = 'http://localhost:3000';

interface Donor {
  id: number;
  name: string;
  designation: string;
  image: string;
  bloodGroup: string;
  lastDonation: string;
}

export const BloodSearchPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchedLocation, setSearchedLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const placeholders = [
    "Search hospitals in Delhi...",
    "Find blood banks in Mumbai...",
    "Hospitals in Bangalore...",
    "Search Chennai hospitals...",
    "Find blood in Kolkata...",
    "Hospitals in Hyderabad...",
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const recentDonors: Donor[] = [
    {
      id: 1,
      name: "Rahul Sharma",
      designation: "O+ Donor",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      bloodGroup: "O+",
      lastDonation: "2 days ago"
    },
    {
      id: 2,
      name: "Priya Verma",
      designation: "A- Donor",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      bloodGroup: "A-",
      lastDonation: "1 week ago"
    },
    {
      id: 3,
      name: "Amit Kumar",
      designation: "B+ Donor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      bloodGroup: "B+",
      lastDonation: "3 days ago"
    },
    {
      id: 4,
      name: "Sneha Patel",
      designation: "AB+ Donor",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      bloodGroup: "AB+",
      lastDonation: "5 days ago"
    }
  ];

  /**
   * Fetch hospitals from the API based on location
   * This is the key function that connects frontend to backend!
   */
  const fetchHospitals = async (location: string) => {
    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      // Call our backend API endpoint
      const response = await fetch(
        `${API_BASE}/api/hospitals/search?location=${encodeURIComponent(location)}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Map API response to our Hospital interface
        const hospitalList: Hospital[] = data.data.hospitals.map((h: any) => ({
          id: h.id || h._id,
          name: h.name,
          address: h.address,
          city: h.city,
          state: h.state,
          phone: h.phone,
          email: h.email,
          website: h.website,
          type: h.type || 'private',
          hasBloodBank: h.hasBloodBank !== false,
          availableBloodGroups: h.availableBloodGroups || [],
          is24x7: h.is24x7,
          coordinates: h.coordinates
        }));

        setHospitals(hospitalList);
        setSearchedLocation(location);
        console.log(`✅ Found ${hospitalList.length} hospitals for "${location}"`);
      } else {
        setError(data.message || 'Failed to fetch hospitals');
        setHospitals([]);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError('Unable to connect to server. Please try again.');
      setHospitals([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle form submission - search for hospitals
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Extract city name from search query
    const location = searchQuery.trim();

    if (location) {
      fetchHospitals(location);
    }
  };

  // Quick search buttons for major cities
  const quickSearchCities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Blood & Hospitals</h1>
              <p className="text-gray-600 mt-1">Search for hospitals with blood banks in your area</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Recent Donors</span>
              </div>
              <AnimatedTooltip items={recentDonors} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleSearch}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Quick Search Buttons */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-3">Quick search by city:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickSearchCities.map((city) => (
                <button
                  key={city}
                  onClick={() => fetchHospitals(city)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Hospital Results */}
        {hasSearched && (
          <HospitalList
            hospitals={hospitals}
            searchedLocation={searchedLocation}
            isLoading={isLoading}
          />
        )}

        {/* Initial State - Before Search */}
        {!hasSearched && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Search for Hospitals
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter a city name above to find hospitals with blood banks in that area.
              You can also use the quick search buttons to find hospitals in major cities.
            </p>
          </div>
        )}

        {/* Emergency Section */}
        <div className="mt-12 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Emergency Blood Request</h3>
              <p className="text-red-700 mb-4">
                Need blood urgently? Our emergency hotline is available 24/7 to help you find compatible blood units immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Call Emergency Hotline</span>
                </button>
                <button className="bg-white hover:bg-red-50 text-red-600 border border-red-300 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Submit Emergency Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodSearchPage;