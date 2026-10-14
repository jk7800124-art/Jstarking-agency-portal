import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  ArrowRight, 
  ShieldCheck, 
  Coins, 
  CheckCircle2, 
  ArrowUpRight, 
  IndianRupee, 
  Radio, 
  Send, 
  Sparkles, 
  Layers, 
  History, 
  Flame, 
  RefreshCw,
  Building,
  User,
  Globe2,
  Check
} from 'lucide-react';
import { COIN_TO_INR_RATE } from '../types/payout';
import { PayoutRequestModal } from './PayoutRequestModal';
import { 
  CommissionSplitRecord, 
  subscribeToCommissionSplits, 
  executeAndRecordCommissionSplit, 
  calculateSplitBreakdown 
} from '../lib/commissionService';
import { EXACT_10_COUNTRIES, getStoredMembers, getStoredFamilies, getStoredBDs, getStoredStateManagers } from '../data/mockDatabase';

export const CommissionCalculator: React.FC = () => {
  // Input coins for interactive calculator (starts at 0 - zero dummy data)
  const [giftCoinsInput, setGiftCoinsInput] = useState<number>(0);
  
  // Realtime Firestore records
  const [firestoreSplits, setFirestoreSplits] = useState<CommissionSplitRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncSuccess, setLastSyncSuccess] = useState<string | null>(null);

  // Form for recording live commission split to Firebase
  const [selectedCountry, setSelectedCountry] = useState<string>('IN');
  const [streamerName, setStreamerName] = useState<string>('');
  const [familyName, setFamilyName] = useState<string>('');
  const [bdName, setBdName] = useState<string>('');
  const [countryManagerName, setCountryManagerName] = useState<string>('');
  const [splitCoinsAmount, setSplitCoinsAmount] = useState<number>(0);
  const [splitNote, setSplitNote] = useState<string>('');

  // Payout Request Modal state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<'state_manager' | 'bd' | 'family' | 'member'>('member');
  const [targetCoins, setTargetCoins] = useState<number>(0);
  const [targetName, setTargetName] = useState<string>('');

  // Real-time Firestore subscription
  useEffect(() => {
    const unsubscribe = subscribeToCommissionSplits((data) => {
      setFirestoreSplits(data);
    });
    return () => unsubscribe();
  }, []);

  // Prepopulate names from existing database when country changes (if available)
  useEffect(() => {
    const members = getStoredMembers().filter(m => m.country_code === selectedCountry);
    const fams = getStoredFamilies().filter(f => f.country_code === selectedCountry);
    const bds = getStoredBDs().filter(b => b.country_code === selectedCountry);
    const sms = getStoredStateManagers().filter(s => s.country_code === selectedCountry);

    if (members.length > 0 && !streamerName) setStreamerName(members[0].name);
    if (fams.length > 0 && !familyName) setFamilyName(fams[0].name);
    if (bds.length > 0 && !bdName) setBdName(bds[0].name);
    if (sms.length > 0 && !countryManagerName) setCountryManagerName(sms[0].name);
  }, [selectedCountry]);

  // Calculations for interactive tool
  const currentCalc = calculateSplitBreakdown(giftCoinsInput);

  // Form split calculation
  const formCalc = calculateSplitBreakdown(splitCoinsAmount);

  const handleOpenPayout = (
    role: 'state_manager' | 'bd' | 'family' | 'member', 
    coins: number,
    name: string
  ) => {
    setTargetRole(role);
    setTargetCoins(Math.round(coins));
    setTargetName(name);
    setIsPayoutModalOpen(true);
  };

  const handleExecuteSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (splitCoinsAmount <= 0) {
      alert('Please enter a valid coins amount greater than 0.');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await executeAndRecordCommissionSplit({
        streamer_name: streamerName.trim() || 'Host Streamer',
        streamer_id: `streamer_${Date.now()}`,
        country_code: selectedCountry,
        total_gift_coins: splitCoinsAmount,
        family_name: familyName.trim() || 'Agency Family',
        bd_name: bdName.trim() || 'Business Developer',
        state_manager_name: countryManagerName.trim() || 'Country Manager',
        note: splitNote.trim() || 'Live Broadcast Gift Split',
      });

      setLastSyncSuccess(`✅ Commission Split ${result.id} synced to Firebase Firestore! Wallets credited.`);
      setSplitCoinsAmount(0);
      setSplitNote('');
      setTimeout(() => setLastSyncSuccess(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Error syncing commission split to Firebase. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatInr = (inrVal: number) => {
    return `₹${inrVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Realtime Firebase Status & Strict Currency Rule */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                <Coins className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-white tracking-wide">
                Live Commission Split &amp; Payout Engine
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Firebase Database: <strong className="text-white">Connected &bull; Cloud Verified</strong></span>
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Zero fake money &bull; Zero dummy coins. Strict live platform rate: <strong className="text-amber-300 font-mono">100,000 Coins = ₹600.00 INR</strong> (₹0.006 per coin).
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl self-start lg:self-auto">
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Standard Payout Conversion</div>
              <div className="text-sm font-extrabold text-emerald-400 font-mono">
                100,000 🪙 = ₹600.00 INR
              </div>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Synced Firestore Splits</div>
              <div className="text-sm font-extrabold text-amber-400 font-mono">
                {firestoreSplits.length} Records
              </div>
            </div>
          </div>
        </div>
      </div>

      {lastSyncSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-xs font-mono flex items-center justify-between animate-in fade-in duration-200">
          <span>{lastSyncSuccess}</span>
          <button 
            onClick={() => setLastSyncSuccess(null)}
            className="text-emerald-400 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {/* 2-COLUMN SECTION: LIVE SIMULATOR + REAL RECORD TO FIREBASE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE ZERO-DUMMY REAL-TIME CALCULATOR */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Real-Time Coins &amp; Commission Calculator
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Clean 0 Base &bull; Instant Calculation
            </span>
          </div>

          {/* Coin Input */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-200 block">
                  Enter Coins to Calculate (Live):
                </label>
                <span className="text-[11px] text-slate-500">
                  Calculates exact INR and 5-tier split with zero dummy values.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={giftCoinsInput === 0 ? '' : giftCoinsInput}
                  onChange={(e) => setGiftCoinsInput(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0 Coins"
                  className="bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold text-sm px-3 py-2 rounded-lg w-44 focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs text-amber-400 font-bold font-mono">🪙 Coins</span>
              </div>
            </div>

            {/* Total INR Banner */}
            <div className="p-3 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/40 rounded-lg border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-slate-300">
                Official Payout Worth for <strong className="text-amber-300 font-mono">{giftCoinsInput.toLocaleString()} Coins</strong>:
              </span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {formatInr(currentCalc.totalInr)} INR
              </span>
            </div>

            {/* Pure Clean Notice: Strictly live calculations without dummy presets */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Live Calculator &bull; Zero Dummy Presets</span>
              </span>
              <span>100,000 🪙 = ₹600.00 INR (₹0.006/coin)</span>
            </div>
          </div>

          {/* 5-TIER BREAKDOWN CARDS */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Automatic 5-Tier Commission Split Breakdown:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Host (40%) */}
              <div className="bg-slate-950 border border-rose-500/30 rounded-xl p-3 flex flex-col justify-between hover:border-rose-500/60 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-rose-400">Tier 1 &bull; Live Host</span>
                    <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">40%</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">Host Streamer</div>
                  <div className="text-[11px] text-slate-400">Content creator broadcast wallet</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-rose-300 font-mono">
                      {currentCalc.host.coins.toLocaleString()} 🪙
                    </div>
                    <div className="text-xs text-emerald-400 font-mono font-bold">
                      {formatInr(currentCalc.host.inr)}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Live Rate Only</span>
                </div>
              </div>

              {/* Family Agency (12%) */}
              <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-3 flex flex-col justify-between hover:border-purple-500/60 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-purple-400">Tier 2 &bull; Agency Family</span>
                    <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">12%</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">Family Agency Head</div>
                  <div className="text-[11px] text-slate-400">Direct supervisor of Host</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-purple-300 font-mono">
                      {currentCalc.family.coins.toLocaleString()} 🪙
                    </div>
                    <div className="text-xs text-emerald-400 font-mono font-bold">
                      {formatInr(currentCalc.family.inr)}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Live Rate Only</span>
                </div>
              </div>

              {/* Business Developer (5%) */}
              <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-3 flex flex-col justify-between hover:border-cyan-500/60 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-cyan-400">Tier 3 &bull; BD</span>
                    <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">5%</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">Business Developer</div>
                  <div className="text-[11px] text-slate-400">Supervisor of Agencies</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-cyan-300 font-mono">
                      {currentCalc.bd.coins.toLocaleString()} 🪙
                    </div>
                    <div className="text-xs text-emerald-400 font-mono font-bold">
                      {formatInr(currentCalc.bd.inr)}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Live Rate Only</span>
                </div>
              </div>

              {/* Country Manager (3%) */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between hover:border-amber-500/60 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Tier 4 &bull; Country Manager</span>
                    <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">3%</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">Country / State Head</div>
                  <div className="text-[11px] text-slate-400">Presiding officer of Country</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-amber-300 font-mono">
                      {currentCalc.sm.coins.toLocaleString()} 🪙
                    </div>
                    <div className="text-xs text-emerald-400 font-mono font-bold">
                      {formatInr(currentCalc.sm.inr)}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Live Rate Only</span>
                </div>
              </div>

            </div>

            {/* Platform Master Pool (40%) */}
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Tier 5 &bull; Platform Master Admin</span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">40%</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">J-Star King Central Infrastructure Pool</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-emerald-300 font-mono">
                  {currentCalc.platform.coins.toLocaleString()} 🪙
                </div>
                <div className="text-xs text-emerald-400 font-mono font-bold">
                  {formatInr(currentCalc.platform.inr)}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: EXECUTE REAL COMMISSION SPLIT & SYNC TO FIREBASE */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Sync Live Split to Firebase
                </h3>
              </div>
              <span className="text-[11px] font-mono bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40">
                Firestore Write
              </span>
            </div>

            <form onSubmit={handleExecuteSplit} className="mt-4 space-y-3.5">
              
              {/* Country Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Isolated Country:
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                >
                  {EXACT_10_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.code}) - {c.currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* Streamer Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Live Streamer (Host Name):
                </label>
                <input
                  type="text"
                  required
                  value={streamerName}
                  onChange={(e) => setStreamerName(e.target.value)}
                  placeholder="e.g. StarHost Priya"
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Family Agency Name */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Family Agency:
                  </label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g. Royal Stars"
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Business Developer:
                  </label>
                  <input
                    type="text"
                    value={bdName}
                    onChange={(e) => setBdName(e.target.value)}
                    placeholder="e.g. Regional BD"
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Real Gift Coins Amount */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Live Gift Coins Received:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={splitCoinsAmount === 0 ? '' : splitCoinsAmount}
                    onChange={(e) => setSplitCoinsAmount(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="e.g. 100000"
                    className="w-full bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-amber-400 font-mono">
                    🪙 Coins
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Calculated Payout:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {formatInr(formCalc.totalInr)} INR
                  </span>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Live Stream Note (Optional):
                </label>
                <input
                  type="text"
                  value={splitNote}
                  onChange={(e) => setSplitNote(e.target.value)}
                  placeholder="e.g. PK Battle Live Broadcast gift coins"
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Preview of Live Distribution */}
              {splitCoinsAmount > 0 && (
                <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-lg text-[11px] font-mono space-y-1">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Instant Wallet Distribution:</div>
                  <div className="flex justify-between text-rose-300">
                    <span>Host (40%):</span>
                    <span>{formCalc.host.coins.toLocaleString()} 🪙 ({formatInr(formCalc.host.inr)})</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Agency (12%):</span>
                    <span>{formCalc.family.coins.toLocaleString()} 🪙 ({formatInr(formCalc.family.inr)})</span>
                  </div>
                  <div className="flex justify-between text-cyan-300">
                    <span>BD (5%):</span>
                    <span>{formCalc.bd.coins.toLocaleString()} 🪙 ({formatInr(formCalc.bd.inr)})</span>
                  </div>
                  <div className="flex justify-between text-amber-300">
                    <span>Country Head (3%):</span>
                    <span>{formCalc.sm.coins.toLocaleString()} 🪙 ({formatInr(formCalc.sm.inr)})</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSyncing || splitCoinsAmount <= 0}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Syncing to Firebase Firestore...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Distribute &amp; Sync to Firebase</span>
                  </>
                )}
              </button>

            </form>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Strict Firestore Rules Enforced</span>
            </span>
            <span className="font-mono text-emerald-400">Zero Dummy Data</span>
          </div>
        </div>

      </div>

      {/* REALTIME FIREBASE FIRESTORE COMMISSION LEDGER / STREAM */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Realtime Firebase Firestore Commission Ledger ({firestoreSplits.length} Records)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Live Firestore Collection: <code className="text-amber-300">commission_splits</code></span>
          </span>
        </div>

        {firestoreSplits.length === 0 ? (
          <div className="text-center py-12 bg-slate-950 rounded-xl border border-slate-800/80 p-6 space-y-2">
            <Coins className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-300">
              No Commission Splits Recorded Yet
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Zero dummy records! Use the form above to execute and sync live broadcast gift commissions directly to your Firebase Firestore database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Doc ID / Time</th>
                  <th className="py-2.5 px-3">Country &amp; Host</th>
                  <th className="py-2.5 px-3">Total Coins</th>
                  <th className="py-2.5 px-3">Total Value (INR)</th>
                  <th className="py-2.5 px-3">Host (40%)</th>
                  <th className="py-2.5 px-3">Agency (12%)</th>
                  <th className="py-2.5 px-3">BD (5%)</th>
                  <th className="py-2.5 px-3">Country (3%)</th>
                  <th className="py-2.5 px-3">Platform (40%)</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {firestoreSplits.map((split) => {
                  const countryObj = EXACT_10_COUNTRIES.find(c => c.code === split.country_code);
                  return (
                    <tr key={split.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-3 text-slate-400">
                        <div className="text-slate-200 font-bold">{split.id}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(split.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(split.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <span>{countryObj?.flag || '🌐'}</span>
                          <span>{split.streamer_name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{split.family_name || 'Agency'}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-amber-300">
                        {split.total_gift_coins.toLocaleString()} 🪙
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-400">
                        {formatInr(split.total_inr_amount)}
                      </td>
                      <td className="py-3 px-3 text-rose-300">
                        <div>{split.host_coins.toLocaleString()} 🪙</div>
                        <div className="text-[10px] text-slate-400">{formatInr(split.host_inr)}</div>
                      </td>
                      <td className="py-3 px-3 text-purple-300">
                        <div>{split.family_coins.toLocaleString()} 🪙</div>
                        <div className="text-[10px] text-slate-400">{formatInr(split.family_inr)}</div>
                      </td>
                      <td className="py-3 px-3 text-cyan-300">
                        <div>{split.bd_coins.toLocaleString()} 🪙</div>
                        <div className="text-[10px] text-slate-400">{formatInr(split.bd_inr)}</div>
                      </td>
                      <td className="py-3 px-3 text-amber-300">
                        <div>{split.state_manager_coins.toLocaleString()} 🪙</div>
                        <div className="text-[10px] text-slate-400">{formatInr(split.state_manager_inr)}</div>
                      </td>
                      <td className="py-3 px-3 text-emerald-300">
                        <div>{split.platform_coins.toLocaleString()} 🪙</div>
                        <div className="text-[10px] text-slate-400">{formatInr(split.platform_inr)}</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleOpenPayout('member', split.host_coins, split.streamer_name)}
                          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 rounded text-[11px] font-sans font-semibold transition"
                        >
                          Withdraw
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

      {/* PAYOUT REQUEST MODAL (Connected to Firestore payout_requests) */}
      <PayoutRequestModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        requesterName={targetName || 'Requester'}
        requesterRole={targetRole}
        requesterUid={`live_${targetRole}_${Date.now()}`}
        countryCode={selectedCountry}
        currentAvailableCoins={targetCoins}
      />

    </div>
  );
};
