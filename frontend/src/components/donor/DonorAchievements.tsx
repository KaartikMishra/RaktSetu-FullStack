/**
 * DonorAchievements Component
 * 
 * Displays donor achievement badges based on donation frequency:
 * - 🥇 GOLD: 12+ donations/year (donates every month)
 * - 🥈 SILVER: 6+ donations/year (donates every 2 months)
 * - 🎖 BRONZE: 2+ donations/year (donates every 6 months)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';

// Achievement badge types
export type AchievementLevel = 'gold' | 'silver' | 'bronze' | 'none';

export interface DonorAchievementData {
    totalDonations: number;
    currentYear: number;
    donationsThisYear: number;
    currentBadge: AchievementLevel;
    nextBadge: AchievementLevel | null;
    donationsNeeded: number;
    streakMonths: number;
}

// Badge configuration
const BADGE_CONFIG = {
    gold: {
        name: 'Gold Donor',
        emoji: '🥇',
        color: 'from-yellow-400 to-amber-500',
        bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
        borderColor: 'border-yellow-300',
        textColor: 'text-yellow-700',
        requirement: 12,
        description: 'Elite donor - Donates every month!'
    },
    silver: {
        name: 'Silver Donor',
        emoji: '🥈',
        color: 'from-gray-300 to-gray-400',
        bgColor: 'bg-gradient-to-r from-gray-50 to-slate-50',
        borderColor: 'border-gray-300',
        textColor: 'text-gray-700',
        requirement: 6,
        description: 'Regular donor - Donates every 2 months'
    },
    bronze: {
        name: 'Bronze Donor',
        emoji: '🎖',
        color: 'from-orange-400 to-orange-500',
        bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-700',
        requirement: 2,
        description: 'Active donor - Donates every 6 months'
    },
    none: {
        name: 'New Donor',
        emoji: '🌟',
        color: 'from-blue-400 to-blue-500',
        bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-700',
        requirement: 0,
        description: 'Start your donation journey!'
    }
};

// Calculate achievement data based on donation history
export const calculateAchievement = (donationsThisYear: number, totalDonations: number): DonorAchievementData => {
    let currentBadge: AchievementLevel = 'none';
    let nextBadge: AchievementLevel | null = 'bronze';
    let donationsNeeded = 2;

    if (donationsThisYear >= 12) {
        currentBadge = 'gold';
        nextBadge = null;
        donationsNeeded = 0;
    } else if (donationsThisYear >= 6) {
        currentBadge = 'silver';
        nextBadge = 'gold';
        donationsNeeded = 12 - donationsThisYear;
    } else if (donationsThisYear >= 2) {
        currentBadge = 'bronze';
        nextBadge = 'silver';
        donationsNeeded = 6 - donationsThisYear;
    } else {
        donationsNeeded = 2 - donationsThisYear;
    }

    return {
        totalDonations,
        currentYear: new Date().getFullYear(),
        donationsThisYear,
        currentBadge,
        nextBadge,
        donationsNeeded,
        streakMonths: 0 // Can be calculated from donation dates
    };
};

interface DonorAchievementsProps {
    donationsThisYear: number;
    totalDonations: number;
    showProgress?: boolean;
}

export const DonorAchievements: React.FC<DonorAchievementsProps> = ({
    donationsThisYear,
    totalDonations,
    showProgress = true
}) => {
    const achievement = calculateAchievement(donationsThisYear, totalDonations);
    const currentBadgeConfig = BADGE_CONFIG[achievement.currentBadge];
    const nextBadgeConfig = achievement.nextBadge ? BADGE_CONFIG[achievement.nextBadge] : null;

    // Calculate progress to next badge
    const getProgressPercentage = () => {
        if (!nextBadgeConfig) return 100;
        const currentRequirement = currentBadgeConfig.requirement;
        const nextRequirement = nextBadgeConfig.requirement;
        const progress = ((donationsThisYear - currentRequirement) / (nextRequirement - currentRequirement)) * 100;
        return Math.min(Math.max(progress, 0), 100);
    };

    return (
        <div className="space-y-6">
            {/* Current Badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl border-2 ${currentBadgeConfig.bgColor} ${currentBadgeConfig.borderColor}`}
            >
                <div className="flex items-center space-x-4">
                    {/* Badge Icon */}
                    <div className="text-5xl">{currentBadgeConfig.emoji}</div>

                    {/* Badge Info */}
                    <div className="flex-1">
                        <h3 className={`text-xl font-bold ${currentBadgeConfig.textColor}`}>
                            {currentBadgeConfig.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{currentBadgeConfig.description}</p>

                        {/* Stats */}
                        <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                                <Trophy className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium">{totalDonations} total</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">{donationsThisYear} this year</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Progress to Next Badge */}
            {showProgress && nextBadgeConfig && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-4 rounded-xl border border-gray-200"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <Target className="h-5 w-5 text-gray-500" />
                            <span className="font-medium text-gray-700">Next Goal: {nextBadgeConfig.name}</span>
                        </div>
                        <span className="text-2xl">{nextBadgeConfig.emoji}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getProgressPercentage()}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full rounded-full bg-gradient-to-r ${nextBadgeConfig.color}`}
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                            {donationsThisYear} / {nextBadgeConfig.requirement} donations
                        </span>
                        <span className={`font-medium ${nextBadgeConfig.textColor}`}>
                            {achievement.donationsNeeded} more needed
                        </span>
                    </div>
                </motion.div>
            )}

            {/* All Badges Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-4 rounded-xl border border-gray-200"
            >
                <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Achievement Levels</span>
                </h4>

                <div className="grid grid-cols-3 gap-3">
                    {(['bronze', 'silver', 'gold'] as const).map((level, index) => {
                        const config = BADGE_CONFIG[level];
                        const isAchieved =
                            (level === 'bronze' && donationsThisYear >= 2) ||
                            (level === 'silver' && donationsThisYear >= 6) ||
                            (level === 'gold' && donationsThisYear >= 12);

                        return (
                            <div
                                key={level}
                                className={`p-3 rounded-lg text-center border-2 transition-all ${isAchieved
                                        ? `${config.bgColor} ${config.borderColor}`
                                        : 'bg-gray-50 border-gray-200 opacity-50'
                                    }`}
                            >
                                <div className="text-3xl mb-1">{config.emoji}</div>
                                <p className={`text-xs font-medium ${isAchieved ? config.textColor : 'text-gray-500'}`}>
                                    {config.requirement}+ / year
                                </p>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

// Badge display for profiles and lists
export const AchievementBadge: React.FC<{ level: AchievementLevel; size?: 'sm' | 'md' | 'lg' }> = ({
    level,
    size = 'md'
}) => {
    const config = BADGE_CONFIG[level];
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-4xl'
    };

    return (
        <span
            className={`${sizeClasses[size]}`}
            title={`${config.name}: ${config.description}`}
        >
            {config.emoji}
        </span>
    );
};

export default DonorAchievements;
