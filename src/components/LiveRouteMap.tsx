import React, { useState } from 'react';
import { useNemt } from '../context/NemtContext';
import { Trip, Driver } from '../types/nemt';
import { Navigation, MapPin, Truck, AlertCircle, Shield, CheckCircle2, Radio, Layers } from 'lucide-react';

// Bounding box for Atlanta Metro Area
const BOUNDS = {
  minLat: 33.66,
  maxLat: 33.88,
  minLng: -84.52,
  maxLng: -84.28,
};

// Convert Geo coordinates to SVG canvas space (1000 x 600)
function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  const normX = (lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng);
  const normY = (BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat);
  
  const x = Math.max(30, Math.min(970, normX * 1000));
  const y = Math.max(30, Math.min(570, normY * 600));
  return { x, y };
}

interface LiveRouteMapProps {
  onSelectTrip?: (trip: Trip) => void;
  selectedTripId?: string;
}

export const LiveRouteMap: React.FC<LiveRouteMapProps> = ({ onSelectTrip, selectedTripId }) => {
  const { drivers, trips, vehicles, isSimulating } = useNemt();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showAllRoutes, setShowAllRoutes] = useState<boolean>(true);

  // Active trips with coordinates
  const activeTrips = trips.filter(
    t => t.status !== 'Completed' && t.status !== 'Cancelled'
  );

  return (
    <div className="relative w-full h-[480px] lg:h-[540px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Telematics Map HUD */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulating ? 'bg-cyan-400' : 'bg-slate-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSimulating ? 'bg-cyan-500' : 'bg-slate-500'}`}></span>
            </span>
            <span className="font-semibold text-slate-200">CAD Live Fleet Telematics</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Metro Atlanta Medical Sector</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400 font-mono font-medium">{drivers.length} Units Active</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowAllRoutes(!showAllRoutes)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors shadow-sm ${
              showAllRoutes
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showAllRoutes ? 'All Corridors' : 'Focus Only'}</span>
          </button>

          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              En Route
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              Patient Loaded
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block"></span>
              Available
            </span>
          </div>
        </div>
      </div>

      {/* SVG Vector Map Rendering */}
      <div className="relative flex-1 w-full h-full">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full object-cover select-none"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Base Grid & Map Canvas */}
          <defs>
            <pattern id="telematics-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" strokeOpacity="0.4" />
            </pattern>
            <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="urgent-route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Background & Map Grid */}
          <rect width="1000" height="600" fill="#090d16" />
          <rect width="1000" height="600" fill="url(#telematics-grid)" />

          {/* Major Metro Highways & Road Arteries */}
          <g stroke="#1e293b" strokeWidth="16" opacity="0.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* I-285 Perimeter Loop */}
            <ellipse cx="500" cy="300" rx="380" ry="220" />
            {/* I-85 Diagonal */}
            <path d="M 220 560 L 480 320 L 820 80" />
            {/* I-75 NW to SE */}
            <path d="M 180 80 L 460 280 L 750 560" />
            {/* I-20 East-West */}
            <path d="M 60 360 L 940 370" />
            {/* GA-400 North Spine */}
            <path d="M 520 280 L 530 40" />
          </g>

          <g stroke="#334155" strokeWidth="3" opacity="0.7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Highlighted Arteries */}
            <ellipse cx="500" cy="300" rx="380" ry="220" strokeDasharray="8 6" />
            <path d="M 220 560 L 480 320 L 820 80" />
            <path d="M 180 80 L 460 280 L 750 560" />
            <path d="M 60 360 L 940 370" />
            <path d="M 520 280 L 530 40" />
            {/* Peachtree Medical Corridor */}
            <path d="M 460 400 L 490 280 L 515 150" stroke="#0ea5e9" strokeWidth="2.5" strokeOpacity="0.6" strokeDasharray="4 4" />
          </g>

          {/* Metro Zone Labels */}
          <g fill="#475569" fontSize="10" fontFamily="sans-serif" letterSpacing="1.5">
            <text x="535" y="140" fill="#0284c7" fontWeight="bold">BUCKHEAD MEDICAL CORRIDOR</text>
            <text x="440" y="315" fill="#38bdf8" fontWeight="600">MIDTOWN HEALTHCARE CENTER</text>
            <text x="430" y="380" fill="#64748b">DOWNTOWN / GRADY TRAUMA</text>
            <text x="730" y="270" fill="#64748b">DECATUR & VA SECTOR</text>
            <text x="170" y="470" fill="#475569">SW TRANSPORT ZONE</text>
          </g>

          {/* Active Trip Route Vectors */}
          {showAllRoutes &&
            activeTrips.map(trip => {
              const p = geoToSvg(trip.pickupCoords.lat, trip.pickupCoords.lng);
              const d = geoToSvg(trip.dropoffCoords.lat, trip.dropoffCoords.lng);
              const isSelected = selectedTripId === trip.id;
              const isUrgent = trip.priority.includes('Urgent') || trip.priority.includes('Time-Critical');

              // Draw bezier curve for natural routing
              const midX = (p.x + d.x) / 2 + (p.y - d.y) * 0.15;
              const midY = (p.y + d.y) / 2 + (d.x - p.x) * 0.15;

              return (
                <g key={`route-${trip.id}`} className="cursor-pointer" onClick={() => onSelectTrip?.(trip)}>
                  {/* Route back line */}
                  <path
                    d={`M ${p.x} ${p.y} Q ${midX} ${midY} ${d.x} ${d.y}`}
                    fill="none"
                    stroke={isSelected ? '#38bdf8' : isUrgent ? '#f59e0b' : '#334155'}
                    strokeWidth={isSelected ? 4 : 2.5}
                    strokeDasharray={isSelected ? 'none' : '5 4'}
                    opacity={isSelected ? 1 : 0.65}
                  />

                  {/* Animated route pulse if selected or loaded */}
                  {(isSelected || trip.status === 'Loaded & In Transit') && (
                    <path
                      d={`M ${p.x} ${p.y} Q ${midX} ${midY} ${d.x} ${d.y}`}
                      fill="none"
                      stroke={isUrgent ? 'url(#urgent-route-gradient)' : 'url(#route-gradient)'}
                      strokeWidth={isSelected ? 3.5 : 2}
                      strokeDasharray="10 15"
                      className="animate-pulse"
                    />
                  )}

                  {/* Pickup Dot */}
                  <circle cx={p.x} cy={p.y} r={isSelected ? 6 : 4.5} fill="#06b6d4" stroke="#0f172a" strokeWidth="2" />

                  {/* Dropoff Dot */}
                  <circle cx={d.x} cy={d.y} r={isSelected ? 6 : 4.5} fill="#10b981" stroke="#0f172a" strokeWidth="2" />
                </g>
              );
            })}

          {/* Driver Fleet Units with Live Coordinates */}
          {drivers.map(driver => {
            const pos = geoToSvg(driver.currentCoords.lat, driver.currentCoords.lng);
            const veh = vehicles.find(v => v.id === driver.assignedVehicleId);
            const isSelected = selectedDriver?.id === driver.id;

            let statusColor = '#06b6d4'; // Available - cyan
            if (driver.status === 'Transporting') statusColor = '#f59e0b'; // Amber
            else if (driver.status === 'En Route' || driver.status === 'At Pickup') statusColor = '#10b981'; // Emerald
            else if (driver.status === 'Off Duty') statusColor = '#64748b';

            return (
              <g
                key={`driver-marker-${driver.id}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform duration-700 ease-out"
                onClick={() => setSelectedDriver(driver)}
              >
                {/* Radar Halo pulse */}
                <circle
                  cx="0"
                  cy="0"
                  r="16"
                  fill={statusColor}
                  opacity="0.18"
                  className={isSimulating ? 'animate-ping' : ''}
                />

                {/* Marker Outer Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? 15 : 12}
                  fill="#0f172a"
                  stroke={statusColor}
                  strokeWidth={isSelected ? 3 : 2}
                  filter="url(#glow)"
                />

                {/* Arrow or Center Indicator */}
                <circle cx="0" cy="0" r="4" fill={statusColor} />

                {/* Vehicle Badge label */}
                <g transform="translate(14, -10)">
                  <rect
                    x="0"
                    y="0"
                    width="62"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke={statusColor}
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="31"
                    y="13"
                    textAnchor="middle"
                    fill="#f1f5f9"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {driver.assignedVehicleId}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Selected Driver Telematics Popup */}
        {selectedDriver && (
          <div className="absolute bottom-4 left-4 z-20 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl text-xs text-slate-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedDriver.avatar}
                  alt={selectedDriver.name}
                  className="w-10 h-10 rounded-full object-cover border border-cyan-500"
                />
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{selectedDriver.name}</h4>
                  <p className="text-slate-400 font-mono">{selectedDriver.assignedVehicleId} • {selectedDriver.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-slate-500 hover:text-slate-300 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-semibold text-cyan-400 uppercase">{selectedDriver.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GPS Coordinates:</span>
                <span className="text-slate-300">
                  {selectedDriver.currentCoords.lat.toFixed(4)}, {selectedDriver.currentCoords.lng.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shift Window:</span>
                <span className="text-slate-300">{selectedDriver.shiftStart} – {selectedDriver.shiftEnd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Certifications:</span>
                <span className="text-emerald-400">PASS • CPR • HIPAA</span>
              </div>
            </div>

            {selectedDriver.activeTripId && (
              <div className="mt-3 pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 text-[10px] block mb-1">ASSIGNED TRIP:</span>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px] flex justify-between items-center">
                  <span className="font-bold text-cyan-300">{selectedDriver.activeTripId}</span>
                  <button
                    onClick={() => {
                      const trip = trips.find(t => t.id === selectedDriver.activeTripId);
                      if (trip && onSelectTrip) onSelectTrip(trip);
                    }}
                    className="text-xs text-sky-400 hover:underline"
                  >
                    View Manifest →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Telematics Status Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>NEMT GPS Channel: <strong className="text-slate-200">915.2 MHz Encrypted</strong></span>
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">Active Sector: <strong className="text-slate-200">Fulton & DeKalb Counties</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span>Simulation: <strong className={isSimulating ? 'text-emerald-400' : 'text-slate-500'}>{isSimulating ? 'RUNNING' : 'PAUSED'}</strong></span>
          <span className="font-mono text-cyan-400">{activeTrips.length} Active Runs</span>
        </div>
      </div>
    </div>
  );
};
