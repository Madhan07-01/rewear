import React, { useState, useEffect } from 'react';
import { PolicyConfig, AuditLogEntry, DisputeCase } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Settings,
  History,
  CheckCircle2,
  AlertTriangle,
  Scale,
  DollarSign,
  Users,
  RefreshCw,
  Sliders,
  FileText
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, showToast } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'METRICS' | 'POLICIES' | 'DISPUTES' | 'AUDIT'>('METRICS');

  // Policy Form State
  const [policy, setPolicy] = useState<PolicyConfig | null>(null);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  // Selected Dispute
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(null);
  const [disputeNotes, setDisputeNotes] = useState('Reviewed return photographs; minor hem fraying covered by Protection Plan.');
  const [isResolving, setIsResolving] = useState(false);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      setDashboardData(data);
      if (data.policy) {
        setPolicy(data.policy);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSavePolicy = async () => {
    if (!policy) return;
    setIsSavingPolicy(true);
    try {
      const res = await fetch('/api/admin/policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': currentUser.name
        },
        body: JSON.stringify(policy)
      });
      if (res.ok) {
        showToast('Platform policies updated and logged to audit ledger');
        await fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const handleResolveDispute = async (outcome: 'FULL_REFUND' | 'PARTIAL_DEDUCTION') => {
    if (!selectedDispute) return;
    setIsResolving(true);
    try {
      const res = await fetch(`/api/disputes/${selectedDispute.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outcome,
          notes: disputeNotes,
          actor: currentUser.name
        })
      });
      if (res.ok) {
        showToast(`Dispute resolved with ${outcome}`);
        setSelectedDispute(null);
        await fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResolving(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-[#6F747A]">
        Loading admin governance console...
      </div>
    );
  }

  const { metrics, disputes, recentAuditLogs, recentOrders } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 pb-4 border-b border-[#E8E1D8]">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#781F37] block mb-1">
            Platform Governance & Risk Oversight
          </span>
          <h1 className="font-serif-couture text-3xl font-bold text-[#18212B]">
            ReWear Trust & Policy Console
          </h1>
          <p className="text-xs text-[#6F747A] mt-0.5">
            Admin arbitration, segregated escrow vault monitoring, and circular policy controls.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#E8E1D8] text-xs">
          {(['METRICS', 'POLICIES', 'DISPUTES', 'AUDIT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeTab === tab ? 'bg-[#18212B] text-white shadow-xs' : 'text-stone-600 hover:text-black'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Platform Overview Metrics */}
      {activeTab === 'METRICS' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D8]">
              <span className="text-[10px] uppercase font-bold text-[#6F747A] block">Gross Merchandise Value</span>
              <span className="font-serif-couture text-3xl font-bold text-[#18212B] block mt-1">
                ₹{metrics.totalGmv.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#197B5B] font-semibold">{metrics.totalOrders} total reservations</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D8]">
              <span className="text-[10px] uppercase font-bold text-[#197B5B] block">Escrow Deposits Held</span>
              <span className="font-serif-couture text-3xl font-bold text-[#197B5B] block mt-1">
                ₹{metrics.totalEscrowDepositsHeld.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-stone-500">Held in segregated escrow</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D8]">
              <span className="text-[10px] uppercase font-bold text-[#C89228] block">Circular Wears Recorded</span>
              <span className="font-serif-couture text-3xl font-bold text-[#C89228] block mt-1">
                {metrics.circularWearsRecorded}
              </span>
              <span className="text-[10px] text-stone-500">Across {metrics.totalProducts} pieces</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D8]">
              <span className="text-[10px] uppercase font-bold text-[#781F37] block">Active Disputes</span>
              <span className="font-serif-couture text-3xl font-bold text-[#781F37] block mt-1">
                {metrics.openDisputesCount}
              </span>
              <span className="text-[10px] text-stone-500">Escrow cases pending review</span>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E1D8] space-y-4">
            <h3 className="font-serif-couture text-lg font-bold text-[#18212B]">
              Recent Platform Transactions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-[#6F747A] uppercase text-[10px]">
                    <th className="py-2.5">Order</th>
                    <th className="py-2.5">Renter</th>
                    <th className="py-2.5">Owner / Boutique</th>
                    <th className="py-2.5">Rental Total</th>
                    <th className="py-2.5">Escrow Deposit</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.map((o: any) => (
                    <tr key={o.id}>
                      <td className="py-3 font-bold text-[#18212B]">{o.orderNumber}</td>
                      <td className="py-3">{o.customerName}</td>
                      <td className="py-3">{o.sellerName}</td>
                      <td className="py-3 font-semibold">₹{o.pricing.totalPaidToday}</td>
                      <td className="py-3 text-[#197B5B] font-bold">₹{o.pricing.refundableDeposit}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Configurable Policies */}
      {activeTab === 'POLICIES' && policy && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D8] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-serif-couture text-xl font-bold text-[#18212B]">
                Dynamic Policy Configuration
              </h3>
              <p className="text-xs text-[#6F747A]">
                Tune commission rates, deposit safety thresholds, and high-value risk parameters.
              </p>
            </div>
            <button
              onClick={handleSavePolicy}
              disabled={isSavingPolicy}
              className="px-5 py-2.5 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              {isSavingPolicy ? 'Saving...' : 'Save & Publish Policies'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Commissions */}
            <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="font-bold uppercase tracking-wider text-[#6F747A] text-[10px] block">
                Platform Commissions
              </span>
              <div>
                <label className="text-stone-700 block mb-1">B2C Wardrobe Commission (%)</label>
                <input
                  type="number"
                  value={policy.commissionB2CPercent}
                  onChange={(e) => setPolicy({ ...policy, commissionB2CPercent: Number(e.target.value) })}
                  className="w-full p-2 bg-white rounded-xl border border-stone-300 font-bold"
                />
              </div>
              <div>
                <label className="text-stone-700 block mb-1">B2B Studio Commission (%)</label>
                <input
                  type="number"
                  value={policy.commissionB2BPercent}
                  onChange={(e) => setPolicy({ ...policy, commissionB2BPercent: Number(e.target.value) })}
                  className="w-full p-2 bg-white rounded-xl border border-stone-300 font-bold"
                />
              </div>
            </div>

            {/* Deposit Rules */}
            <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="font-bold uppercase tracking-wider text-[#6F747A] text-[10px] block">
                Escrow Deposit Rules
              </span>
              <div>
                <label className="text-stone-700 block mb-1">Minimum Deposit Rate (%)</label>
                <input
                  type="number"
                  value={policy.depositMinPercent}
                  onChange={(e) => setPolicy({ ...policy, depositMinPercent: Number(e.target.value) })}
                  className="w-full p-2 bg-white rounded-xl border border-stone-300 font-bold"
                />
              </div>
              <div>
                <label className="text-stone-700 block mb-1">Default Rental Multiplier (x)</label>
                <input
                  type="number"
                  step="0.1"
                  value={policy.depositDefaultMultiplier}
                  onChange={(e) => setPolicy({ ...policy, depositDefaultMultiplier: Number(e.target.value) })}
                  className="w-full p-2 bg-white rounded-xl border border-stone-300 font-bold"
                />
              </div>
            </div>

            {/* High Value Risk Thresholds */}
            <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="font-bold uppercase tracking-wider text-[#6F747A] text-[10px] block">
                High Value Couture Thresholds
              </span>
              <div>
                <label className="text-stone-700 block mb-1">ID Verification Retail (₹)</label>
                <input
                  type="number"
                  value={policy.identityVerificationMandatoryRetail}
                  onChange={(e) => setPolicy({ ...policy, identityVerificationMandatoryRetail: Number(e.target.value) })}
                  className="w-full p-2 bg-white rounded-xl border border-stone-300 font-bold"
                />
              </div>
              <div>
                <label className="text-stone-700 block mb-1">Protection Coverage Cap (₹)</label>
                <input
                  type="number"
                  value={policy.protectionCoverageCap}
                  onChange={(e) => setPolicy({ ...policy, protectionCoverageCap: Number(e.target.value) })}
                  className="w-full p-2 bg-white rounded-xl border border-stone-300 font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Dispute Arbitration Viewer */}
      {activeTab === 'DISPUTES' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D8] shadow-xs space-y-6">
          <div>
            <h3 className="font-serif-couture text-xl font-bold text-[#18212B]">
              Escrow Dispute Resolution Desk
            </h3>
            <p className="text-xs text-[#6F747A]">
              Arbitrate contested return inspections with photographic evidence and policy guidance.
            </p>
          </div>

          {disputes.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-xs">
              No open disputes currently pending. All deposit refunds have been approved amicably.
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map((d: DisputeCase) => (
                <div key={d.id} className="p-4 rounded-2xl border border-[#E8E1D8] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#18212B]">Order {d.orderNumber}</span>
                    <span className="text-xs font-bold text-[#C93B3B] bg-red-100 px-2 py-0.5 rounded">
                      Disputed: ₹{d.amountDisputed}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700">
                    <strong>Claimant:</strong> {d.claimantName} · <em>"{d.reason}"</em>
                  </p>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleResolveDispute('FULL_REFUND')}
                      className="px-4 py-2 bg-[#197B5B] text-white rounded-xl text-xs font-semibold"
                    >
                      Arbitrate: Full Deposit Refund to Customer
                    </button>
                    <button
                      onClick={() => handleResolveDispute('PARTIAL_DEDUCTION')}
                      className="px-4 py-2 bg-[#781F37] text-white rounded-xl text-xs font-semibold"
                    >
                      Arbitrate: Proportional Deduction to Owner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Immutable Audit Log */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D8] shadow-xs space-y-4">
          <div>
            <h3 className="font-serif-couture text-xl font-bold text-[#18212B]">
              System & Financial Audit Ledger
            </h3>
            <p className="text-xs text-[#6F747A]">
              Immutable log of payments, escrow deposit releases, handovers, and lifecycle mutations.
            </p>
          </div>

          <div className="space-y-2">
            {recentAuditLogs.map((log: AuditLogEntry) => (
              <div key={log.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-start gap-3">
                <span className="font-mono text-[10px] text-stone-400 mt-0.5">{log.timestamp.slice(11, 19)}</span>
                <div className="flex-1">
                  <span className="font-bold text-[#781F37] mr-2">[{log.eventType}]</span>
                  <span className="text-stone-800">{log.details}</span>
                </div>
                <span className="text-[10px] font-semibold text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                  {log.actor}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
