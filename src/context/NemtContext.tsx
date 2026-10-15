import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trip, Driver, Vehicle, TripStatus, MobilityLevel } from '../types/nemt';
import { INITIAL_TRIPS, INITIAL_DRIVERS, INITIAL_VEHICLES } from '../data/mockData';

interface NemtContextType {
  trips: Trip[];
  drivers: Driver[];
  vehicles: Vehicle[];
  activeDriverId: string;
  setActiveDriverId: (id: string) => void;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  
  // Actions
  addTrip: (newTrip: Omit<Trip, 'id' | 'createdAt' | 'checkpoints' | 'status'>) => Trip;
  updateTripStatus: (tripId: string, status: TripStatus, notes?: string) => void;
  assignDriverToTrip: (tripId: string, driverId: string) => void;
  autoAssignTrip: (tripId: string) => boolean;
  signAndCompleteTrip: (tripId: string, signatureDataUrl: string, signeeName: string, signeeRelation: string, notes?: string) => void;
  updateDriverStatus: (driverId: string, status: Driver['status']) => void;
  generateEmergencyDischargeTrip: () => void;
  resetAllData: () => void;
  activeTrip: Trip | null;
  selectedTripForDetail: Trip | null;
  setSelectedTripForDetail: (trip: Trip | null) => void;
}

const NemtContext = createContext<NemtContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRIPS: 'eagles_nemt_trips_v1',
  DRIVERS: 'eagles_nemt_drivers_v1',
  VEHICLES: 'eagles_nemt_vehicles_v1',
};

