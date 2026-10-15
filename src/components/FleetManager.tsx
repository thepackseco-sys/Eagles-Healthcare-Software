import React, { useState } from 'react';
import { useNemt } from '../context/NemtContext';
import { Vehicle } from '../types/nemt';
import { 
  Truck, 
  Wrench, 
  Fuel, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck,
  Search
} from 'lucide-react';

export const FleetManager: React.FC = () => {
  const { vehicles, drivers } = useNemt();
  const [filterType, setFilterType] = useState<string>('All');

  const filteredVehicles = vehicles.filter(v => {
    if (filterType === 'Wheelchair' && !v.vehicleType.includes('Wheelchair')) return false;
    if (filterType === 'Stretcher' && !v.vehicleType.includes('Stretcher')) return false;
    if (filterType === 'Ambulatory' && v.vehicleType !== 'Ambulatory Sedan') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            Eagles NEMT Fleet & ADA Equipment Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hydraulic Lift Certifications • DOT Periodic Inspections • Telematics & Asset Readiness
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Vehicle Classes ({vehicles.length})</option>
            <option value="Wheelchair">Wheelchair Lift Vans</option>
            <option value="Stretcher">Stretcher Transports</option>
            <option value="Ambulatory">Ambulatory Sedans</option>
          </select>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map(veh => {
          const assignedDriver = drivers.find(d => d.assignedVehicleId === veh.id);
          const isMaintenance = veh.status === 'Maintenance Scheduled';

          return (
            <div
              key={veh.id}
              className={`bg-slate-900 border rounded-xl p-5 space-y-4 shadow-lg transition-all ${
                isMaintenance ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-400">
                      {veh.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        veh.status === 'In Service'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {veh.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm mt-1.5">{veh.name}</h3>
                  <p className="text-xs text-slate-400">{veh.makeModel} ({veh.year})</p>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300 font-bold block">
                    {veh.plate}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block truncate max-w-[120px]">{veh.vin}</span>
                </div>
              </div>

              {/* ADA Capacity Badges */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-around text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Ambulatory</span>
                  <span className="font-mono font-bold text-slate-200">{veh.capacity.ambulatory} Seats</span>
                </div>
                <div className="h-6 w-px bg-slate-800"></div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Wheelchair</span>
                  <span className="font-mono font-bold text-cyan-400">♿ {veh.capacity.wheelchair} Bays</span>
                </div>
                <div className="h-6 w-px bg-slate-800"></div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Stretcher</span>
                  <span className="font-mono font-bold text-amber-400">🛏️ {veh.capacity.stretcher}</span>
                </div>
              </div>

              {/* Telematics stats */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Fuel className="w-3.5 h-3.5 text-cyan-400" /> Fuel Level:
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          veh.fuelPercent > 40 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${veh.fuelPercent}%` }}
                      ></div>
                    </div>
                    <span className="font-mono font-bold">{veh.fuelPercent}%</span>
                  </div>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Current Odometer:</span>
                  <span className="font-mono font-bold">{veh.currentMileage.toLocaleString()} mi</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Hydraulic Lift Cert:</span>
                  <span className="text-emerald-400 font-mono">{veh.liftCertificationExpiry}</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Assigned Driver:</span>
                  <span className="font-medium text-slate-200">
                    {assignedDriver ? assignedDriver.name : 'Unassigned Pool'}
                  </span>
                </div>
              </div>

              {/* Equipment Installed */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
                  Installed Medical & ADA Gear:
                </span>
                <div className="flex flex-wrap gap-1">
                  {veh.equipmentInstalled.map((eq, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300"
                    >
                      ✓ {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
