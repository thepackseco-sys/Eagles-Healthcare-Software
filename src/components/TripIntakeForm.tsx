import React, { useState } from 'react';
import { useNemt } from '../context/NemtContext';
import { MobilityLevel, InsuranceType, TripType } from '../types/nemt';
import { FREQUENT_FACILITIES } from '../data/mockData';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ShieldCheck, 
  Building2, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';

interface TripIntakeFormProps {
  onSuccess?: () => void;
}

export const TripIntakeForm: React.FC<TripIntakeFormProps> = ({ onSuccess }) => {
  const { addTrip } = useNemt();
  const [submitted, setSubmitted] = useState<string | null>(null);

  // Form States
  const [patientName, setPatientName] = useState('');
  const [patientDob, setPatientDob] = useState('1955-06-15');
  const [patientPhone, setPatientPhone] = useState('(404) 555-0199');
  const [emergencyName, setEmergencyName] = useState('Family Contact');
  const [emergencyPhone, setEmergencyPhone] = useState('(404) 555-0100');
  
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('Medicaid');
  const [insuranceId, setInsuranceId] = useState('GA-MCD-');
  
  const [pickupFacilityName, setPickupFacilityName] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupRoom, setPickupRoom] = useState('');
  const [pickupTime, setPickupTime] = useState('10:30');
  const [pickupInstructions, setPickupInstructions] = useState('');

  const [dropoffFacilityName, setDropoffFacilityName] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffRoom, setDropoffRoom] = useState('');
  const [dropoffTime, setDropoffTime] = useState('11:15');
  const [dropoffInstructions, setDropoffInstructions] = useState('');

  const [mobility, setMobility] = useState<MobilityLevel>('Standard Wheelchair');
  const [tripType, setTripType] = useState<TripType>('Routine Dialysis');
  const [priority, setPriority] = useState<'Routine' | 'Priority' | 'Time-Critical' | 'Urgent Hospital Discharge'>('Routine');
  const [roundTrip, setRoundTrip] = useState<boolean>(true);
  const [returnPickupTime, setReturnPickupTime] = useState('14:30');
  const [equipment, setEquipment] = useState<string[]>(['Hydraulic Lift', 'Q-Straint Harness']);
  const [notes, setNotes] = useState('');

  // Equipment toggler
  const toggleEquipment = (item: string) => {
    setEquipment(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  // Quick fill facility
  const applyFacility = (target: 'pickup' | 'dropoff', fac: typeof FREQUENT_FACILITIES[0]) => {
    if (target === 'pickup') {
      setPickupFacilityName(fac.name);
      setPickupAddress(fac.address);
    } else {
      setDropoffFacilityName(fac.name);
      setDropoffAddress(fac.address);
    }
  };

  // Estimated distance and calculations
  const distanceMiles = mobility.includes('Stretcher') ? 8.4 : 5.8;
  const estMinutes = Math.round(distanceMiles * 3.2);

  // Medicaid / Medicare HCPCS codes
  let hcpcsCode = 'T2003';
  let baseRate = 45.0;
  let mileageRate = 3.25;

  if (mobility.includes('Stretcher')) {
    hcpcsCode = 'A0428';
    baseRate = 110.0;
    mileageRate = 4.5;
  } else if (mobility.includes('Bariatric')) {
    hcpcsCode = 'T2003-U1';
    baseRate = 65.0;
    mileageRate = 3.75;
  } else if (mobility === 'Ambulatory') {
    hcpcsCode = 'T2003';
    baseRate = 35.0;
    mileageRate = 2.85;
  }

  const totalBillingAmount = +(baseRate + distanceMiles * mileageRate).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !pickupAddress.trim() || !dropoffAddress.trim()) {
      return;
    }

    const created = addTrip({
      patientName,
      patientDob,
      patientPhone,
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relation: 'Primary Contact',
      },
      insuranceType,
      insuranceId: insuranceId || `ID-${Math.floor(100000 + Math.random() * 900000)}`,
      pickupFacilityName: pickupFacilityName || undefined,
      pickupAddress,
      pickupRoomOrSuite: pickupRoom || undefined,
      pickupTime,
      pickupCoords: { lat: 33.7842 + (Math.random() - 0.5) * 0.05, lng: -84.3825 + (Math.random() - 0.5) * 0.05 },
      pickupInstructions,
      dropoffFacilityName: dropoffFacilityName || undefined,
      dropoffAddress,
      dropoffRoomOrSuite: dropoffRoom || undefined,
      dropoffTime,
      dropoffCoords: { lat: 33.8115 + (Math.random() - 0.5) * 0.05, lng: -84.3540 + (Math.random() - 0.5) * 0.05 },
      dropoffInstructions,
      mobility,
      equipment,
      tripType,
      priority,
      roundTrip,
      returnPickupTime: roundTrip ? returnPickupTime : undefined,
      distanceMiles,
      estMinutes,
      hcpcsCode,
      mileageHcpcsCode: 'S0215',
      baseRate,
      mileageRate,
      totalBillingAmount,
      billingStatus: 'Draft',
      notes,
    });

    setSubmitted(created.id);
    if (onSuccess) {
      setTimeout(onSuccess, 1800);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            NEMT Patient Transport Intake & Dispatch Booking
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standard Non-Emergency Medical Transport Intake • Meets CMS-1500 & Medicaid Compliance
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-[10px] font-mono uppercase bg-slate-800 text-cyan-400 px-2.5 py-1 rounded border border-slate-700">
            Eagles Healthcare Dispatch CAD
          </span>
        </div>
      </div>

      {submitted ? (
        <div className="bg-emerald-950/80 border border-emerald-700 rounded-xl p-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
          <h3 className="text-xl font-bold text-emerald-200">
            Transport Request {submitted} Successfully Scheduled!
          </h3>
          <p className="text-sm text-emerald-300 max-w-md mx-auto">
            The trip has been placed on the live CAD dispatch board. Our automated matching algorithm is locating the nearest certified unit.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setSubmitted(null)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold"
            >
              Book Another Patient
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1: Patient Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <User className="w-4 h-4" />
              1. Patient Demographics & Insurance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Margaret Jenkins"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={patientDob}
                  onChange={e => setPatientDob(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Patient Phone</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={e => setPatientPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Insurance Payer</label>
                <select
                  value={insuranceType}
                  onChange={e => setInsuranceType(e.target.value as InsuranceType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Medicaid">Medicaid (State Fee-For-Service)</option>
                  <option value="Medicare Advantage">Medicare Advantage Plan</option>
                  <option value="Veterans Affairs (VA)">Veterans Affairs (VA)</option>
                  <option value="Private Health Insurance">Private Health Insurance</option>
                  <option value="Self-Pay / Facility Contract">Facility Direct Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Insurance Member ID / Auth #</label>
                <input
                  type="text"
                  placeholder="e.g. GA-MCD-109284"
                  value={insuranceId}
                  onChange={e => setInsuranceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Emergency Contact Name & Phone</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={emergencyName}
                    onChange={e => setEmergencyName(e.target.value)}
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={emergencyPhone}
                    onChange={e => setEmergencyPhone(e.target.value)}
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Medical Mobility & Equipment */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              2. Mobility Level & ADA Equipment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Mobility Level *</label>
                <div className="space-y-1.5">
                  {(
                    [
                      'Standard Wheelchair',
                      'Bariatric Wheelchair',
                      'Motorized Wheelchair',
                      'Stretcher / Gurney',
                      'Two-Person Assist Stretcher',
                      'Ambulatory'
                    ] as MobilityLevel[]
                  ).map(mob => (
                    <label
                      key={mob}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                        mobility === mob
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="mobility"
                          value={mob}
                          checked={mobility === mob}
                          onChange={() => setMobility(mob)}
                          className="text-cyan-600 focus:ring-0"
                        />
                        <span className="font-semibold">{mob}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {mob.includes('Stretcher') ? 'Requires Sprinter / 2 Crew' : mob.includes('Wheelchair') ? 'Lift Required' : 'Sedan Compatible'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Required Medical Equipment / Assistance</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Hydraulic Lift',
                    'Q-Straint Harness',
                    'Oxygen Concentrator 2L/min',
                    'Two-Man Stretcher',
                    'Bariatric Ramp',
                    'Escort/Companion',
                    'Door-Through-Door Assist',
                    'IV Pole Support',
                  ].map(item => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleEquipment(item)}
                      className={`p-2 rounded-lg border text-left text-[11px] font-medium transition-colors ${
                        equipment.includes(item)
                          ? 'bg-sky-950/70 border-sky-500 text-sky-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {equipment.includes(item) ? '✓ ' : '+ '}
                      {item}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="block text-slate-400 mb-1 font-medium">Trip Category & Priority</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={tripType}
                      onChange={e => setTripType(e.target.value as TripType)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Routine Dialysis">Routine Dialysis</option>
                      <option value="Chemotherapy / Oncology">Chemo / Oncology</option>
                      <option value="Hospital Discharge">Hospital Discharge</option>
                      <option value="Physical Therapy">Physical Therapy</option>
                      <option value="Surgical Outpatient">Surgical Outpatient</option>
                      <option value="Specialist Consultation">Specialist Visit</option>
                    </select>

                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Routine">Routine Scheduled</option>
                      <option value="Priority">Priority Appointment</option>
                      <option value="Time-Critical">Time-Critical (Strict ETA)</option>
                      <option value="Urgent Hospital Discharge">Urgent Discharge</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Origin & Destination Routing */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              3. Origin Pickup & Destination Facilities
            </h3>

            {/* Quick Facility Pickers */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block mb-1.5 font-semibold uppercase tracking-wider">
                Quick Select Healthcare Partner Facilities:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {FREQUENT_FACILITIES.map(fac => (
                  <div key={fac.name} className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded text-[11px] p-0.5">
                    <span className="px-1 text-slate-300 font-medium truncate max-w-[140px]">{fac.name}</span>
                    <button
                      type="button"
                      onClick={() => applyFacility('pickup', fac)}
                      className="px-1.5 py-0.5 bg-cyan-950 hover:bg-cyan-800 text-cyan-300 rounded text-[10px]"
                      title="Set as Pickup"
                    >
                      Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFacility('dropoff', fac)}
                      className="px-1.5 py-0.5 bg-emerald-950 hover:bg-emerald-800 text-emerald-300 rounded text-[10px]"
                      title="Set as Dropoff"
                    >
                      Drop
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup Side */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                    Pick-up Location
                  </span>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={e => setPickupTime(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Facility Name / Building</label>
                  <input
                    type="text"
                    placeholder="e.g. Sunrise Senior Living or Home"
                    value={pickupFacilityName}
                    onChange={e => setPickupFacilityName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2410 Peachtree Rd NW, Atlanta, GA"
                    value={pickupAddress}
                    onChange={e => setPickupAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Room / Apt / Suite #</label>
                    <input
                      type="text"
                      placeholder="e.g. Room 314B"
                      value={pickupRoom}
                      onChange={e => setPickupRoom(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Special Pickup Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Back ramp entrance"
                      value={pickupInstructions}
                      onChange={e => setPickupInstructions(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Dropoff Side */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                    Drop-off Destination
                  </span>
                  <input
                    type="time"
                    value={dropoffTime}
                    onChange={e => setDropoffTime(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Hospital / Clinic / Clinic Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Fresenius Kidney Care Buckhead"
                    value={dropoffFacilityName}
                    onChange={e => setDropoffFacilityName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3120 Maple Dr NE, Atlanta, GA"
                    value={dropoffAddress}
                    onChange={e => setDropoffAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Clinic Station / Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Station 8 / Renal Care"
                      value={dropoffRoom}
                      onChange={e => setDropoffRoom(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Handoff Instructions</label>
                    <input
                      type="text"
                      placeholder="e.g. Direct RN bedside handoff"
                      value={dropoffInstructions}
                      onChange={e => setDropoffInstructions(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Round-trip options */}
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roundTrip}
                  onChange={e => setRoundTrip(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-0"
                />
                <span className="font-semibold text-slate-200">
                  Book as Round-Trip (Return Transport)
                </span>
              </label>

              {roundTrip && (
                <div className="flex items-center gap-2 text-slate-300">
                  <span>Return Pickup Window:</span>
                  <input
                    type="time"
                    value={returnPickupTime}
                    onChange={e => setReturnPickupTime(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 font-mono text-cyan-400 font-bold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Automated Medicaid / CMS-1500 Billing Projection */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-slate-400 text-[11px] uppercase font-semibold">
                Medicaid / NEMT Rate Engine (Est. {distanceMiles} miles • ~{estMinutes} min):
              </div>
              <div className="flex items-center gap-3 mt-1 font-mono">
                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-400 rounded border border-cyan-800">
                  Base: {hcpcsCode} (${baseRate.toFixed(2)})
                </span>
                <span className="px-2 py-0.5 bg-sky-950 text-sky-400 rounded border border-sky-800">
                  Mileage: S0215 (${mileageRate}/mi)
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-slate-400 text-[11px]">Total Estimated Claim:</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                ${totalBillingAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-900/40 transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span>Confirm & Dispatch Patient Transfer</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
