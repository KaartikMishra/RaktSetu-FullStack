/**
 * HospitalList Component
 * 
 * Displays a list of hospitals fetched from the API.
 * Used by blood seekers to find hospitals in their area.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    MapPin,
    Phone,
    Globe,
    Clock,
    Heart,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

// Hospital interface matching our API response
export interface Hospital {
    id: string;
    name: string;
    address: string;
    city: string;
    state?: string;
    phone: string;
    email?: string;
    website?: string;
    type: 'government' | 'private' | 'trust' | 'clinic';
    hasBloodBank: boolean;
    availableBloodGroups?: string[];
    is24x7?: boolean;
    coordinates?: [number, number];
}

interface HospitalListProps {
    hospitals: Hospital[];
    searchedLocation: string;
    isLoading?: boolean;
}

// Get badge color based on hospital type
const getTypeColor = (type: string) => {
    switch (type) {
        case 'government':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'private':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'trust':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'clinic':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

// Individual hospital card
const HospitalCard: React.FC<{ hospital: Hospital; index: number }> = ({ hospital, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <Building2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{hospital.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{hospital.city}</span>
                            {hospital.state && (
                                <span className="text-sm text-gray-500">• {hospital.state}</span>
                            )}
                        </div>
                    </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(hospital.type)}`}>
                    {hospital.type.charAt(0).toUpperCase() + hospital.type.slice(1)}
                </span>
            </div>

            {/* Address */}
            <div className="mb-4 text-sm text-gray-600">
                <p>{hospital.address}</p>
            </div>

            {/* Blood Bank & 24x7 badges */}
            <div className="flex flex-wrap gap-2 mb-4">
                {hospital.hasBloodBank && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-full">
                        <Heart className="h-3 w-3 mr-1" />
                        Blood Bank Available
                    </span>
                )}
                {hospital.is24x7 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                        <Clock className="h-3 w-3 mr-1" />
                        24x7 Open
                    </span>
                )}
            </div>

            {/* Available Blood Groups */}
            {hospital.availableBloodGroups && hospital.availableBloodGroups.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Available Blood Groups:</p>
                    <div className="flex flex-wrap gap-1">
                        {hospital.availableBloodGroups.map((group) => (
                            <span
                                key={group}
                                className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded"
                            >
                                {group}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Contact Buttons */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <a
                    href={`tel:${hospital.phone}`}
                    className="flex-1 min-w-[120px] bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                </a>
                {hospital.website && (
                    <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[120px] bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                    </a>
                )}
                {hospital.coordinates && hospital.coordinates[0] !== 0 && (
                    <a
                        href={`https://www.google.com/maps?q=${hospital.coordinates[1]},${hospital.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[120px] bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        <ExternalLink className="h-4 w-4" />
                        <span>Directions</span>
                    </a>
                )}
            </div>
        </motion.div>
    );
};

// Main Hospital List Component
export const HospitalList: React.FC<HospitalListProps> = ({
    hospitals,
    searchedLocation,
    isLoading = false
}) => {
    // Loading state
    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                    <span className="text-gray-600">Searching for hospitals...</span>
                </div>
            </div>
        );
    }

    // No hospitals found
    if (hospitals.length === 0) {
        return (
            <div className="text-center py-12 bg-yellow-50 rounded-xl border border-yellow-200">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Hospitals Found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                    No hospitals found for "<strong>{searchedLocation}</strong>".
                    Try searching with a different city name or check nearby areas.
                </p>
            </div>
        );
    }

    // Display hospitals
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Found {hospitals.length} Hospital{hospitals.length !== 1 ? 's' : ''} in "{searchedLocation}"
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Showing hospitals with blood banks in your area
                    </p>
                </div>
            </div>

            {/* Hospital Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospitals.map((hospital, index) => (
                    <HospitalCard key={hospital.id} hospital={hospital} index={index} />
                ))}
            </div>
        </div>
    );
};

export default HospitalList;
