/**
 * DonorDashboard - Enhanced Donor Dashboard
 * 
 * Features:
 * - Eligibility Quiz modal
 * - Achievement badges (Gold/Silver/Bronze)
 * - Donation history
 * - Upcoming blood drives
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardCard } from '../../components/dashboard/DashboardCard';
import { DonorEligibilityQuiz, type QuizResult } from '../../components/donor/DonorEligibilityQuiz';
import { DonorAchievements } from '../../components/donor/DonorAchievements';
import { ProfilePhotoUpload } from '../../components/common/ProfilePhotoUpload';
import { ProfileUploadHelp } from '../../components/common/ProfileUploadHelp';
import {
  Heart,
  Calendar,
  Award,
  Clock,
  MapPin,
  ClipboardCheck,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export const DonorDashboard: React.FC = () => {
  const { user, login, updateUser } = useAuth(); // Assuming login or a new updateUser method is available
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [lastQuizResult, setLastQuizResult] = useState<QuizResult | null>(null);

  const donorProfile = user?.profile as any;

  // Mock donation history - in production, fetch from API
  const donationHistory = [
    { id: '1', date: '2024-01-15', location: 'City Blood Bank', status: 'completed', units: 1 },
    { id: '2', date: '2023-11-10', location: 'Hospital Drive', status: 'completed', units: 1 },
    { id: '3', date: '2023-09-05', location: 'Community Center', status: 'completed', units: 1 },
    { id: '4', date: '2023-07-01', location: 'University Campus', status: 'completed', units: 1 },
    { id: '5', date: '2023-04-20', location: 'City Blood Bank', status: 'completed', units: 1 },
  ];

  const upcomingDrives = [
    { id: '1', name: 'Community Health Drive', date: '2024-02-15', location: 'Community Center', distance: '2.3 km' },
    { id: '2', name: 'University Blood Drive', date: '2024-02-20', location: 'State University', distance: '5.1 km' },
    { id: '3', name: 'Corporate Donation Event', date: '2024-02-25', location: 'Tech Park', distance: '7.8 km' },
  ];

  const totalDonations = donorProfile?.totalDonations || donationHistory.length;
  const donationsThisYear = donorProfile?.donationsThisYear || 3;

  const isEligibleToDonate = () => {
    if (!donorProfile?.eligibleNext) return true;
    return new Date() >= new Date(donorProfile.eligibleNext);
  };

  const getDaysUntilEligible = () => {
    if (!donorProfile?.eligibleNext) return 0;
    const eligibleDate = new Date(donorProfile.eligibleNext);
    const today = new Date();
    const diffTime = eligibleDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle quiz completion
  const handleQuizComplete = (result: QuizResult) => {
    setLastQuizResult(result);
    setQuizCompleted(true);
    console.log('Quiz completed:', result);

    // In production, save to backend via API
    // fetch('/api/donors/quiz', { method: 'POST', body: JSON.stringify(result) });
  };

  // Handle photo update
  const handlePhotoUpdate = (newUrl: string) => {
    updateUser({ profilePicture: newUrl });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Eligibility Quiz Modal */}
      <DonorEligibilityQuiz
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        onComplete={handleQuizComplete}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <ProfilePhotoUpload
                currentPhotoUrl={user?.profilePicture}
                onUploadSuccess={handlePhotoUpdate}
              />
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Donor Dashboard</h1>
                  <ProfileUploadHelp />
                </div>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="text-lg font-semibold text-red-600">{donorProfile?.bloodGroup || 'Not Set'}</p>
              </div>
              {/* Take Quiz Button */}
              <button
                onClick={() => setShowQuiz(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                <ClipboardCheck className="h-5 w-5" />
                <span>Take Eligibility Quiz</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quiz Result Banner (if just completed) */}
        {quizCompleted && lastQuizResult && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border-2 ${lastQuizResult.isEligible
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className={`h-6 w-6 ${lastQuizResult.isEligible ? 'text-green-600' : 'text-red-600'}`} />
                <div>
                  <p className={`font-semibold ${lastQuizResult.isEligible ? 'text-green-700' : 'text-red-700'}`}>
                    Eligibility Quiz: {lastQuizResult.isEligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Score: {lastQuizResult.percentage}% ({lastQuizResult.score}/{lastQuizResult.maxScore})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuizCompleted(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Donations"
            value={totalDonations}
            icon={Heart}
            color="red"
            description="Lifetime contributions"
          />
          <DashboardCard
            title="Lives Impacted"
            value={totalDonations * 3}
            icon={Award}
            color="green"
            description="Estimated lives helped"
          />
          <DashboardCard
            title="Next Eligible"
            value={isEligibleToDonate() ? 'Now' : `${getDaysUntilEligible()} days`}
            icon={Clock}
            color={isEligibleToDonate() ? 'green' : 'yellow'}
            description="Ready to donate"
          />
          <DashboardCard
            title="Donation Centers"
            value="12"
            icon={MapPin}
            color="blue"
            description="Nearby locations"
          />
        </div>

        {/* Eligibility Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`p-6 rounded-xl mb-8 border-2 ${isEligibleToDonate()
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
            }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${isEligibleToDonate() ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
              <Heart className={`h-8 w-8 ${isEligibleToDonate() ? 'text-green-600' : 'text-yellow-600'
                }`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-semibold ${isEligibleToDonate() ? 'text-green-800' : 'text-yellow-800'
                }`}>
                {isEligibleToDonate() ? 'Ready to Donate!' : 'Not Eligible Yet'}
              </h3>
              <p className={`${isEligibleToDonate() ? 'text-green-700' : 'text-yellow-700'
                }`}>
                {isEligibleToDonate()
                  ? 'You can donate blood today. Find a nearby drive or center.'
                  : `You'll be eligible to donate again in ${getDaysUntilEligible()} days.`
                }
              </p>
            </div>
            {isEligibleToDonate() && (
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Find Donation Drive
              </button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Donation History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-md"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Donation History</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {donationHistory.map((donation) => (
                <div key={donation.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <Heart className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{donation.location}</h4>
                        <p className="text-sm text-gray-600">{format(new Date(donation.date), 'MMMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{donation.units} unit</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Achievements</h3>
            <DonorAchievements
              donationsThisYear={donationsThisYear}
              totalDonations={totalDonations}
            />
          </motion.div>
        </div>

        {/* Upcoming Drives */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-md"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Blood Drives</h3>
              <button className="text-red-600 hover:text-red-700 text-sm font-medium">View All</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {upcomingDrives.map((drive) => (
              <div key={drive.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <Calendar className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-gray-600">{drive.distance}</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{drive.name}</h4>
                <p className="text-sm text-gray-600 mb-1">📍 {drive.location}</p>
                <p className="text-sm text-gray-600 mb-3">📅 {format(new Date(drive.date), 'MMM d, yyyy')}</p>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Register
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DonorDashboard;