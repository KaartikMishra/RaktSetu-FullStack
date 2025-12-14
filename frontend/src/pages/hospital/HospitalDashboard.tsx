/**
 * HospitalDashboard - Hospital Staff Dashboard
 * 
 * Features:
 * 1. Blood Inventory Management Table
 * 2. Auto Reminder System for Donors
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProfilePhotoUpload } from '../../components/common/ProfilePhotoUpload';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplet,
  Plus,
  Minus,
  RefreshCw,
  Bell,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Package,
  X
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// API base URL
const API_BASE = 'http://localhost:3000';

// Blood group colors for visual distinction
const BLOOD_GROUP_COLORS: { [key: string]: string } = {
  'A+': 'bg-red-100 text-red-800',
  'A-': 'bg-red-200 text-red-900',
  'B+': 'bg-blue-100 text-blue-800',
  'B-': 'bg-blue-200 text-blue-900',
  'AB+': 'bg-purple-100 text-purple-800',
  'AB-': 'bg-purple-200 text-purple-900',
  'O+': 'bg-green-100 text-green-800',
  'O-': 'bg-green-200 text-green-900'
};

// Inventory item interface
interface InventoryItem {
  id: string;
  blood_group: string;
  units_available: number;
  last_updated: string;
  is_low_stock: boolean;
  min_threshold: number;
}

// Donor interface
interface EligibleDonor {
  id: string;
  name: string;
  email: string;
  phone: string;
  blood_group: string;
  last_donation: string | null;
  eligible_from: string;
  reminder_sent: boolean;
}

// Modal for inventory actions
interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bloodGroup: string;
  currentUnits: number;
  action: 'add' | 'update' | 'reduce';
  onSubmit: (units: number) => void;
  isLoading: boolean;
}

const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  bloodGroup,
  currentUnits,
  action,
  onSubmit,
  isLoading
}) => {
  const [units, setUnits] = useState<string>('');

  if (!isOpen) return null;

  const actionConfig = {
    add: { title: 'Add Stock', color: 'green', label: 'Units to Add' },
    update: { title: 'Update Stock', color: 'blue', label: 'New Total Units' },
    reduce: { title: 'Reduce Stock', color: 'red', label: 'Units to Reduce' }
  };

  const config = actionConfig[action];

  const handleSubmit = () => {
    const numUnits = parseInt(units);
    if (!isNaN(numUnits) && numUnits > 0) {
      onSubmit(numUnits);
      setUnits('');
    }
  };

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
          className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{config.title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${BLOOD_GROUP_COLORS[bloodGroup]}`}>
              {bloodGroup}
            </span>
            <p className="text-gray-600 mt-2">Current stock: {currentUnits} units</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.label}
            </label>
            <input
              type="number"
              min="1"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter units"
              autoFocus
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!units || isLoading}
              className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${action === 'add' ? 'bg-green-600 hover:bg-green-700' :
                action === 'update' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
            >
              {isLoading ? 'Processing...' : config.title}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Hospital Dashboard Component
export const HospitalDashboard: React.FC = () => {
  const { user, token, updateUser } = useAuth();

  // Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'add' | 'update' | 'reduce'>('add');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Donor reminders state
  const [donors, setDonors] = useState<EligibleDonor[]>([]);
  const [donorsLoading, setDonorsLoading] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState('');

  // Handle photo update
  // Handle photo update
  const handlePhotoUpdate = (newUrl: string) => {
    updateUser({ profilePicture: newUrl });
  };

  // Fetch inventory on mount
  useEffect(() => {
    fetchInventory();
    fetchEligibleDonors();
  }, []);

  // Fetch blood inventory
  const fetchInventory = async () => {
    setInventoryLoading(true);
    setInventoryError('');

    try {
      const response = await fetch(`${API_BASE}/api/hospital/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setInventory(data.data.inventory);
      } else {
        setInventoryError(data.message || 'Failed to fetch inventory');
      }
    } catch (error) {
      setInventoryError('Unable to connect to server');
    } finally {
      setInventoryLoading(false);
    }
  };

  // Fetch eligible donors
  const fetchEligibleDonors = async () => {
    setDonorsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/hospital/reminders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setDonors(data.data.donors);
      }
    } catch (error) {
      console.error('Error fetching donors:', error);
    } finally {
      setDonorsLoading(false);
    }
  };

  // Open modal for inventory action
  const openModal = (item: InventoryItem, action: 'add' | 'update' | 'reduce') => {
    setSelectedItem(item);
    setModalAction(action);
    setModalOpen(true);
  };

  // Handle inventory action
  const handleInventoryAction = async (units: number) => {
    if (!selectedItem) return;

    setActionLoading(true);

    try {
      const endpoint = `/api/hospital/inventory/${modalAction}`;
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          blood_group: selectedItem.blood_group,
          units: units
        })
      });

      const data = await response.json();

      if (data.success) {
        setModalOpen(false);
        fetchInventory(); // Refresh data
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (error) {
      alert('Error performing action');
    } finally {
      setActionLoading(false);
    }
  };

  // Send reminders to all eligible donors
  const sendAllReminders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/hospital/reminders/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setReminderSuccess(data.message);
        fetchEligibleDonors(); // Refresh
        setTimeout(() => setReminderSuccess(''), 5000);
      }
    } catch (error) {
      console.error('Error sending reminders:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ProfilePhotoUpload
                currentPhotoUrl={user?.profilePicture}
                onUploadSuccess={handlePhotoUpdate}
                variant="square"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hospital Dashboard</h1>
                <p className="text-gray-600">
                  Welcome, {(user?.profile as any)?.hospitalName || user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">Blood Bank Management</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* BLOOD INVENTORY MANAGEMENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md mb-8"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Droplet className="h-6 w-6 text-red-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Blood Inventory Management</h2>
                  <p className="text-sm text-gray-600">Hospital apna stock update kare 👇</p>
                </div>
              </div>
              <button
                onClick={fetchInventory}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className={`h-4 w-4 ${inventoryLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {inventoryError && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>{inventoryError}</span>
            </div>
          )}

          {/* Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id} className={`${item.is_low_stock ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${BLOOD_GROUP_COLORS[item.blood_group]}`}>
                        {item.blood_group}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-semibold ${item.is_low_stock ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.units_available} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(item.last_updated), { addSuffix: true })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.is_low_stock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />OK
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openModal(item, 'add')} className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium">
                          <Plus className="h-4 w-4 inline mr-1" />Add
                        </button>
                        <button onClick={() => openModal(item, 'update')} className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium">
                          <RefreshCw className="h-4 w-4 inline mr-1" />Update
                        </button>
                        <button onClick={() => openModal(item, 'reduce')} disabled={item.units_available === 0} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium disabled:opacity-50">
                          <Minus className="h-4 w-4 inline mr-1" />Reduce
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* AUTO REMINDER SYSTEM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Auto Reminder System</h2>
                  <p className="text-sm text-gray-600">Send donation reminders to eligible donors</p>
                </div>
              </div>
              <button
                onClick={sendAllReminders}
                disabled={donors.filter(d => !d.reminder_sent).length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Send Reminders to All</span>
              </button>
            </div>
          </div>

          {reminderSuccess && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>{reminderSuccess}</span>
            </div>
          )}

          {/* Donors Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Donation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eligible From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reminder Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {donorsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading donors...</td>
                  </tr>
                ) : donors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No eligible donors found</p>
                    </td>
                  </tr>
                ) : (
                  donors.map((donor) => (
                    <tr key={donor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{donor.name}</p>
                          <p className="text-sm text-gray-500">{donor.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${BLOOD_GROUP_COLORS[donor.blood_group] || 'bg-gray-100 text-gray-800'}`}>
                          {donor.blood_group}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {donor.last_donation ? format(new Date(donor.last_donation), 'MMM d, yyyy') : 'Never donated'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(donor.eligible_from), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        {donor.reminder_sent ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Inventory Action Modal */}
      <InventoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bloodGroup={selectedItem?.blood_group || ''}
        currentUnits={selectedItem?.units_available || 0}
        action={modalAction}
        onSubmit={handleInventoryAction}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default HospitalDashboard;