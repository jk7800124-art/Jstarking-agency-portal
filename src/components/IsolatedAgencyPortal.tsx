import React, { useState, useEffect } from 'react';
import { getStoredFamilies, getStoredMembers } from '../data/mockDatabase';
import { FamilyAgency, HostMember } from '../types/agency';
import { Building2, Users, FolderOpen, Coins, ArrowUpRight } from 'lucide-react';
import { PayoutRequestModal } from './PayoutRequestModal';
import { calculateCoinToFiat } from '../types/payout';

interface IsolatedAgencyPortalProps {
  familyId: string;
}

export const IsolatedAgencyPortal: React.FC<IsolatedAgencyPortalProps> = ({ familyId }) => {
  const [families, setFamilies] = useState<FamilyAgency[]>([]);
  const [hosts, setHosts] = useState<HostMember[]>([]);

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [activeHostForPayout, setActiveHostForPayout] = useState<HostMember | null>(null);

  useEffect(() => {
    const allF = getStoredFamilies().map(f => f.wallet_coins === 100000 ? { ...f, wallet_coins: 0 } : f);
    setFamilies(allF);
    const allH = getStoredMembers().map(h => (h.wallet_balance_coins === 100000 || h.coins_current_month === 100000) ? { ...h, wallet_balance_coins: 0, coins_current_month: 0, withdrawable_inr: 0 } : h);
    setHosts(allH);
  }, [familyId]);

  const currentFamily = families.find(f => f.id === familyId) || families[0];
  const myHosts = currentFamily ? hosts.filter(m => m.parent_id === currentFamily.id) : [];

  if (!currentFamily) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
        <FolderOpen className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-lg font-bold text-white">No Agency Found</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          No Family Agency has been registered yet. Please switch to the State Manager view to register an agency.
        </p>
      </div>
    );
  }

  const famCoins = currentFamily.wallet_coins ?? 0;
  const famConversion = calculateCoinToFiat(famCoins, currentFamily.country_code);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">J-Star King &bull; {currentFamily.name}</h1>
                <span className="font-mono text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-bold">
                  {currentFamily.agency_code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Leader: <strong className="text-white">{currentFamily.leader_name}</strong> &bull; Level: {currentFamily.agency_level} &bull; Country: {currentFamily.country_code}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="text-slate-400">Agency Balance:</div>
              <div className="text-purple-300 font-bold font-mono text-base flex items-center gap-1">
                <span>{famCoins.toLocaleString()} 🪙</span>
              </div>
              <div className="text-emerald-400 font-mono text-[11px] font-semibold">
                Auto Calc: {famConversion.formattedDisplay}
              </div>
            </div>

            <button
              onClick={() => setPayoutModalOpen(true)}
              className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <Coins className="w-4 h-4 text-slate-950" />
              <span>Request Payout</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Agency Host Roster */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white">Agency Host Roster ({myHosts.length} Active Streamers)</h2>
            <p className="text-xs text-slate-400">Earnings automatically calculated at 100,000 Coins = ₹600 INR rate.</p>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 rounded">
            Rate: 100k 🪙 = ₹600 INR
          </span>
        </div>

        {myHosts.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No hosts registered under this agency ({currentFamily.agency_code}) yet. Switch to State Manager view to add hosts.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-2.5">Host Name</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Coins</th>
                  <th className="pb-2.5">Payout Value (100k = ₹600)</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {myHosts.map((h) => {
                  const hConversion = calculateCoinToFiat(h.wallet_balance_coins, currentFamily.country_code);

                  return (
                    <tr key={h.id} className="hover:bg-slate-950/60">
                      <td className="py-2.5">
                        <span className="font-bold text-white block">{h.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {h.id}</span>
                      </td>
                      <td className="py-2.5 text-slate-400">{h.category}</td>
                      <td className="py-2.5 font-bold text-amber-300 font-mono">{h.wallet_balance_coins.toLocaleString()} 🪙</td>
                      <td className="py-2.5 font-mono text-emerald-400 font-bold">{hConversion.formattedDisplay}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => setActiveHostForPayout(h)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[11px] shadow-sm transition"
                        >
                          Request Payout
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agency Payout Request Modal */}
      <PayoutRequestModal
        isOpen={payoutModalOpen}
        onClose={() => setPayoutModalOpen(false)}
        requesterName={currentFamily.name}
        requesterRole="family"
        requesterUid={currentFamily.id}
        countryCode={currentFamily.country_code}
        currentAvailableCoins={famCoins}
      />

      {/* Host Payout Request Modal */}
      {activeHostForPayout && (
        <PayoutRequestModal
          isOpen={true}
          onClose={() => setActiveHostForPayout(null)}
          requesterName={activeHostForPayout.name}
          requesterRole="member"
          requesterUid={activeHostForPayout.id}
          countryCode={activeHostForPayout.country_code}
          currentAvailableCoins={activeHostForPayout.wallet_balance_coins}
        />
      )}

    </div>
  );
};
