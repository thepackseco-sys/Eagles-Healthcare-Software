import React, { useState, useRef, useEffect } from 'react';
import { useNemt } from '../context/NemtContext';
import { Trip, TripStatus } from '../types/nemt';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  Shield, 
  CheckSquare, 
  PenTool, 
  AlertCircle, 
  CheckCircle, 
  Navigation, 
  ArrowRight,
  Activity,
  UserCheck,
  FileSignature
} from 'lucide-react';

export const DriverPortal: React.FC = () => {
  const { 
    drivers, 
    vehicles, 
    trips, 
    activeDriverId, 
    setActiveDriverId, 
    updateTripStatus, 
    signAndCompleteTrip,
    updateDriverStatus
  } = useNemt();

  const activeDriver = drivers.find(d => d.id === activeDriverId) || drivers[0];
  const assignedVehicle = vehicles.find(v => v.id === activeDriver?.assignedVehicleId);

  // Current active trip for this driver
  const currentTrip = trips.find(
    t => t.assignedDriverId === activeDriver?.id && t.status !== 'Completed' && t.status !== 'Cancelled'
  );

  // Pre-trip checklist state
  const [checklist, setChecklist] = useState({
    liftHydraulics: true,
    tieDowns: true,
    seatbelts: true,
    firstAid: true,
    sanitized: true,
  });

  // Signature state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signeeName, setSigneeName] = useState('');
  const [signeeRelation, setSigneeRelation] = useState('Patient (Self)');
  const [driverNote, setDriverNote] = useState('');
  const [panicSent, setPanicSent] = useState(false);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleCompleteSignOff = () => {
    if (!currentTrip || !canvasRef.current) return;
    const signatureDataUrl = canvasRef.current.toDataURL('image/png');
    signAndCompleteTrip(
      currentTrip.id,
      signatureDataUrl,
      signeeName || currentTrip.patientName,
      signeeRelation,
      driverNote
    );
    clearSignature();
  };

  // Progression steps
  const steps: { status: TripStatus; label: string; action: string; desc: string }[] = [
    { status: 'Assigned', label: 'Trip Assigned', action: 'Acknowledge Run', desc: 'Driver confirmed transport details.' },
    { status: 'En Route Pickup', label: 'En Route to Pickup', action: 'Start Pickup Navigation', desc: 'Heading to origin facility/residence.' },
    { status: 'Arrived Pickup', label: 'Arrived at Pickup', action: 'Mark Arrived at Origin', desc: 'Arrived at pickup location / facility.' },
    { status: 'Loaded & In Transit', label: 'Patient Secured & In Transit', action: 'Patient Secured (Q-Straint / Belt)', desc: 'Hydraulic lift used, passenger secured safely.' },
    { status: 'Arrived Dropoff', label: 'Arrived at Destination', action: 'Mark Arrived at Destination', desc: 'At clinic/hospital transfer bay.' },
    { status: 'Completed', label: 'Handoff & Signature', action: 'Capture Electronic Signature', desc: 'Trip finalized with proof of delivery.' },
  ];

  const currentStepIndex = currentTrip
    ? steps.findIndex(s => s.status === currentTrip.status)
    : -1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Driver Switcher Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <img
            src={activeDriver.avatar}
            alt={activeDriver.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">{activeDriver.name}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {activeDriver.assignedVehicleId}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Shift: {activeDriver.shiftStart} – {activeDriver.shiftEnd} • Rating: ⭐ {activeDriver.rating} • {activeDriver.completedTripsCount} Trips
            </p>
          </div>
        </div>

        {/* Driver Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Switch MDT Unit:</span>
          <select
            value={activeDriverId}
            onChange={e => setActiveDriverId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-medium"
          >
            {drivers.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.assignedVehicleId})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setPanicSent(true);
              setTimeout(() => setPanicSent(false), 4000);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              panicSent
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{panicSent ? 'CAD Alert Sent (10-33)!' : 'MDT Panic Alert'}</span>
          </button>
        </div>
      </div>

      {/* Main Terminal View */}
      {currentTrip ? (
        <div className="space-y-6">
          {/* Active Trip Execution Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {currentTrip.id}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                    {currentTrip.tripType}
                  </span>
                  <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">
                    Current Status: {currentTrip.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-1">
                  {currentTrip.patientName}
                </h3>
              </div>

              <div className="text-right">
                <a
                  href={`tel:${currentTrip.patientPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Patient ({currentTrip.patientPhone})</span>
                </a>
              </div>
            </div>

            {/* Stepper Pipeline */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-3">
                eTrip Workflow Progression Pipeline:
              </span>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
                {steps.map((st, i) => {
                  const isDone = currentStepIndex > i || currentTrip.status === 'Completed';
                  const isCurrent = currentStepIndex === i;

                  return (
                    <div
                      key={st.status}
                      className={`p-2 rounded-lg border flex flex-col justify-between ${
                        isDone
                          ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
                          : isCurrent
                          ? 'border-cyan-500 bg-cyan-950/60 text-cyan-200 shadow-md shadow-cyan-950/50'
                          : 'border-slate-800/60 bg-slate-900/40 text-slate-500'
                      }`}
                    >
                      <div className="font-bold text-[11px] mb-1">
                        {isDone ? '✓ ' : `${i + 1}. `}
                        {st.label}
                      </div>
                      <div className="text-[10px] opacity-80">{st.status}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Patient & Route Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Pickup info */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Pick-up Location
                  </span>
                  <span className="font-mono text-slate-300">{currentTrip.pickupTime}</span>
                </div>
                <div className="font-bold text-slate-200 text-sm">
                  {currentTrip.pickupFacilityName || 'Patient Residence'}
                </div>
                <div className="text-slate-300">{currentTrip.pickupAddress}</div>
                {currentTrip.pickupRoomOrSuite && (
                  <div className="text-slate-400 font-mono">Room: {currentTrip.pickupRoomOrSuite}</div>
                )}
                {currentTrip.pickupInstructions && (
                  <div className="text-amber-400/90 text-[11px] bg-amber-950/30 p-2 rounded border border-amber-900/50">
                    Note: {currentTrip.pickupInstructions}
                  </div>
                )}
              </div>

              {/* Dropoff info */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Drop-off Destination
                  </span>
                  <span className="font-mono text-slate-300">{currentTrip.dropoffTime}</span>
                </div>
                <div className="font-bold text-slate-200 text-sm">
                  {currentTrip.dropoffFacilityName || 'Medical Center'}
                </div>
                <div className="text-slate-300">{currentTrip.dropoffAddress}</div>
                {currentTrip.dropoffRoomOrSuite && (
                  <div className="text-slate-400 font-mono">Station: {currentTrip.dropoffRoomOrSuite}</div>
                )}
                {currentTrip.dropoffInstructions && (
                  <div className="text-emerald-400/90 text-[11px] bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                    Handoff: {currentTrip.dropoffInstructions}
                  </div>
                )}
              </div>
            </div>

            {/* ADA & Special Requirements Card */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-300">Mobility:</span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-semibold">
                  {currentTrip.mobility}
                </span>
                <span className="text-slate-400">
                  Equipment: {currentTrip.equipment.join(' • ') || 'Standard Ambulatory'}
                </span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Odometer: {currentTrip.actualStartOdometer || assignedVehicle?.currentMileage} mi
              </div>
            </div>

            {/* Stage Action Button */}
            {currentTrip.status !== 'Arrived Dropoff' ? (
              <div className="pt-2 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  Next Step: <strong className="text-slate-200">{steps[currentStepIndex + 1]?.action}</strong>
                </span>

                <button
                  onClick={() => {
                    const next = steps[currentStepIndex + 1]?.status;
                    if (next) updateTripStatus(currentTrip.id, next);
                  }}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/40 transition-all hover:scale-[1.01]"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{steps[currentStepIndex + 1]?.action || 'Advance Trip Stage'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Signature Pad Section at Dropoff */
              <div className="bg-slate-950 border border-cyan-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-cyan-400" />
                    Electronic Proof of Delivery & Patient / Nurse Sign-off
                  </h4>
                  <span className="text-xs text-amber-400 font-semibold">Required for CMS-1500 Billing</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Signee Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Margaret Jenkins or Nurse Sarah"
                      value={signeeName}
                      onChange={e => setSigneeName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Relationship to Patient</label>
                    <select
                      value={signeeRelation}
                      onChange={e => setSigneeRelation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    >
                      <option value="Patient (Self)">Patient (Self)</option>
                      <option value="Receiving Nurse / Clinician">Receiving Nurse / Clinician</option>
                      <option value="Facility Attendant / Charge RN">Facility Attendant / Charge RN</option>
                      <option value="Authorized Caregiver / Family">Authorized Caregiver / Family</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-slate-400">Sign with Finger or Mouse below:</span>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Clear Pad
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-28 bg-white rounded-lg border-2 border-dashed border-slate-400 cursor-crosshair touch-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleCompleteSignOff}
                    disabled={!hasSignature}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                      hasSignature
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Trip & Submit eTrip Proof</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4">
          <Truck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">
            No Active Run Assigned to {activeDriver.name}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You are currently on standby. The dispatch team will assign upcoming dialysis, chemotherapy, or discharge runs via the CAD console.
          </p>
          <div className="pt-2">
            <span className="text-xs px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-semibold">
              Status: Available for Dispatch
            </span>
          </div>
        </div>
      )}

      {/* Pre-Trip Vehicle & Safety Inspection Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Daily Pre-Trip & ADA Hydraulic Lift Checklist ({activeDriver.assignedVehicleId})
          </h4>
          <span className="text-[11px] text-emerald-400 font-mono">DOT & ADA Verified</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <label className="flex items-center gap-2 p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
            <input
              type="checkbox"
              checked={checklist.liftHydraulics}
              onChange={e => setChecklist({ ...checklist, liftHydraulics: e.target.checked })}
              className="rounded text-cyan-600 focus:ring-0"
            />
            <span>Hydraulic Lift Cycle Tested</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
            <input
              type="checkbox"
              checked={checklist.tieDowns}
              onChange={e => setChecklist({ ...checklist, tieDowns: e.target.checked })}
              className="rounded text-cyan-600 focus:ring-0"
            />
            <span>Q'Straint 4-Point Tie-Downs Inspected</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
            <input
              type="checkbox"
              checked={checklist.seatbelts}
              onChange={e => setChecklist({ ...checklist, seatbelts: e.target.checked })}
              className="rounded text-cyan-600 focus:ring-0"
            />
            <span>Passenger Lap & Shoulder Restraints</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
            <input
              type="checkbox"
              checked={checklist.firstAid}
              onChange={e => setChecklist({ ...checklist, firstAid: e.target.checked })}
              className="rounded text-cyan-600 focus:ring-0"
            />
            <span>First Aid & AED Battery Verified</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
            <input
              type="checkbox"
              checked={checklist.sanitized}
              onChange={e => setChecklist({ ...checklist, sanitized: e.target.checked })}
              className="rounded text-cyan-600 focus:ring-0"
            />
            <span>Cabin Medical Sanitization Complete</span>
          </label>
        </div>
      </div>
    </div>
  );
};
