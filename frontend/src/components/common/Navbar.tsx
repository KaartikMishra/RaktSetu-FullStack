import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Get the correct dashboard path based on role
  const getDashboardPath = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-red-500 rounded-lg group-hover:bg-red-600 transition-colors duration-200">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
              RaktSetu
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/')
                ? 'text-red-600 bg-red-50'
                : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                }`}
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(getDashboardPath())
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                    }`}
                >
                  Dashboard
                </Link>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.name}</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive('/')
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                  }`}
              >
                Home
              </Link>

              {user ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive(getDashboardPath())
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                      }`}
                  >
                    Dashboard
                  </Link>

                  <div className="px-3 py-2 border-t border-gray-200 mt-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{user.name}</span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 w-full px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <Link
                    to="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-200 mt-1"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};