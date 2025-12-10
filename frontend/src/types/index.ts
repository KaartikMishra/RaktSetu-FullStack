export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'donor' | 'seeker' | 'hospital';
  verified: boolean;
  createdAt: string;
  profile?: DonorProfile | HospitalProfile;
}

export interface DonorProfile {
  bloodGroup: BloodGroup;
  dateOfBirth: string;
  weight: number;
  lastDonation?: string;
  eligibleNext?: string;
  totalDonations: number;
  address: string;
  emergencyContact: string;
}

export interface HospitalProfile {
  hospitalName: string;
  license: string;
  address: string;
  contactPerson: string;
  capacity: number;
  specialties: string[];
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface BloodUnit {
  id: string;
  bloodGroup: BloodGroup;
  batchId: string;
  donorId: string;
  donorName: string;
  collectionDate: string;
  expiryDate: string;
  status: 'available' | 'reserved' | 'expired' | 'used';
  location: string;
  volume: number;
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterType: 'hospital' | 'seeker';
  bloodGroup: BloodGroup;
  unitsRequested: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected';
  createdAt: string;
  approvedBy?: string;
  fulfilledAt?: string;
  notes?: string;
}

export interface InventoryStats {
  totalUnits: number;
  expiringUnits: number;
  availableByGroup: Record<BloodGroup, number>;
  lowStockGroups: BloodGroup[];
}

export interface DashboardStats {
  totalDonors: number;
  totalRequests: number;
  activeRequests: number;
  completedRequests: number;
  totalHospitals: number;
  inventoryStats: InventoryStats;
}