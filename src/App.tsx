import React, { useState } from 'react';
import { NemtProvider } from './context/NemtContext';
import { Navbar, NavTab } from './components/Navbar';
import { DispatchBoard } from './components/DispatchBoard';
import { TripIntakeForm } from './components/TripIntakeForm';
import { DriverPortal } from './components/DriverPortal';
import { FleetManager } from './components/FleetManager';
import { BillingAuditView } from './components/BillingAuditView';
import { PatientTracker } from './components/PatientTracker';
import { ShieldCheck, PhoneCall, Headphones, Clock } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dispatch');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dispatch' && <DispatchBoard />}
        {currentTab === 'booking' && (
          <TripIntakeForm onSuccess={() => setCurrentTab('dispatch')} />
        )}
        {currentTab === 'driver' && <DriverPortal />}
        {currentTab === 'fleet' && <FleetManager />}
        {currentTab === 'billing' && <BillingAuditView />}
        {currentTab === 'tracking' && <PatientTracker />}
      </main>

      {/* Footer with NEMT compliance & dispatch hotline */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🦅</span>
            <div>
              <div className="font-bold text-slate-200">
                Eagles Healthcare Patient Transfer Services • NEMT Operations
              </div>
              <div className="text-[11px] text-slate-500">
                HIPAA Certified • ADA Accessible Transport • State Medicaid Enrolled Provider
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-cyan-400" />
              24/7 Dispatch Hotline: <strong className="text-slate-200 font-mono">(404) 555-EAGL</strong>
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              CMS-1500 & EDI 837P Compliant
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <NemtProvider>
      <AppContent />
    </NemtProvider>
  );
}

export default App;
