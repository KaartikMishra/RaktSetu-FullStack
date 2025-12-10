/**
 * DonorEligibilityQuiz Component
 * 
 * A 10-question eligibility quiz for blood donors with:
 * - Progress bar
 * - Score calculation
 * - Eligibility result display
 * - Reasons for ineligibility
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Heart
} from 'lucide-react';

// Quiz question structure
interface QuizQuestion {
    id: number;
    question: string;
    options: { value: string; label: string; eligible: boolean; weight: number }[];
    category: string;
}

// Quiz answers structure
export interface QuizAnswers {
    [key: number]: string;
}

// Quiz result structure
export interface QuizResult {
    isEligible: boolean;
    score: number;
    maxScore: number;
    percentage: number;
    ineligibleReasons: string[];
    answers: QuizAnswers;
    completedAt: Date;
}

// 10 Eligibility Questions
const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: 1,
        category: 'Age',
        question: 'Are you between 18 to 60 years old?',
        options: [
            { value: 'yes', label: 'Yes', eligible: true, weight: 10 },
            { value: 'no', label: 'No', eligible: false, weight: 0 }
        ]
    },
    {
        id: 2,
        category: 'Weight',
        question: 'Is your weight more than 50 kg?',
        options: [
            { value: 'yes', label: 'Yes', eligible: true, weight: 10 },
            { value: 'no', label: 'No', eligible: false, weight: 0 }
        ]
    },
    {
        id: 3,
        category: 'Last Donation',
        question: 'When was your last blood donation?',
        options: [
            { value: 'within_3_months', label: 'Within 3 months', eligible: false, weight: 0 },
            { value: '3_to_6_months', label: 'Before 3-6 months', eligible: true, weight: 8 },
            { value: 'more_than_6_months', label: 'More than 6 months', eligible: true, weight: 10 },
            { value: 'never', label: 'Never', eligible: true, weight: 10 }
        ]
    },
    {
        id: 4,
        category: 'Current Health',
        question: 'Do you currently have fever, infection, cold or cough?',
        options: [
            { value: 'yes', label: 'Yes', eligible: false, weight: 0 },
            { value: 'no', label: 'No', eligible: true, weight: 10 }
        ]
    },
    {
        id: 5,
        category: 'Medication',
        question: 'Are you currently taking any medication?',
        options: [
            { value: 'yes', label: 'Yes', eligible: false, weight: 0 },
            { value: 'no', label: 'No', eligible: true, weight: 10 }
        ]
    },
    {
        id: 6,
        category: 'Recent Diseases',
        question: 'Have you had typhoid, malaria or hepatitis in last 6 months?',
        options: [
            { value: 'yes', label: 'Yes', eligible: false, weight: 0 },
            { value: 'no', label: 'No', eligible: true, weight: 10 }
        ]
    },
    {
        id: 7,
        category: 'Lifestyle',
        question: 'Do you consume alcohol or smoke regularly?',
        options: [
            { value: 'yes_regular', label: 'Yes, regularly', eligible: false, weight: 0 },
            { value: 'sometimes', label: 'Sometimes', eligible: true, weight: 5 },
            { value: 'no', label: 'No', eligible: true, weight: 10 }
        ]
    },
    {
        id: 8,
        category: 'Surgery',
        question: 'Have you undergone any major surgery in last 6 months?',
        options: [
            { value: 'yes', label: 'Yes', eligible: false, weight: 0 },
            { value: 'no', label: 'No', eligible: true, weight: 10 }
        ]
    },
    {
        id: 9,
        category: 'Tattoos/Piercings',
        question: 'Have you had a tattoo or piercing recently (last 6 months)?',
        options: [
            { value: 'yes', label: 'Yes', eligible: false, weight: 0 },
            { value: 'no', label: 'No', eligible: true, weight: 10 }
        ]
    },
    {
        id: 10,
        category: 'Pregnancy',
        question: 'Are you pregnant or breastfeeding right now?',
        options: [
            { value: 'yes', label: 'Yes', eligible: false, weight: 0 },
            { value: 'no', label: 'No', eligible: true, weight: 10 },
            { value: 'prefer_not_to_say', label: 'Prefer not to say', eligible: true, weight: 10 }
        ]
    }
];

// Reason messages for ineligibility
const INELIGIBILITY_REASONS: { [key: string]: string } = {
    '1': 'You must be between 18-60 years old to donate blood.',
    '2': 'Minimum weight of 50 kg is required for blood donation.',
    '3': 'You need to wait at least 3 months between donations.',
    '4': 'Please wait until you recover from illness before donating.',
    '5': 'Some medications may affect blood donation eligibility.',
    '6': 'Recent infections require a waiting period before donation.',
    '7': 'Regular alcohol/smoking may affect blood quality.',
    '8': 'Please wait 6 months after surgery before donating.',
    '9': 'Tattoos/piercings require a 6-month waiting period.',
    '10': 'Pregnancy and breastfeeding affect donation eligibility.'
};

interface DonorEligibilityQuizProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (result: QuizResult) => void;
}

export const DonorEligibilityQuiz: React.FC<DonorEligibilityQuizProps> = ({
    isOpen,
    onClose,
    onComplete
}) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<QuizAnswers>({});
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);

    // Calculate progress percentage
    const progressPercentage = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

    // Handle answer selection
    const handleAnswer = (questionId: number, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    // Go to next question
    const handleNext = () => {
        if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            calculateResult();
        }
    };

    // Go to previous question
    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    // Calculate final result
    const calculateResult = () => {
        let totalScore = 0;
        const maxScore = QUIZ_QUESTIONS.length * 10;
        const ineligibleReasons: string[] = [];
        let hasDisqualifyingAnswer = false;

        QUIZ_QUESTIONS.forEach(question => {
            const answer = answers[question.id];
            const selectedOption = question.options.find(opt => opt.value === answer);

            if (selectedOption) {
                totalScore += selectedOption.weight;

                if (!selectedOption.eligible) {
                    hasDisqualifyingAnswer = true;
                    ineligibleReasons.push(INELIGIBILITY_REASONS[question.id.toString()]);
                }
            }
        });

        const percentage = Math.round((totalScore / maxScore) * 100);
        const isEligible = !hasDisqualifyingAnswer && percentage >= 70;

        const quizResult: QuizResult = {
            isEligible,
            score: totalScore,
            maxScore,
            percentage,
            ineligibleReasons,
            answers,
            completedAt: new Date()
        };

        setResult(quizResult);
        setShowResult(true);
        onComplete(quizResult);
    };

    // Reset quiz
    const resetQuiz = () => {
        setCurrentQuestion(0);
        setAnswers({});
        setShowResult(false);
        setResult(null);
    };

    // Close and reset
    const handleClose = () => {
        resetQuiz();
        onClose();
    };

    if (!isOpen) return null;

    const question = QUIZ_QUESTIONS[currentQuestion];
    const isAnswered = answers[question?.id] !== undefined;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-pink-600 p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Heart className="h-6 w-6" />
                                <h2 className="text-xl font-bold">Eligibility Quiz</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        {!showResult && (
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
                                    <span>{Math.round(progressPercentage)}% Complete</span>
                                </div>
                                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        className="h-full bg-white rounded-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {!showResult ? (
                            /* Quiz Questions */
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuestion}
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -50, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Category Badge */}
                                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full mb-4">
                                        {question.category}
                                    </span>

                                    {/* Question */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                        {question.question}
                                    </h3>

                                    {/* Options */}
                                    <div className="space-y-3">
                                        {question.options.map(option => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleAnswer(question.id, option.value)}
                                                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${answers[question.id] === option.value
                                                        ? 'border-red-500 bg-red-50 text-red-700'
                                                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[question.id] === option.value
                                                                ? 'border-red-500 bg-red-500'
                                                                : 'border-gray-300'
                                                            }`}
                                                    >
                                                        {answers[question.id] === option.value && (
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                        )}
                                                    </div>
                                                    <span className="font-medium">{option.label}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        ) : (
                            /* Result Screen */
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center"
                            >
                                {/* Result Icon */}
                                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${result?.isEligible ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                    {result?.isEligible ? (
                                        <CheckCircle className="h-10 w-10 text-green-600" />
                                    ) : (
                                        <XCircle className="h-10 w-10 text-red-600" />
                                    )}
                                </div>

                                {/* Result Title */}
                                <h3 className={`text-2xl font-bold mb-2 ${result?.isEligible ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {result?.isEligible ? '✅ ELIGIBLE TO DONATE' : '❌ NOT ELIGIBLE'}
                                </h3>

                                {/* Score */}
                                <div className="mb-6">
                                    <p className="text-gray-600">Your Eligibility Score</p>
                                    <div className="text-4xl font-bold text-gray-900">
                                        {result?.percentage}%
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {result?.score} / {result?.maxScore} points
                                    </p>
                                </div>

                                {/* Ineligibility Reasons */}
                                {result && !result.isEligible && result.ineligibleReasons.length > 0 && (
                                    <div className="bg-red-50 rounded-xl p-4 mb-6 text-left">
                                        <div className="flex items-center space-x-2 text-red-700 mb-2">
                                            <AlertTriangle className="h-5 w-5" />
                                            <span className="font-semibold">Reasons for Ineligibility:</span>
                                        </div>
                                        <ul className="space-y-1 text-sm text-red-600">
                                            {result.ineligibleReasons.map((reason, idx) => (
                                                <li key={idx}>• {reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Success Message */}
                                {result?.isEligible && (
                                    <div className="bg-green-50 rounded-xl p-4 mb-6">
                                        <p className="text-green-700">
                                            🎉 Great news! You are eligible to donate blood.
                                            Please proceed to complete your donor registration.
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={resetQuiz}
                                        className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Retake Quiz
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${result?.isEligible
                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                : 'bg-gray-600 hover:bg-gray-700 text-white'
                                            }`}
                                    >
                                        {result?.isEligible ? 'Continue Registration' : 'Close'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer Navigation (only during quiz) */}
                    {!showResult && (
                        <div className="border-t p-4 flex justify-between">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${currentQuestion === 0
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <ChevronLeft className="h-5 w-5" />
                                <span>Previous</span>
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!isAnswered}
                                className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${isAnswered
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <span>{currentQuestion === QUIZ_QUESTIONS.length - 1 ? 'See Result' : 'Next'}</span>
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DonorEligibilityQuiz;
