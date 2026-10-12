import React, { useState, useEffect } from 'react';
import { 
  EXACT_10_COUNTRIES, 
  getStoredBDs, 
  saveStoredBDs, 
  getStoredFamilies, 
  saveStoredFamilies, 
  getStoredMembers, 
  saveStoredMembers,
  getStoredStateManagers,
  saveStoredStateManagers
} from '../data/mockDatabase';
import { BusinessDeveloper, FamilyAgency, HostMember, StateManager } from '../types/agency';
import { 
  Building2, 
  Briefcase, 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Coins,
  IndianRupee,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { PayoutRequestModal } from './PayoutRequestModal';
import { calculateCoinToFiat } from '../types/payout';

interface IsolatedCountryPortalProps {
  countryCode: string;
  managerName?: string;
}

export const IsolatedCountryPortal: React.FC<IsolatedCountryPortalProps> = ({ countryCode, managerName }) => {
  const [activeTab, setActiveTab] = useState<'bds' | 'families' | 'hosts'>('bds');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real dynamic local data
  const [bds, setBds] = useState<BusinessDeveloper[]>([]);
  const [families, setFamilies] = useState<FamilyAgency[]>([]);
  const [hosts, setHosts] = useState<HostMember[]>([]);
  const [stateManager, setStateManager] = useState<StateManager | null>(null);

  // Form Modal States
  const [showAddModal, setShowAddModal] = useState<'bd' | 'family' | 'host' | null>(null);
  
  // Form input fields
  const [newName, setNewName] = useState('');
  const [newSubField, setNewSubField] = useState(''); // region / agency_code / category
  const [newLeader, setNewLeader] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [initialCoins, setInitialCoins] = useState<number>(0);

  // Payout Request Modal State
  const [payoutModalData, setPayoutModalData] = useState<{
    isOpen: boolean;
    name: string;
    role: 'state_manager' | 'bd' | 'family' | 'member';
    uid: string;
    coins: number;
  }>({
    isOpen: false,
    name: '',
    role: 'state_manager',
    uid: '',
    coins: 0,
  });

  // Load clean real data for this country
  useEffect(() => {
    const allSm = getStoredStateManagers();
    const currentSm = allSm.find(s => s.country_code === countryCode);
    if (!currentSm) {
      // Auto-initialize country head with clean 0 coins
      const initSm: StateManager = {
        id: `sm_${countryCode.toLowerCase()}_01`,
        role: 'state_manager',
        country_code: countryCode,
        parent_id: 'master_admin_01',
        name: managerName || `State Manager ${countryCode}`,
        assigned_country: countryCode,
        managed_bd_ids: [],
        total_families: 0,
        total_hosts: 0,
        commission_percentage: 3.0,
        wallet_coins: 0, // Real 0 balance (Zero dummy coins)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
      };
      saveStoredStateManagers([...allSm, initSm]);
      setStateManager(initSm);
    } else {
      if (currentSm.wallet_coins === 100000) {
        currentSm.wallet_coins = 0;
        saveStoredStateManagers(allSm);
      }
      setStateManager(currentSm);
    }

    const allBds = getStoredBDs().map(b => b.wallet_coins === 100000 ? { ...b, wallet_coins: 0 } : b);
    saveStoredBDs(allBds);
    setBds(allBds.filter(b => b.country_code === countryCode));

    const allFams = getStoredFamilies().map(f => f.wallet_coins === 100000 ? { ...f, wallet_coins: 0 } : f);
    saveStoredFamilies(allFams);
    setFamilies(allFams.filter(f => f.country_code === countryCode));

    const allHosts = getStoredMembers().map(h => 
      (h.wallet_balance_coins === 100000 || h.coins_current_month === 100000)
        ? { ...h, wallet_balance_coins: 0, coins_current_month: 0, total_coins_lifetime: 0, withdrawable_inr: 0 } 
        : h
    );
    saveStoredMembers(allHosts);
    setHosts(allHosts.filter(m => m.country_code === countryCode));
  }, [countryCode, managerName]);

  const countryMeta = EXACT_10_COUNTRIES.find(c => c.code === countryCode) || EXACT_10_COUNTRIES[0];

  // Handlers for adding real team members
  const handleAddBD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newBd: BusinessDeveloper = {
      id: `bd_${countryCode.toLowerCase()}_${Date.now().toString().slice(-4)}`,
      role: 'bd',
      country_code: countryCode,
      parent_id: stateManager?.id || `sm_${countryCode.toLowerCase()}_01`,
      state_manager_id: stateManager?.id || `sm_${countryCode.toLowerCase()}_01`,
      name: newName.trim(),
      assigned_region_name: newSubField.trim() || 'Central Region',
      managed_family_ids: [],
      total_hosts: 0,
      commission_percentage: 5.0,
      wallet_coins: 0, // Strict zero base: coins only earned via live commissions
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
    };

    const updated = [...getStoredBDs(), newBd];
    saveStoredBDs(updated);
    setBds(updated.filter(b => b.country_code === countryCode));
    resetForm();
  };

  const handleAddFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSubField.trim()) return;

    const targetBd = bds.find(b => b.id === selectedParentId) || bds[0];

    const newFamily: FamilyAgency = {
      id: `fam_${countryCode.toLowerCase()}_${Date.now().toString().slice(-4)}`,
      role: 'family',
      country_code: countryCode,
      parent_id: targetBd?.id || `bd_${countryCode.toLowerCase()}_01`,
      bd_id: targetBd?.id || `bd_${countryCode.toLowerCase()}_01`,
      name: newName.trim(),
      agency_code: newSubField.trim().toUpperCase(),
      leader_name: newLeader.trim() || 'Agency Lead',
      agency_level: 'Gold',
      commission_percentage: 12.0,
      wallet_coins: 0, // Strict zero base: coins only earned via live commissions
      total_hosts: 0,
      total_monthly_coins: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
    };

    const updated = [...getStoredFamilies(), newFamily];
    saveStoredFamilies(updated);
    setFamilies(updated.filter(f => f.country_code === countryCode));
    resetForm();
  };

  const handleAddHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const targetFam = families.find(f => f.id === selectedParentId) || families[0];

    const newHost: HostMember = {
      id: `host_${countryCode.toLowerCase()}_${Date.now().toString().slice(-4)}`,
      role: 'member',
      country_code: countryCode,
      parent_id: targetFam?.id || `fam_${countryCode.toLowerCase()}_01`,
      family_id: targetFam?.id || `fam_${countryCode.toLowerCase()}_01`,
      agency_code: targetFam?.agency_code || `${countryCode}-AGENCY-01`,
      name: newName.trim(),
      live_status: 'offline',
      category: (newSubField as any) || 'Singing',
      coins_current_month: 0,
      total_coins_lifetime: 0,
      target_hours_monthly: 60,
      completed_hours_monthly: 0,
      stream_rank: hosts.length + 1,
      wallet_balance_coins: 0, // Strict zero base: coins only earned via live gifts
      withdrawable_inr: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
    };

    const updated = [...getStoredMembers(), newHost];
    saveStoredMembers(updated);
    setHosts(updated.filter(h => h.country_code === countryCode));
    resetForm();
  };

  const handleDelete = (type: 'bd' | 'family' | 'host', id: string) => {
    if (type === 'bd') {
      const updated = getStoredBDs().filter(b => b.id !== id);
      saveStoredBDs(updated);
      setBds(updated.filter(b => b.country_code === countryCode));
    } else if (type === 'family') {
      const updated = getStoredFamilies().filter(f => f.id !== id);
      saveStoredFamilies(updated);
      setFamilies(updated.filter(f => f.country_code === countryCode));
    } else {
      const updated = getStoredMembers().filter(m => m.id !== id);
      saveStoredMembers(updated);
      setHosts(updated.filter(m => m.country_code === countryCode));
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewSubField('');
    setNewLeader('');
    setSelectedParentId('');
    setInitialCoins(0);
    setShowAddModal(null);
  };

  const openPayoutModal = (name: string, role: 'state_manager' | 'bd' | 'family' | 'member', uid: string, coins: number) => {
    setPayoutModalData({
      isOpen: true,
      name,
      role,
      uid,
      coins: Math.max(0, coins),
    });
  };

  const filteredBds = bds.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFamilies = families.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.agency_code.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredHosts = hosts.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const smCoins = stateManager?.wallet_coins ?? 0;
  const smConversion = calculateCoinToFiat(smCoins, countryCode);

  return (
    <div className="space-y-6">
      
      {/* Top Banner - Strict Isolated Country */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner">
              {countryMeta.flag}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white">
                  J-Star King &bull; {countryMeta.name} Agency Portal
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ISOLATED REGION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                <span className="font-mono">Country Code: <strong className="text-amber-300">{countryCode}</strong></span>
                <span>&bull;</span>
                <span>Currency: <strong className="text-slate-300">{countryMeta.currency}</strong></span>
                <span>&bull;</span>
                <span>Manager: <strong className="text-slate-200">{managerName || stateManager?.name || 'Country Head'}</strong></span>
                <span>&bull;</span>
                <span className="text-emerald-400 font-mono">Benchmark: 100,000 🪙 = ₹600 INR</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="text-slate-400">Country Manager Balance:</div>
              <div className="text-amber-300 font-bold font-mono text-base flex items-center gap-1">
                <span>{smCoins.toLocaleString()} 🪙</span>
              </div>
              <div className="text-emerald-400 font-mono text-[11px] font-semibold">
                Auto Calc: {smConversion.formattedDisplay}
              </div>
            </div>

            {/* Payout Request Button for State Manager */}
            <button
              onClick={() => openPayoutModal(
                managerName || stateManager?.name || `State Manager ${countryCode}`,
                'state_manager',
                stateManager?.id || `sm_${countryCode.toLowerCase()}_01`,
                smCoins
              )}
              className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <Coins className="w-4 h-4 text-slate-950" />
              <span>Request Payout</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row (Strict Coins - Dynamic Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase font-semibold">Active Business Developers</span>
            <Briefcase className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{bds.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">In {countryMeta.name} (Isolated)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase font-semibold">Registered Families / Agencies</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{families.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Under verified BDs</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase font-semibold">Total Verified Hosts</span>
            <Users className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">{hosts.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Earning coins live</p>
        </div>
      </div>

      {/* Main Tab Controller & Add Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('bds')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'bds'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              Business Developers ({bds.length})
            </button>
            <button
              onClick={() => setActiveTab('families')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'families'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              Agencies / Families ({families.length})
            </button>
            <button
              onClick={() => setActiveTab('hosts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'hosts'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              Live Hosts ({hosts.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={`Search in ${countryMeta.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 w-full sm:w-48"
              />
            </div>

            <button
              onClick={() => setShowAddModal(activeTab === 'bds' ? 'bd' : activeTab === 'families' ? 'family' : 'host')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add {activeTab === 'bds' ? 'BD' : activeTab === 'families' ? 'Family' : 'Host'}</span>
            </button>
          </div>

        </div>

        {/* Tab 1: Business Developers */}
        {activeTab === 'bds' && (
          <div className="space-y-3">
            {filteredBds.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-400">No Business Developers registered in {countryMeta.name}.</p>
                <p className="text-slate-500">Click &ldquo;Add BD&rdquo; above to onboard your first Business Developer.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredBds.map(bd => {
                  const bdConversion = calculateCoinToFiat(bd.wallet_coins, countryCode);

                  return (
                    <div key={bd.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 relative group">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-white text-sm">{bd.name}</div>
                          <div className="text-[11px] text-cyan-300 font-mono mt-0.5">{bd.assigned_region_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {bd.id}</div>
                        </div>
                        <button
                          onClick={() => handleDelete('bd', bd.id)}
                          className="text-slate-600 hover:text-rose-400 transition"
                          title="Delete BD"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                        <div>
                          <div className="text-slate-400 text-[10px]">BD Balance:</div>
                          <div className="text-amber-300 font-bold">{bd.wallet_coins.toLocaleString()} 🪙</div>
                          <div className="text-emerald-400 text-[10px]">{bdConversion.formattedDisplay}</div>
                        </div>
                        <button
                          onClick={() => openPayoutModal(bd.name, 'bd', bd.id, bd.wallet_coins)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded transition flex items-center gap-1 shadow-sm"
                        >
                          <span>Payout</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2 font-mono">
                        <span>Comm: <strong>{bd.commission_percentage}%</strong></span>
                        <span>Families: <strong>{families.filter(f => f.parent_id === bd.id).length}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Families / Agencies */}
        {activeTab === 'families' && (
          <div className="space-y-3">
            {filteredFamilies.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-400">No Agencies / Families registered in {countryMeta.name}.</p>
                <p className="text-slate-500">Click &ldquo;Add Family&rdquo; above to onboard an Agency under a BD.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredFamilies.map(fam => {
                  const famConversion = calculateCoinToFiat(fam.wallet_coins, countryCode);
                  const parentBd = bds.find(b => b.id === fam.parent_id);

                  return (
                    <div key={fam.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 relative group">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-white text-sm">{fam.name}</div>
                          <span className="font-mono text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                            {fam.agency_code}
                          </span>
                          <div className="text-[10px] text-slate-500 font-mono mt-1">Lead: {fam.leader_name}</div>
                        </div>
                        <button
                          onClick={() => handleDelete('family', fam.id)}
                          className="text-slate-600 hover:text-rose-400 transition"
                          title="Delete Agency"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                        <div>
                          <div className="text-slate-400 text-[10px]">Agency Balance:</div>
                          <div className="text-purple-300 font-bold">{fam.wallet_coins.toLocaleString()} 🪙</div>
                          <div className="text-emerald-400 text-[10px]">{famConversion.formattedDisplay}</div>
                        </div>
                        <button
                          onClick={() => openPayoutModal(fam.name, 'family', fam.id, fam.wallet_coins)}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded transition flex items-center gap-1 shadow-sm"
                        >
                          <span>Payout</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2 font-mono">
                        <span>BD: <strong>{parentBd?.name || 'BD Assigned'}</strong></span>
                        <span>Hosts: <strong>{hosts.filter(h => h.parent_id === fam.id).length}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Hosts */}
        {activeTab === 'hosts' && (
          <div className="space-y-3">
            {filteredHosts.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-400">No Live Hosts registered in {countryMeta.name}.</p>
                <p className="text-slate-500">Click &ldquo;Add Host&rdquo; above to onboard live streamers into an Agency.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="pb-2.5">Host Name</th>
                      <th className="pb-2.5">Agency</th>
                      <th className="pb-2.5">Category</th>
                      <th className="pb-2.5">Monthly Coins</th>
                      <th className="pb-2.5">Payout Value (100k = ₹600)</th>
                      <th className="pb-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredHosts.map(h => {
                      const hConversion = calculateCoinToFiat(h.wallet_balance_coins, countryCode);

                      return (
                        <tr key={h.id} className="hover:bg-slate-950/60 transition">
                          <td className="py-2.5">
                            <span className="font-bold text-white block">{h.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {h.id}</span>
                          </td>
                          <td className="py-2.5">
                            <span className="font-mono text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                              {h.agency_code}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-300">{h.category}</td>
                          <td className="py-2.5 font-bold text-amber-300 font-mono">
                            {h.wallet_balance_coins.toLocaleString()} 🪙
                          </td>
                          <td className="py-2.5 font-mono text-emerald-400 font-bold">
                            {hConversion.formattedDisplay}
                          </td>
                          <td className="py-2.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openPayoutModal(h.name, 'member', h.id, h.wallet_balance_coins)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[11px] shadow-sm transition"
                              >
                                Payout
                              </button>
                              <button
                                onClick={() => handleDelete('host', h.id)}
                                className="text-slate-600 hover:text-rose-400 transition"
                                title="Delete Host"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                Add {showAddModal === 'bd' ? 'Business Developer' : showAddModal === 'family' ? 'Family / Agency' : 'Live Host'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form
              onSubmit={
                showAddModal === 'bd' ? handleAddBD : showAddModal === 'family' ? handleAddFamily : handleAddHost
              }
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Name:</label>
                <input
                  type="text"
                  required
                  placeholder={showAddModal === 'bd' ? 'e.g. Asim Raza' : showAddModal === 'family' ? 'e.g. Royal Stars Agency' : 'e.g. Sarah Khan'}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Initial Coin Balance:</span>
                  </span>
                  <span className="text-amber-300 font-bold font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    0 🪙 (Strict Anti-Fraud Lock)
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Coins cannot be manually credited or edited. All balances must be generated through verified live broadcast commission splits (100k = ₹600 INR).
                </p>
              </div>

              {showAddModal === 'bd' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Region / City:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lahore / North Zone"
                    value={newSubField}
                    onChange={(e) => setNewSubField(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {showAddModal === 'family' && (
                <>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Reporting BD (Parent ID):</label>
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select Reporting BD...</option>
                      {bds.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.assigned_region_name})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Agency Code:</label>
                    <input
                      type="text"
                      required
                      placeholder={`e.g. ${countryCode}-TIGER-01`}
                      value={newSubField}
                      onChange={(e) => setNewSubField(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Agency Leader Name:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Captain Leader"
                      value={newLeader}
                      onChange={(e) => setNewLeader(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </>
              )}

              {showAddModal === 'host' && (
                <>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Parent Agency (Family ID):</label>
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select Agency...</option>
                      {families.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.agency_code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Stream Category:</label>
                    <select
                      value={newSubField}
                      onChange={(e) => setNewSubField(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Singing">Singing</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Dance">Dance</option>
                      <option value="Talkshow">Talkshow</option>
                      <option value="Talent">Talent</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                >
                  Save to System
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Request Modal */}
      <PayoutRequestModal
        isOpen={payoutModalData.isOpen}
        onClose={() => setPayoutModalData(prev => ({ ...prev, isOpen: false }))}
        requesterName={payoutModalData.name}
        requesterRole={payoutModalData.role}
        requesterUid={payoutModalData.uid}
        countryCode={countryCode}
        currentAvailableCoins={payoutModalData.coins}
      />

    </div>
  );
};
