import React, { useState } from 'react';
import { useNemt } from '../context/NemtContext';
import { Trip, TripStatus, MobilityLevel } from '../types/nemt';
import { LiveRouteMap } from './LiveRouteMap';
import { 
  Activity, 
  Clock, 
  MapPin, 
  User, 
  Truck, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  Search, 
  Filter, 
  Phone, 
  FileText, 
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const DispatchBoard: React.FC = () => {
  const { 
    trips, 
    drivers, 
    vehicles, 
    assignDriverToTrip, 
    autoAssignTrip, 
    updateTripStatus, 
    generateEmergencyDischargeTrip,
    setSelectedTripForDetail,
    selectedTripForDetail
  } = useNemt();

  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Active' | 'Urgent' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobilityFilter, setMobilityFilter] = useState<string>('All');
  const [assignModalTrip, setAssignModalTrip] = useState<Trip | null>(null);

  // Filtered trips
  const filteredTrips = trips.filter(trip => {
    // Tab filter
    if (activeTab === 'Pending' && trip.status !== 'Scheduled') return false;
    if (activeTab === 'Active' && !['Assigned', 'En Route Pickup', 'Arrived Pickup', 'Loaded & In Transit', 'Arrived Dropoff'].includes(trip.status)) return false;
    if (activeTab === 'Urgent' && !trip.priority.includes('Urgent') && !trip.priority.includes('Critical')) return false;
    if (activeTab === 'Completed' && trip.status !== 'Completed') return false;

    // Mobility filter
    if (mobilityFilter !== 'All' && trip.mobility !== mobilityFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = trip.patientName.toLowerCase().includes(q);
      const matchId = trip.id.toLowerCase().includes(q);
      const matchPickup = trip.pickupAddress.toLowerCase().includes(q) || (trip.pickupFacilityName?.toLowerCase().includes(q) ?? false);
      const matchDrop = trip.dropoffAddress.toLowerCase().includes(q) || (trip.dropoffFacilityName?.toLowerCase().includes(q) ?? false);
      return matchName || matchId || matchPickup || matchDrop;
    }

    return true;
  });

  // Calculate quick metrics
  const totalTrips = trips.length;
  const inProgressTrips = trips.filter(t => ['En Route Pickup', 'Loaded & In Transit'].includes(t.status)).length;
  const unassignedTrips = trips.filter(t => t.status === 'Scheduled').length;
  const wheelchairTrips = trips.filter(t => t.mobility.includes('Wheelchair')).length;
  const stretcherTrips = trips.filter(t => t.mobility.includes('Stretcher')).length;

  const handleNextStatus = (trip: Trip) => {
    const sequence: TripStatus[] = [
      'Scheduled',
      'Assigned',
      'En Route Pickup',
      'Arrived Pickup',
      'Loaded & In Transit',
      'Arrived Dropoff',
      'Completed'
    ];
    const currentIndex = sequence.indexOf(trip.status);
    if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
      updateTripStatus(trip.id, sequence[currentIndex + 1]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top CAD Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-slate-100">{totalTrips}</div>
            <div className="text-xs text-slate-400 font-medium">Daily Transports</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-amber-300">{inProgressTrips}</div>
            <div className="text-xs text-slate-400 font-medium">En Route / Transit</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-rose-300">{unassignedTrips}</div>
            <div className="text-xs text-slate-400 font-medium">Awaiting Dispatch</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <span className="font-bold text-base">♿</span>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-cyan-300">{wheelchairTrips}</div>
            <div className="text-xs text-slate-400 font-medium">Wheelchair Runs</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3 shadow-md col-span-2 md:col-span-1">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-emerald-300">{stretcherTrips}</div>
            <div className="text-xs text-slate-400 font-medium">Stretcher Transits</div>
          </div>
        </div>
      </div>

      {/* Live Route Telematics GPS Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
            Eagles CAD Telematics & Fleet Map
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={generateEmergencyDischargeTrip}
              className="text-xs bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulate Urgent Discharge</span>
            </button>
          </div>
        </div>
        <LiveRouteMap
          selectedTripId={selectedTripForDetail?.id}
          onSelectTrip={trip => setSelectedTripForDetail(trip)}
        />
      </div>

      {/* Dispatch Controls & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/80 overflow-x-auto">
            {(['All', 'Pending', 'Active', 'Urgent', 'Completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab}
                {tab === 'Pending' && unassignedTrips > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full">
                    {unassignedTrips}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search & Mobility Filter */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, ID, clinic..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={mobilityFilter}
              onChange={e => setMobilityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Mobility</option>
              <option value="Standard Wheelchair">♿ Wheelchair</option>
              <option value="Bariatric Wheelchair">♿ Bariatric WC</option>
              <option value="Stretcher / Gurney">🛏️ Stretcher</option>
              <option value="Ambulatory">🚶 Ambulatory</option>
            </select>
          </div>
        </div>

        {/* Trips Dispatch Feed / Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTrips.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
              <p className="text-sm">No medical transports match the current filters.</p>
            </div>
          ) : (
            filteredTrips.map(trip => {
              const driver = drivers.find(d => d.id === trip.assignedDriverId);
              const vehicle = vehicles.find(v => v.id === trip.assignedVehicleId);
              const isUrgent = trip.priority.includes('Urgent') || trip.priority.includes('Time-Critical');

              return (
                <div
                  key={trip.id}
                  className={`bg-slate-950 border rounded-xl p-4 transition-all hover:border-slate-700 shadow-md flex flex-col justify-between ${
                    isUrgent
                      ? 'border-amber-500/40 bg-gradient-to-r from-slate-950 via-slate-950 to-amber-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400">
                          {trip.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            trip.status === 'Completed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : trip.status === 'Scheduled'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          }`}
                        >
                          {trip.status}
                        </span>
                        {isUrgent && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50">
                            {trip.priority}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-slate-200">{trip.pickupTime} Scheduled</div>
                        <div className="text-[11px] text-slate-400">{trip.distanceMiles} mi • ~{trip.estMinutes} mins</div>
                      </div>
                    </div>

                    {/* Patient & Mobility Details */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                          {trip.patientName}
                          <span className="text-xs font-normal text-slate-400">(DOB: {trip.patientDob})</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          {trip.insuranceType} • <span className="font-mono text-slate-300">{trip.insuranceId}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300">
                          {trip.mobility.includes('Wheelchair') && '♿ '}
                          {trip.mobility.includes('Stretcher') && '🛏️ '}
                          {trip.mobility}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Code: {trip.hcpcsCode} + {trip.mileageHcpcsCode}</div>
                      </div>
                    </div>

                    {/* Pickup & Dropoff Routing Flow */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                          P
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-200">
                            {trip.pickupFacilityName || 'Patient Residence'}
                            {trip.pickupRoomOrSuite && <span className="text-slate-400 font-normal"> — {trip.pickupRoomOrSuite}</span>}
                          </div>
                          <div className="text-slate-400 text-[11px] truncate">{trip.pickupAddress}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                          D
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-200">
                            {trip.dropoffFacilityName || 'Destination'}
                            {trip.dropoffRoomOrSuite && <span className="text-slate-400 font-normal"> — {trip.dropoffRoomOrSuite}</span>}
                          </div>
                          <div className="text-slate-400 text-[11px] truncate">{trip.dropoffAddress}</div>
                        </div>
                      </div>
                    </div>

                    {/* Special Instructions or Equipment */}
                    {trip.equipment.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {trip.equipment.map((eq, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                          >
                            + {eq}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Driver Assignment & Action Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    {driver ? (
                      <div className="flex items-center gap-2 text-xs">
                        <img
                          src={driver.avatar}
                          alt={driver.name}
                          className="w-6 h-6 rounded-full object-cover border border-cyan-500"
                        />
                        <div>
                          <span className="font-semibold text-slate-200">{driver.name}</span>
                          <span className="text-slate-400 ml-1 font-mono">({trip.assignedVehicleId})</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Awaiting Unit Assignment</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      {!driver ? (
                        <>
                          <button
                            onClick={() => autoAssignTrip(trip.id)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Auto-Dispatch</span>
                          </button>
                          <button
                            onClick={() => setAssignModalTrip(trip)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
                          >
                            Select Unit
                          </button>
                        </>
                      ) : (
                        <>
                          {trip.status !== 'Completed' && (
                            <button
                              onClick={() => handleNextStatus(trip)}
                              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
                              title="Simulate driver progressing along the transport sequence"
                            >
                              <span>Advance State</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedTripForDetail(trip)}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs px-2 py-1.5 rounded-lg border border-slate-800 transition-colors flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>eTrip Details</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Manual Driver Assignment Modal */}
      {assignModalTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-base">Assign Vehicle & Driver</h3>
                <p className="text-xs text-slate-400">
                  {assignModalTrip.id} • {assignModalTrip.patientName} ({assignModalTrip.mobility})
                </p>
              </div>
              <button
                onClick={() => setAssignModalTrip(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {drivers.map(drv => {
                const veh = vehicles.find(v => v.id === drv.assignedVehicleId);
                const isCompatible = assignModalTrip.mobility.includes('Stretcher')
                  ? (veh?.capacity.stretcher ?? 0) > 0
                  : assignModalTrip.mobility.includes('Wheelchair')
                  ? (veh?.capacity.wheelchair ?? 0) > 0
                  : true;

                return (
                  <div
                    key={drv.id}
                    onClick={() => {
                      assignDriverToTrip(assignModalTrip.id, drv.id);
                      setAssignModalTrip(null);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isCompatible
                        ? 'border-slate-800 bg-slate-950 hover:border-cyan-500 hover:bg-slate-900'
                        : 'border-slate-800/40 bg-slate-950/40 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={drv.avatar}
                        alt={drv.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                          {drv.name}
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-cyan-400 rounded">
                            {drv.assignedVehicleId}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {veh?.makeModel} • Status: <span className="text-emerald-400">{drv.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          isCompatible ? 'bg-cyan-950 text-cyan-300' : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {isCompatible ? 'ADA Compatible' : 'Incompatible Lift'}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">⭐ {drv.rating} Rating</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setAssignModalTrip(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Full Electronic Ticket (eTrip) Detail Modal */}
      {selectedTripForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-cyan-950 text-cyan-400 rounded border border-cyan-800">
                    {selectedTripForDetail.id}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-slate-200 rounded">
                    {selectedTripForDetail.tripType}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-1">
                  {selectedTripForDetail.patientName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTripForDetail(null)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Patient DOB:</span>
                <span className="font-semibold text-slate-200">{selectedTripForDetail.patientDob}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Insurance ID:</span>
                <span className="font-mono text-cyan-400">{selectedTripForDetail.insuranceId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Mobility Tier:</span>
                <span className="font-semibold text-slate-200">{selectedTripForDetail.mobility}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Emergency Contact:</span>
                <span className="text-slate-300">
                  {selectedTripForDetail.emergencyContact.name} ({selectedTripForDetail.emergencyContact.phone})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">CMS HCPCS Code:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedTripForDetail.hcpcsCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Estimated Reimbursement:</span>
                <span className="font-mono font-bold text-slate-100">
                  ${selectedTripForDetail.totalBillingAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkpoints Audit Trail */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                GPS Timestamped Audit Trail (HIPAA & CMS Compliance)
              </h4>
              <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                {selectedTripForDetail.checkpoints.map((cp, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs border-b border-slate-850 last:border-0 pb-1.5">
                    <span className="font-mono text-cyan-400 font-bold shrink-0">{cp.time}</span>
                    <div className="flex-1">
                      <span className="text-slate-200 font-medium">{cp.event}</span>
                      <div className="text-[10px] text-slate-500">Logged by: {cp.by}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature if completed */}
            {selectedTripForDetail.patientSignature && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs">
                <span className="text-slate-400 block mb-1">
                  Electronic Proof of Delivery / Patient Signature:
                </span>
                <div className="bg-white p-2 rounded max-w-xs h-16 flex items-center justify-center">
                  <img
                    src={selectedTripForDetail.patientSignature}
                    alt="Signature"
                    className="max-h-full"
                  />
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  Signee: <strong>{selectedTripForDetail.signeeName}</strong> ({selectedTripForDetail.signeeRelationship})
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedTripForDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
