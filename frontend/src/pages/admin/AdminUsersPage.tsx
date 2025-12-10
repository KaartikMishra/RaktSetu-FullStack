import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar, SidebarBody, SidebarLink } from '../../components/ui/sidebar';
import { motion } from 'framer-motion';
import {
    Users,
    Heart,
    Search,
    Trash2,
    RefreshCw,
    UserCheck,
    Building,
    AlertCircle
} from 'lucide-react';
import {
    IconBrandTabler,
    IconSettings,
    IconUsers,
    IconHeart,
    IconBuilding,
    IconChartBar
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

// Types for user data
interface UserProfile {
    bloodGroup?: string;
    hospitalName?: string;
    address?: string;
}

interface UserData {
    _id: string;
    id?: string;
    name: string;
    email: string;
    phone: string;
    location?: string;
    role: 'admin' | 'donor' | 'seeker' | 'hospital';
    verified: boolean;
    profile?: UserProfile;
    createdAt: string;
}

interface UsersResponse {
    success: boolean;
    count: number;
    total: number;
    page: number;
    pages: number;
    data: {
        users: UserData[];
    };
}

// Role configuration for display
const roleConfig = {
    all: { label: 'All Users', icon: Users, color: 'bg-gray-100 text-gray-800' },
    donor: { label: 'Blood Donors', icon: Heart, color: 'bg-red-100 text-red-800' },
    hospital: { label: 'Hospital Staff', icon: Building, color: 'bg-purple-100 text-purple-800' },
    seeker: { label: 'Blood Seekers', icon: UserCheck, color: 'bg-green-100 text-green-800' },
    admin: { label: 'Administrators', icon: Users, color: 'bg-blue-100 text-blue-800' }
};

export const AdminUsersPage: React.FC = () => {
    const { user, token } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const API_BASE = '/api';

    // Sidebar navigation links
    const sidebarLinks = [
        {
            label: "Dashboard",
            href: "/admin/dashboard",
            icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
        {
            label: "Users",
            href: "/admin/users",
            icon: <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
        {
            label: "Inventory",
            href: "/admin/inventory",
            icon: <IconHeart className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
        {
            label: "Hospitals",
            href: "/admin/hospitals",
            icon: <IconBuilding className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
        {
            label: "Reports",
            href: "/admin/reports",
            icon: <IconChartBar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
        {
            label: "Settings",
            href: "/admin/settings",
            icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
    ];

    // Fetch users from API
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const roleQuery = selectedRole !== 'all' ? `?role=${selectedRole}` : '';
            const response = await fetch(`${API_BASE}/admin/users${roleQuery}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data: UsersResponse = await response.json();

            if (data.success) {
                setUsers(data.data.users);
            } else {
                throw new Error('Failed to load user data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Delete user
    const handleDeleteUser = async (userId: string) => {
        try {
            const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            // Remove user from local state
            setUsers(users.filter(u => (u._id || u.id) !== userId));
            setDeleteConfirm(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete user');
        }
    };

    // Fetch users on mount and when role filter changes
    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token, selectedRole]);

    // Filter users based on search query
    const filteredUsers = users.filter(user => {
        const searchLower = searchQuery.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.phone.includes(searchQuery) ||
            (user.location?.toLowerCase().includes(searchLower))
        );
    });

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get role badge
    const getRoleBadge = (role: string) => {
        const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.all;
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                {config.label.replace('Blood ', '').replace('s', '')}
            </span>
        );
    };

    return (
        <div className={cn(
            "flex w-full max-w-full flex-1 flex-col overflow-hidden bg-gray-50 md:flex-row",
            "min-h-screen"
        )}>
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                        <Logo />
                        <div className="mt-8 flex flex-col gap-2">
                            {sidebarLinks.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: user?.name || "Admin User",
                                href: "#",
                                icon: (
                                    <img
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80"
                                        className="h-7 w-7 shrink-0 rounded-full"
                                        width={50}
                                        height={50}
                                        alt="Avatar"
                                    />
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Content */}
            <div className="flex flex-1">
                <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-6 dark:border-neutral-700 dark:bg-neutral-900">
                    {/* Header */}
                    <div className="bg-white shadow-sm border-b rounded-lg p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                                <p className="text-gray-600">View and manage all registered users by role</p>
                            </div>
                            <button
                                onClick={fetchUsers}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>

                    {/* Role Filter Tabs */}
                    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                        <div className="flex flex-wrap gap-2">
                            {(['all', 'donor', 'hospital', 'seeker'] as const).map((role) => {
                                const config = roleConfig[role];
                                const Icon = config.icon;
                                const count = role === 'all' ? filteredUsers.length : users.filter(u => u.role === role).length;

                                return (
                                    <button
                                        key={role}
                                        onClick={() => setSelectedRole(role)}
                                        className={cn(
                                            "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                            selectedRole === role
                                                ? "bg-red-600 text-white shadow-md"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{config.label}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-xs",
                                            selectedRole === role
                                                ? "bg-white/20 text-white"
                                                : "bg-gray-200 text-gray-600"
                                        )}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, phone, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2"
                        >
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <span className="text-red-700">{error}</span>
                        </motion.div>
                    )}

                    {/* Users Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-xl shadow-md overflow-hidden"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <Users className="h-16 w-16 mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No users found</p>
                                <p className="text-sm">Try adjusting your search or filter criteria</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Registered
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map((userData) => (
                                            <tr key={userData._id || userData.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-medium">
                                                                {userData.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                                                            <div className="text-sm text-gray-500">{userData.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{userData.phone}</div>
                                                    {userData.profile?.bloodGroup && (
                                                        <div className="text-sm text-red-600 font-medium">
                                                            Blood: {userData.profile.bloodGroup}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {userData.location || userData.profile?.address || 'Not specified'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getRoleBadge(userData.role)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(userData.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {userData.role !== 'admin' && (
                                                        deleteConfirm === (userData._id || userData.id) ? (
                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={() => handleDeleteUser(userData._id || userData.id!)}
                                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteConfirm(null)}
                                                                    className="text-gray-600 hover:text-gray-800"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setDeleteConfirm(userData._id || userData.id!)}
                                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                                title="Delete user"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>

                    {/* Summary Stats */}
                    {!loading && filteredUsers.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
                        >
                            {(['donor', 'hospital', 'seeker', 'admin'] as const).map((role) => {
                                const config = roleConfig[role];
                                const Icon = config.icon;
                                const count = users.filter(u => u.role === role).length;

                                return (
                                    <div
                                        key={role}
                                        className={cn(
                                            "p-4 rounded-lg border flex items-center space-x-3",
                                            config.color.replace('text-', 'border-').replace('100', '200')
                                        )}
                                    >
                                        <div className={cn("p-2 rounded-lg", config.color)}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                                            <p className="text-sm text-gray-600">{config.label}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Logo component
const Logo = () => {
    return (
        <a
            href="#"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
        >
            <Heart className="h-5 w-6 shrink-0 text-red-600" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium whitespace-pre text-black dark:text-white"
            >
                RaktSetu
            </motion.span>
        </a>
    );
};

export default AdminUsersPage;
