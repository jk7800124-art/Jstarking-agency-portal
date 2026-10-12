import React, { useState, useEffect } from 'react';
import { getStoredBDs, getStoredFamilies, getStoredMembers } from '../data/mockDatabase';
import { BusinessDeveloper, FamilyAgency, HostMember } from '../types/agency';
import { Briefcase, Building2, Users, FolderOpen, Coins, ArrowUpRight } from 'lucide-react';
import { PayoutRequestModal } from './PayoutRequestModal';
import { calculateCoinToFiat } from '../types/payout';

interface IsolatedBDPortalProps {
  bdId: string;
}

export const IsolatedBDPortal: React.FC<IsolatedBDPortalProps> = ({ bdId }) => {
  const [bds, setBds] = useState<BusinessDeveloper[]>([]);
  const [families, setFamilies] = useState<FamilyAgency[]>([]);
  const [hosts, setHosts] = useState<HostMember[]>([]);

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);

  useEffect(() => {
    const allB = getStoredBDs().map(b => b.wallet_coins === 100000 ? { ...b, wallet_coins: 0 } : b);
    setBds(allB);
    const allF = getStoredFamilies().map(f => f.wallet_coins === 100000 ? { ...f, wallet_coins: 0 } : f);
    setFamilies(allF);
    const allH = getStoredMembers().map(h => (h.wallet_balance_coins === 100000 || h.coins_current_month === 100000) ? { ...h, wallet_balance_coins: 0, coins_current_month: 0, withdrawable_inr: 0 } : h);
    setHosts(allH);
  }, [bdId]);

  const currentBd = bds.find(b => b.id === bdId) || bds[0];
  const myFamilies = currentBd ? families.filter(f => f.parent_id === currentBd.id) : [];
  const myHosts = currentBd ? hosts.filter(m => myFamilies.some(f => f.id === m.parent_id)) : [];

  if (!currentBd) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
        <FolderOpen className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-lg font-bold text-white">No Business Developer Found</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          No Business Developer has been registered yet. Please switch to the State Manager view to create a BD for this country.
        </p>
      </div>
    );
  }

  const bdCoins = currentBd.wallet_coins ?? 0;
  const bdConversion = calculateCoinToFiat(bdCoins, currentBd.country_code);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">J-Star King &bull; Business Developer Portal</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  {currentBd.country_code} ISOLATED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                BD: <strong className="text-cyan-300">{currentBd.name}</strong> &bull; Region: {currentBd.assigned_region_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="text-slate-400">BD Wallet:</div>
              <div className="text-cyan-300 font-bold font-mono text-base flex items-center gap-1">
                <span>{bdCoins.toLocaleString()} 🪙</span>
              </div>
              <div className="text-emerald-400 font-mono text-[11px] font-semibold">
                Auto Calc: {bdConversion.formattedDisplay}
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 uppercase font-semibold">My Managed Families</span>
          <div className="text-2xl font-black text-white mt-1">{myFamilies.length} Agencies</div>
          <p className="text-xs text-slate-500 mt-1">Directly reporting to you</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Hosts In Network</span>
          <div className="text-2xl font-black text-white mt-1">{myHosts.length} Hosts</div>
          <p className="text-xs text-slate-500 mt-1">Across your agency portfolio</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 uppercase font-semibold">BD Commission Share</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{currentBd.commission_percentage}% Coins</div>
          <p className="text-xs text-slate-500 mt-1">Rate: 100k = ₹600 INR</p>
        </div>
      </div>

      {/* Families under this BD */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-white mb-3">Your Agency Network (Families)</h2>
        {myFamilies.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No agencies registered under your BD ID ({currentBd.id}) yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myFamilies.map((fam) => {
              const famConversion = calculateCoinToFiat(fam.wallet_coins, currentBd.country_code);

              return (
                <div key={fam.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-white">{fam.name}</h3>
                      <span className="font-mono text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                        {fam.agency_code}
                      </span>
                    </div>
                    <div className="text-right text-xs font-mono">
                      <div className="text-purple-300 font-bold">{fam.wallet_coins.toLocaleString()} 🪙</div>
                      <div className="text-emerald-400 text-[10px]">{famConversion.formattedDisplay}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono">
                    <span>Hosts: {hosts.filter(h => h.parent_id === fam.id).length}</span>
                    <span>Leader: {fam.leader_name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      <PayoutRequestModal
        isOpen={payoutModalOpen}
        onClose={() => setPayoutModalOpen(false)}
        requesterName={currentBd.name}
        requesterRole="bd"
        requesterUid={currentBd.id}
        countryCode={currentBd.country_code}
        currentAvailableCoins={bdCoins}
      />

    </div>
  );
};
