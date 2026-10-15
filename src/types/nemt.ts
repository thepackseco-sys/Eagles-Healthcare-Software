export type MobilityLevel = 
  | 'Ambulatory'
  | 'Standard Wheelchair'
  | 'Bariatric Wheelchair'
  | 'Motorized Wheelchair'
  | 'Stretcher / Gurney'
  | 'Two-Person Assist Stretcher';

export type TripStatus = 
  | 'Scheduled'
  | 'Assigned'
  | 'En Route Pickup'
  | 'Arrived Pickup'
  | 'Loaded & In Transit'
  | 'Arrived Dropoff'
  | 'Completed'
  | 'Cancelled';

export type TripType = 
  | 'Routine Dialysis'
  | 'Chemotherapy / Oncology'
  | 'Hospital Discharge'
  | 'Physical Therapy'
  | 'Surgical Outpatient'
  | 'Specialist Consultation'
  | 'Inter-Facility Transfer';

export type InsuranceType = 
  | 'Medicaid'
  | 'Medicare Advantage'
  | 'Private Health Insurance'
  | 'Veterans Affairs (VA)'
  | 'Self-Pay / Facility Contract';

export type BillingStatus = 
  | 'Draft'
  | 'Ready for Billing'
  | 'Claim Submitted'
  | 'Approved'
  | 'Paid'
  | 'Audited';

export interface Checkpoint {
  time: string;
  event: string;
  by: string;
  notes?: string;
}

export interface Trip {
  id: string; // e.g., 'EAG-7102'
  patientName: string;
  patientDob: string;
  patientPhone: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  insuranceType: InsuranceType;
  insuranceId: string;
  
  // Pickup Details
  pickupFacilityName?: string;
  pickupAddress: string;
  pickupRoomOrSuite?: string;
  pickupTime: string; // "08:30" or ISO
  pickupCoords: { lat: number; lng: number };
  pickupInstructions?: string;

  // Dropoff Details
  dropoffFacilityName?: string;
  dropoffAddress: string;
  dropoffRoomOrSuite?: string;
  dropoffTime: string; // "09:15" or ISO
  dropoffCoords: { lat: number; lng: number };
  dropoffInstructions?: string;

  // Medical Requirements
  mobility: MobilityLevel;
  equipment: string[]; // ['Oxygen Concentrator 2L/min', 'Hydraulic Lift', 'Escort/Companion', 'Q-Straint Harness']
  tripType: TripType;
  priority: 'Routine' | 'Priority' | 'Time-Critical' | 'Urgent Hospital Discharge';
  roundTrip: boolean;
  returnPickupTime?: string;

  // Operations & Dispatch
  status: TripStatus;
  assignedDriverId?: string;
  assignedVehicleId?: string;
  distanceMiles: number;
  estMinutes: number;

  // In-Cab Execution
  actualStartOdometer?: number;
  actualEndOdometer?: number;
  patientSignature?: string; // base64 canvas signature
  signeeName?: string;
  signeeRelationship?: string;
  driverNotes?: string;
  notes?: string;

  // Medicaid & NEMT Billing
  hcpcsCode: string; // e.g., 'T2003', 'A0428', 'T2005'
  mileageHcpcsCode: string; // 'S0215'
  baseRate: number;
  mileageRate: number;
  totalBillingAmount: number;
  billingStatus: BillingStatus;
  claimId?: string;

  checkpoints: Checkpoint[];
  createdAt: string;
}

export interface Driver {
  id: string; // 'DRV-101'
  name: string;
  phone: string;
  email: string;
  avatar: string;
  assignedVehicleId: string;
  status: 'Available' | 'En Route' | 'At Pickup' | 'Transporting' | 'At Dropoff' | 'On Break' | 'Off Duty';
  currentCoords: { lat: number; lng: number };
  heading: number;
  certifications: string[];
  completedTripsCount: number;
  rating: number;
  shiftStart: string;
  shiftEnd: string;
  activeTripId?: string;
}

export interface Vehicle {
  id: string; // 'VAN-201'
  name: string;
  makeModel: string;
  year: number;
  plate: string;
  vin: string;
  vehicleType: 'Wheelchair Lift Van' | 'Dual-Stretcher Sprinter' | 'Bariatric Ramp Van' | 'Ambulatory Sedan';
  capacity: {
    ambulatory: number;
    wheelchair: number;
    stretcher: number;
  };
  status: 'In Service' | 'En Route' | 'Maintenance Scheduled' | 'Out of Service';
  currentMileage: number;
  fuelPercent: number;
  lastSafetyCheck: string;
  liftCertificationExpiry: string;
  insuranceExpiry: string;
  equipmentInstalled: string[];
}
