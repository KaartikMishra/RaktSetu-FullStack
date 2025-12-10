import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, Eye, EyeOff, AlertCircle, CheckCircle, Mail, User, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const schema = yup.object({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  location: yup.string().required('Location is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
  role: yup.string().required('Please select a role'),
  terms: yup.boolean().required().oneOf([true], 'You must accept the terms and conditions'),
}).required();

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  password: string;
  confirmPassword: string;
  role: string;
  terms: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  });

  const selectedRole = watch('role');

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // Replace with your actual client ID
          callback: handleGoogleSignUp,
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleSignUp = async (response: any) => {
    setIsGoogleLoading(true);
    setRegisterError('');

    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));

      const userData = {
        name: payload.name,
        email: payload.email,
        password: 'google-auth-temp', // Placeholder for Google auth
        phone: '', // Google doesn't provide phone by default
        role: selectedRole,
        googleAuth: true,
      };

      const result = await registerUser(userData);

      if (result.success) {
        setRegisterSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setRegisterError(result.message || 'Google sign-up failed. Please try again.');
      }
    } catch (error) {
      setRegisterError('Google sign-up failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setRegisterError('');
    const result = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      location: data.location,
      role: data.role
    });

    if (result.success) {
      setRegisterSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setRegisterError(result.message || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleButtonClick = () => {
    if (!selectedRole) {
      setRegisterError('Please select a role before signing up with Google.');
      return;
    }

    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  const roles = [
    {
      value: 'donor',
      label: 'Blood Donor',
      description: 'Donate blood and track your donations',
      color: 'bg-red-100 text-red-800',
      icon: '🩸'
    },
    {
      value: 'hospital',
      label: 'Hospital Staff',
      description: 'Manage hospital blood requests and inventory',
      color: 'bg-purple-100 text-purple-800',
      icon: '🏥'
    },
    {
      value: 'seeker',
      label: 'Blood Seeker',
      description: 'Search and request blood units',
      color: 'bg-green-100 text-green-800',
      icon: '🔍'
    },
  ];

  if (registerSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-lg"
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">Your account has been created. Redirecting to login...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Heart className="h-12 w-12 text-red-600 animate-pulse" />
            <h1 className="text-3xl font-bold text-gray-900">RaktSetu</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">Join our community and start making a difference</p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
          onSubmit={handleSubmit(onSubmit)}
        >
          {registerError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2"
            >
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{registerError}</span>
            </motion.div>
          )}

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-3">
              I want to register as
            </label>
            <div className="space-y-3">
              {roles.map((role) => (
                <label key={role.value} className="relative cursor-pointer">
                  <input
                    {...register('role')}
                    type="radio"
                    value={role.value}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 rounded-lg peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-gray-300 transition-all duration-200 transform hover:scale-105">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{role.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{role.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{role.description}</div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Google Sign Up Button */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Quick registration with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleButtonClick}
              disabled={isGoogleLoading || !selectedRole}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {isGoogleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign up with Google
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or register with email</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  {...register('name')}
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Enter your full name"
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Enter your phone number"
                />
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location (City/Area)
              </label>
              <div className="relative">
                <input
                  {...register('location')}
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Enter your city or area"
                />
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Create password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              {...register('terms')}
              type="checkbox"
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              I agree to the{' '}
              <Link to="/terms" className="text-red-600 hover:text-red-500 transition-colors">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-red-600 hover:text-red-500 transition-colors">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {isSubmitting || loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-red-600 hover:text-red-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};