export const NemtProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRIPS);
      return saved ? JSON.parse(saved) : INITIAL_TRIPS;
    } catch {
      return INITIAL_TRIPS;
    }
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRIVERS);
      return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
    } catch {
      return INITIAL_DRIVERS;
    }
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
    } catch {
      return INITIAL_VEHICLES;
    }
  });

  const [activeDriverId, setActiveDriverId] = useState<string>('DRV-101');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [selectedTripForDetail, setSelectedTripForDetail] = useState<Trip | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [drivers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [vehicles]);

  // Simulation engine: subtle vehicle movements on map when active
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setDrivers(prevDrivers =>
        prevDrivers.map(drv => {
          if (drv.status === 'En Route' || drv.status === 'Transporting') {
            // Subtle random crawl along coordinates
            const deltaLat = (Math.random() - 0.48) * 0.0012;
            const deltaLng = (Math.random() - 0.48) * 0.0012;
            const newLat = +(drv.currentCoords.lat + deltaLat).toFixed(4);
            const newLng = +(drv.currentCoords.lng + deltaLng).toFixed(4);
            const heading = Math.floor(Math.random() * 360);
            return {
              ...drv,
              currentCoords: { lat: newLat, lng: newLng },
              heading,
            };
          }
          return drv;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const addTrip = (newTripData: Omit<Trip, 'id' | 'createdAt' | 'checkpoints' | 'status'>): Trip => {
    const newId = `EAG-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTrip: Trip = {
      ...newTripData,
      id: newId,
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
      checkpoints: [
        {
          time: nowTime,
          event: 'Transport request booked into Eagles NEMT CAD',
          by: 'Intake Coordinator',
        },
      ],
    };

    setTrips(prev => [newTrip, ...prev]);
    return newTrip;
  };

  const updateTripStatus = (tripId: string, newStatus: TripStatus, notes?: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTrips(prev =>
      prev.map(t => {
        if (t.id !== tripId) return t;

        const updatedCheckpoints = [
          ...t.checkpoints,
          {
            time: nowTime,
            event: `Status changed to ${newStatus}${notes ? ` - ${notes}` : ''}`,
            by: 'System / In-Cab Terminal',
            notes,
          },
        ];

        return {
          ...t,
          status: newStatus,
          checkpoints: updatedCheckpoints,
          driverNotes: notes || t.driverNotes,
        };
      })
    );

    // Keep driver status in sync
    const targetTrip = trips.find(t => t.id === tripId);
    if (targetTrip && targetTrip.assignedDriverId) {
      let driverStatus: Driver['status'] = 'Available';
      if (newStatus === 'En Route Pickup') driverStatus = 'En Route';
      else if (newStatus === 'Arrived Pickup') driverStatus = 'At Pickup';
      else if (newStatus === 'Loaded & In Transit') driverStatus = 'Transporting';
      else if (newStatus === 'Arrived Dropoff') driverStatus = 'At Dropoff';
      else if (newStatus === 'Completed') driverStatus = 'Available';

      updateDriverStatus(targetTrip.assignedDriverId, driverStatus);
    }
  };

  const assignDriverToTrip = (tripId: string, driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTrips(prev =>
      prev.map(t => {
        if (t.id !== tripId) return t;
        return {
          ...t,
          assignedDriverId: driver.id,
          assignedVehicleId: driver.assignedVehicleId,
          status: t.status === 'Scheduled' ? 'Assigned' : t.status,
          checkpoints: [
            ...t.checkpoints,
            {
              time: nowTime,
              event: `Manually dispatched to Driver ${driver.name} (${driver.assignedVehicleId})`,
              by: 'CAD Dispatcher',
            },
          ],
        };
      })
    );

    setDrivers(prev =>
      prev.map(d => (d.id === driverId ? { ...d, activeTripId: tripId, status: 'En Route' } : d))
    );
  };

  const autoAssignTrip = (tripId: string): boolean => {
    const targetTrip = trips.find(t => t.id === tripId);
    if (!targetTrip) return false;

    // Filter compatible drivers based on vehicle capacity & mobility
    const compatibleVehicles = vehicles.filter(v => {
      if (v.status === 'Out of Service' || v.status === 'Maintenance Scheduled') return false;
      if (targetTrip.mobility.includes('Stretcher')) {
        return v.capacity.stretcher > 0;
      }
      if (targetTrip.mobility.includes('Wheelchair')) {
        return v.capacity.wheelchair > 0;
      }
      return v.capacity.ambulatory > 0 || v.capacity.wheelchair > 0;
    });

    const compatibleVehicleIds = compatibleVehicles.map(v => v.id);

    // Find available driver assigned to compatible vehicle
    const candidateDrivers = drivers.filter(
      d => compatibleVehicleIds.includes(d.assignedVehicleId) && (d.status === 'Available' || !d.activeTripId)
    );

    if (candidateDrivers.length === 0) {
      // Fallback: pick any available driver or driver with fewest runs
      const fallbackDriver = drivers[0];
      if (fallbackDriver) {
        assignDriverToTrip(tripId, fallbackDriver.id);
        return true;
      }
      return false;
    }

    // Pick top rated or first available candidate
    const selected = candidateDrivers.sort((a, b) => b.rating - a.rating)[0];
    assignDriverToTrip(tripId, selected.id);
    return true;
  };

  const signAndCompleteTrip = (
    tripId: string,
    signatureDataUrl: string,
    signeeName: string,
    signeeRelation: string,
    notes?: string
  ) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTrips(prev =>
      prev.map(t => {
        if (t.id !== tripId) return t;
        return {
          ...t,
          status: 'Completed',
          patientSignature: signatureDataUrl,
          signeeName,
          signeeRelationship: signeeRelation,
          driverNotes: notes || t.driverNotes,
          billingStatus: 'Ready for Billing',
          claimId: `CLM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          checkpoints: [
            ...t.checkpoints,
            {
              time: nowTime,
              event: `Trip completed & signed by ${signeeName} (${signeeRelation})`,
              by: 'Electronic Signature Pad',
              notes,
            },
          ],
        };
      })
    );

    // Free the driver
    const target = trips.find(t => t.id === tripId);
    if (target?.assignedDriverId) {
      setDrivers(prev =>
        prev.map(d =>
          d.id === target.assignedDriverId
            ? {
                ...d,
                status: 'Available',
                activeTripId: undefined,
                completedTripsCount: d.completedTripsCount + 1,
              }
            : d
        )
      );
    }
  };

  const updateDriverStatus = (driverId: string, status: Driver['status']) => {
    setDrivers(prev => prev.map(d => (d.id === driverId ? { ...d, status } : d)));
  };

  const generateEmergencyDischargeTrip = () => {
    const newId = `EAG-EMERG-${Math.floor(100 + Math.random() * 900)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const emergencyTrip: Trip = {
      id: newId,
      patientName: 'Geraldine Vance',
      patientDob: '1942-03-15',
      patientPhone: '(404) 555-2091',
      emergencyContact: {
        name: 'Nurse Station 4B',
        phone: '(404) 555-9000',
        relation: 'Attending Floor Staff',
      },
      insuranceType: 'Medicare Advantage',
      insuranceId: 'AET-MED-992144',
      pickupFacilityName: 'Grady Memorial Hospital (Trauma Center)',
      pickupAddress: '80 Jesse Hill Jr Dr SE, Atlanta, GA 30303',
      pickupRoomOrSuite: 'ER Discharge Bay 3',
      pickupTime: nowTime,
      pickupCoords: { lat: 33.7516, lng: -84.3827 },
      pickupInstructions: 'Immediate hospital bed-to-bed discharge. Stretcher with oxygen required.',
      dropoffFacilityName: 'Wesley Woods Center Rehab',
      dropoffAddress: '1821 Clifton Rd NE, Atlanta, GA 30329',
      dropoffRoomOrSuite: 'Sub-Acute Unit Bed 104',
      dropoffTime: 'Immediate',
      dropoffCoords: { lat: 33.7995, lng: -84.3298 },
      dropoffInstructions: 'Handoff to Charge Nurse Brenda. Transfer sheet included.',
      mobility: 'Stretcher / Gurney',
      equipment: ['Oxygen Concentrator 2L/min', 'Two-Man Stretcher'],
      tripType: 'Hospital Discharge',
      priority: 'Urgent Hospital Discharge',
      roundTrip: false,
      status: 'Scheduled',
      distanceMiles: 7.8,
      estMinutes: 26,
      hcpcsCode: 'A0428',
      mileageHcpcsCode: 'S0215',
      baseRate: 120.0,
      mileageRate: 4.5,
      totalBillingAmount: 155.1,
      billingStatus: 'Draft',
      notes: 'URGENT DISCHARGE: Bed needed for incoming ICU transfer. High priority response.',
      checkpoints: [
        {
          time: nowTime,
          event: 'EMERGENCY DISCHARGE REQUEST: Inbound from Grady Memorial Trauma',
          by: 'Hospital Discharge Coordinator',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setTrips(prev => [emergencyTrip, ...prev]);
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.TRIPS);
    localStorage.removeItem(STORAGE_KEYS.DRIVERS);
    localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    setTrips(INITIAL_TRIPS);
    setDrivers(INITIAL_DRIVERS);
    setVehicles(INITIAL_VEHICLES);
  };

  const activeDriver = drivers.find(d => d.id === activeDriverId);
  const activeTrip = trips.find(t => t.id === activeDriver?.activeTripId) || null;

  return (
    <NemtContext.Provider
      value={{
        trips,
        drivers,
        vehicles,
        activeDriverId,
        setActiveDriverId,
        isSimulating,
        setIsSimulating,
        addTrip,
        updateTripStatus,
        assignDriverToTrip,
        autoAssignTrip,
        signAndCompleteTrip,
        updateDriverStatus,
        generateEmergencyDischargeTrip,
        resetAllData,
        activeTrip,
        selectedTripForDetail,
        setSelectedTripForDetail,
      }}
    >
      {children}
    </NemtContext.Provider>
  );
};

export const useNemt = () => {
  const context = useContext(NemtContext);
  if (!context) {
    throw new Error('useNemt must be used within a NemtProvider');
  }
  return context;
};
