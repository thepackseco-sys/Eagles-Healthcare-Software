import React, { useState } from 'react';
import { useNemt } from '../context/NemtContext';
import { Trip, BillingStatus } from '../types/nemt';
import { 
  DollarSign, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Search, 
  FileText,
  Building,
  Filter
} from 'lucide-react';

export const BillingAuditView: React.FC = () => {
  const { trips, setSelectedTripForDetail } = useNemt();
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredTrips = trips.filter(t => {
    if (statusFilter !== 'All' && t.billingStatus !== statusFilter) return false;
    return true;
  });

  // Calculate billing totals
  const totalProjected = trips.reduce((acc, t) => acc + t.totalBillingAmount, 0);
  const totalApproved = trips
    .filter(t => t.billingStatus === 'Approved' || t.billingStatus === 'Paid')
    .reduce((acc, t) => acc + t.totalBillingAmount, 0);
  const totalMiles = trips.reduce((acc, t) => acc + t.distanceMiles, 0);

  // CSV Export for Medicaid Clearinghouse
  const handleExportClaimsCSV = () => {
    const headers = [
      'Trip ID',
      'Patient Name',
      'Patient DOB',
      'Insurance Type',
      'Member ID / Policy',
      'Service Date',
      'HCPCS Base Code',
      'Base Rate ($)',
      'HCPCS Mileage Code',
      'Billable Miles',
      'Total Claim ($)',
      'Billing Status',
      'Claim Control Number',
      'Electronic Signature Verified',
    ];

    const rows = trips.map(t => [
      t.id,
      `"${t.patientName}"`,
      t.patientDob,
      t.insuranceType,
      t.insuranceId,
      t.createdAt.split('T')[0],
      t.hcpcsCode,
      t.baseRate.toFixed(2),
      t.mileageHcpcsCode,
      t.distanceMiles.toFixed(1),
      t.totalBillingAmount.toFixed(2),
      t.billingStatus,
      t.claimId || 'PENDING',
      t.patientSignature ? 'YES (VERIFIED)' : 'PENDING SIGN-OFF',
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Eagles_NEMT_CMS1500_Claims_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Medicaid & CMS-1500 NEMT Billing Clearinghouse
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            HCPCS T2003 / A0428 Encounter Coding • S0215 Mileage Audit • State Verification Ready
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportClaimsCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export EDI 837P / CSV Claims</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-xs text-slate-400 font-medium">Total Billable Encounter Revenue</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            ${totalProjected.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{trips.length} Total Registered Runs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-xs text-slate-400 font-medium">Verified & Approved Claims</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            ${totalApproved.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Full GPS & Signature Audit Match</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-xs text-slate-400 font-medium">Total Audit Logged Miles</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            {totalMiles.toFixed(1)} mi
          </div>
          <div className="text-[11px] text-slate-500 mt-1">HCPCS S0215 State Mileage Audit</div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Claims Ledger</span>
            <span className="text-xs font-mono text-cyan-400">({filteredTrips.length} Claims)</span>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Ready for Billing">Ready for Billing</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 tracking-wider">
              <tr>
                <th className="py-3 px-4">Trip ID / Claim</th>
                <th className="py-3 px-4">Patient & Policy</th>
                <th className="py-3 px-4">Mobility Tier</th>
                <th className="py-3 px-4">HCPCS Codes</th>
                <th className="py-3 px-4">Miles / Route</th>
                <th className="py-3 px-4">Total Fee</th>
                <th className="py-3 px-4">Audit Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTrips.map(trip => (
                <tr key={trip.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-cyan-400 block">{trip.id}</span>
                    <span className="text-[10px] text-slate-500">{trip.claimId || 'No Claim ID'}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-200">{trip.patientName}</div>
                    <div className="text-[11px] text-slate-400">
                      {trip.insuranceType} • <span className="font-mono">{trip.insuranceId}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-medium">
                      {trip.mobility}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div className="text-emerald-400 font-bold">{trip.hcpcsCode} (${trip.baseRate})</div>
                    <div className="text-[10px] text-slate-400">{trip.mileageHcpcsCode} (${trip.mileageRate}/mi)</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-200">{trip.distanceMiles} miles</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                      {trip.pickupFacilityName || trip.pickupAddress} → {trip.dropoffFacilityName || trip.dropoffAddress}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-100 text-sm">
                    ${trip.totalBillingAmount.toFixed(2)}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                        trip.billingStatus === 'Approved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : trip.billingStatus === 'Ready for Billing'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {trip.billingStatus}
                    </span>
                    {trip.patientSignature && (
                      <span className="block text-[10px] text-emerald-400 mt-1">✓ Signature Attached</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedTripForDetail(trip)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-slate-700 transition-colors"
                    >
                      Audit Trail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
