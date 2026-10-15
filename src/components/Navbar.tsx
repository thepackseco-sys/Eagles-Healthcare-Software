import React from 'react';
import { useNemt } from '../context/NemtContext';
import { 
  Activity, 
  Truck, 
  CalendarPlus, 
  UserCheck, 
  DollarSign, 
  ShieldCheck, 
  RotateCcw, 
  Play, 
  Pause,
  MapPin,
  HeartPulse
} from 'lucide-react';

export type NavTab = 'dispatch' | 'booking' | 'driver' | 'fleet' | 'billing' | 'tracking';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { trips, isSimulating, setIsSimulating, resetAllData } = useNemt();

  const pendingCount = trips.filter(t => t.status === 'Scheduled').length;
  const activeCount = trips.filter(t => ['En Route Pickup', 'Loaded & In Transit'].includes(t.status)).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dispatch')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-900/40 text-white font-extrabold text-lg border border-cyan-400/40">
              🦅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-100">
                  EAGLES <span className="text-cyan-400">HEALTHCARE</span>
                </span>
                <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-[10px] font-mono font-bold">
                  NEMT CAD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">
                Patient Transfer & Medical Transportation Services
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => onSelectTab('dispatch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'dispatch'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live CAD Dispatch</span>
              {activeCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-cyan-950 text-cyan-200 border border-cyan-700 rounded-full text-[10px]">
                  {activeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('booking')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'booking'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Trip Intake</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('driver')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'driver'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Driver In-Cab MDT</span>
            </button>

            <button
              onClick={() => onSelectTab('fleet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'fleet'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Fleet & Assets</span>
            </button>

            <button
              onClick={() => onSelectTab('billing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'billing'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Medicaid Billing</span>
            </button>

            <button
              onClick={() => onSelectTab('tracking')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'tracking'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Patient Tracker</span>
            </button>
          </nav>

          {/* Quick Simulation & Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                isSimulating
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={isSimulating ? 'Pause simulated vehicle movements' : 'Start simulated vehicle movements'}
            >
              {isSimulating ? <Pause className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3 text-slate-400" />}
              <span className="hidden sm:inline">{isSimulating ? 'Telematics Live' : 'Paused'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all trips and drivers back to initial state?')) {
                  resetAllData();
                }
              }}
              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Reset initial seed dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Scroller */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-850">
          {(
            [
              ['dispatch', 'Dispatch CAD', Activity],
              ['booking', 'Trip Intake', CalendarPlus],
              ['driver', 'Driver MDT', UserCheck],
              ['fleet', 'Fleet', Truck],
              ['billing', 'Billing', DollarSign],
              ['tracking', 'Tracker', MapPin],
            ] as const
          ).map(([tab, label, Icon]) => (
            <button
              key={tab}
              onClick={() => onSelectTab(tab as NavTab)}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === tab ? 'bg-cyan-600 text-white' : 'text-slate-400 bg-slate-950'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
