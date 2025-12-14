import React from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProfileUploadHelp: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative inline-block ml-2">
            <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                aria-label="Upload Help"
            >
                <HelpCircle className="h-5 w-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl -left-28 top-8"
                    >
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                        <p className="font-semibold mb-1 text-yellow-400">Profile Photo Upload Issue?</p>
                        <ul className="list-disc pl-3 space-y-1 text-gray-300">
                            <li>Upload a clear and recent photo.</li>
                            <li>If not appearing, please refresh the page.</li>
                            <li>Ensure file is less than 5MB.</li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
