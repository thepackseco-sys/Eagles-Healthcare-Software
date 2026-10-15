import React, { useState } from 'react';
import { useNemt } from '../context/NemtContext';
import { Trip } from '../types/nemt';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Truck, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const PatientTracker: React.FC = () => {
  const { trips, drivers, vehicles } = useNemt();
  const [selectedTripId, setSelectedTripId] = useState<string>('EAG-7101');

  const trip = trips.find(t => t.id === selectedTripId) || trips[0];
  const driver = drivers.find(d => d.id === trip?.assignedDriverId);
  const vehicle = vehicles.find(v => v.id === trip?.assignedVehicleId);

  // Status mapping
  const steps = [
    { label: 'Booking Confirmed', done: true },
    { label: 'Driver Dispatched', done: trip?.status !== 'Scheduled' },
    { label: 'En Route to You', done: ['En Route Pickup', 'Arrived Pickup', 'Loaded & In Transit', 'Arrived Dropoff', 'Completed'].includes(trip?.status || '') },
    { label: 'Passenger Onboard', done: ['Loaded & In Transit', 'Arrived Dropoff', 'Completed'].includes(trip?.status || '') },
    { label: 'Arrived at Clinic', done: ['Arrived Dropoff', 'Completed'].includes(trip?.status || '') },
    { label: 'Completed', done: trip?.status === 'Completed' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Search / Select Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
            Patient & Family Live Transfer Portal
          </h2>
          <p className="text-xs text-slate-400">
            Real-time GPS tracking for Eagles Healthcare patient appointments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Track Trip:</span>
          <select
            value={selectedTripId}
            onChange={e => setSelectedTripId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-mono font-medium"
          >
            {trips.map(t => (
              <option key={t.id} value={t.id}>
                {t.id} - {t.patientName} ({t.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {trip ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
          {/* Main Status Hero */}
          <div className="bg-gradient-to-r from-cyan-950/60 to-slate-950 p-5 rounded-xl border border-cyan-800/50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                {trip.id}
              </span>
              <h3 className="text-xl font-bold text-slate-100 mt-2">{trip.patientName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Purpose: <strong className="text-slate-200">{trip.tripType}</strong> • Scheduled Pick-up: <strong className="text-cyan-300">{trip.pickupTime}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase font-semibold">Live Transit Status:</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">
                {trip.status}
              </span>
              <div className="text-[11px] text-slate-400 mt-1">Est. Travel Time: ~{trip.estMinutes} mins</div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
              Transport Progress:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
              {steps.map((st, i) => (
                <div
                  key={st.label}
                  className={`p-2.5 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                    st.done
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="font-bold text-[11px] mb-1">
                    {st.done ? '✓ ' : `${i + 1}. `}
                  </div>
                  <div className="text-[10px] leading-tight font-medium">{st.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Driver & Vehicle Card */}
          {driver ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={driver.avatar}
                  alt={driver.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500"
                />
                <div>
                  <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    {driver.name}
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                      Certified NEMT Driver
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Vehicle: <strong className="text-slate-200">{vehicle?.makeModel}</strong> • Plate: <strong className="font-mono text-cyan-400">{vehicle?.plate}</strong>
                  </p>
                  <div className="text-[11px] text-slate-500 mt-0.5">⭐ {driver.rating} Passenger Rating</div>
                </div>
              </div>

              <a
                href={`tel:${driver.phone}`}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Driver ({driver.phone})</span>
              </a>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
              Your driver will be assigned shortly by the Eagles Healthcare dispatch center.
            </div>
          )}

          {/* Locations detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block">Pick-up Location</span>
              <div className="font-bold text-slate-200">{trip.pickupFacilityName || 'Patient Residence'}</div>
              <div className="text-slate-400">{trip.pickupAddress}</div>
              {trip.pickupRoomOrSuite && (
                <div className="text-slate-400 font-mono text-[11px]">Room/Apt: {trip.pickupRoomOrSuite}</div>
              )}
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Destination</span>
              <div className="font-bold text-slate-200">{trip.dropoffFacilityName || 'Medical Facility'}</div>
              <div className="text-slate-400">{trip.dropoffAddress}</div>
              {trip.dropoffRoomOrSuite && (
                <div className="text-slate-400 font-mono text-[11px]">Station: {trip.dropoffRoomOrSuite}</div>
              )}
            </div>
          </div>

          {/* Passenger Safety Guide */}
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-200 block">Passenger Comfort & ADA Checklist:</span>
              <p>
                Please have your photo ID and Medicaid/Medicare insurance card ready. Drivers provide door-through-door assist and will safely secure all wheelchair 4-point tie-downs and lap/shoulder restraints prior to departure.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
