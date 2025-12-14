import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = 'http://localhost:3000';

interface ProfilePhotoUploadProps {
    currentPhotoUrl?: string;
    onUploadSuccess: (newUrl: string) => void;
    variant?: 'circle' | 'square';
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
    currentPhotoUrl,
    onUploadSuccess,
    variant = 'circle'
}) => {
    const { token, user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const displayUrl = currentPhotoUrl
        ? (currentPhotoUrl.startsWith('http') ? currentPhotoUrl : `${API_BASE}${currentPhotoUrl}`)
        : null;

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setError(null);
        setUploading(true);

        const formData = new FormData();
        formData.append('profileDetail', file);

        try {
            const response = await fetch(`${API_BASE}/api/users/profile-photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                onUploadSuccess(data.data.fileUrl);
            } else {
                setError(data.message || 'Failed to upload photo');
            }
        } catch (err) {
            setError('Network error during upload');
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const triggerSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center">
            <div
                className={`relative cursor-pointer group ${variant === 'circle' ? 'rounded-full' : 'rounded-lg'
                    } overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 hover:border-red-500 transition-all`}
                style={{ width: '120px', height: '120px' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={triggerSelect}
            >
                {displayUrl ? (
                    <img
                        src={`${displayUrl}?t=${Date.now()}`} // Cache bust
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Camera className="h-8 w-8 mb-1" />
                        <span className="text-xs">Add Photo</span>
                    </div>
                )}

                {/* Overlay */}
                {(isHovered || uploading) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity">
                        {uploading ? (
                            <Loader className="h-8 w-8 text-white animate-spin" />
                        ) : (
                            <Upload className="h-8 w-8 text-white" />
                        )}
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            {error && (
                <p className="mt-2 text-xs text-red-500 text-center max-w-[200px]">
                    {error}
                </p>
            )}

            <p className="mt-2 text-xs text-gray-500">
                Click to change
            </p>
        </div>
    );
};
