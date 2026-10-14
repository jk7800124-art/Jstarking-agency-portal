import React, { useState, useEffect } from 'react';
import { PayoutRequest, PayoutStatus, COIN_TO_INR_RATE } from '../types/payout';
import { subscribeToAllPayoutRequests, updatePayoutStatusInFirestore } from '../lib/payoutService';
import { 
  Coins, 
  IndianRupee, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  ArrowUpRight,
  AlertCircle,
  Smartphone,
  Building,
  CreditCard,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { EXACT_10_COUNTRIES } from '../data/mockDatabase';

export const AdminPayoutsPanel: React.FC = () => {
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | PayoutStatus>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Action modal
  const [selectedReq, setSelectedReq] = useState<PayoutRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [txnRef, setTxnRef] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAllPayoutRequests((data) => {
      setRequests(data);
    });
    return () => unsubscribe();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !actionType) return;

    setIsProcessing(true);
    try {
      if (actionType === 'approve') {
        await updatePayoutStatusInFirestore(selectedReq.id, 'approved', txnRef.trim());
      } else {
        await updatePayoutStatusInFirestore(selectedReq.id, 'rejected', undefined, rejectionReason.trim());
      }
      setIsProcessing(false);
      setSelectedReq(null);
      setActionType(null);
      setTxnRef('');
      setRejectionReason('');
    } catch (err) {
      setIsProcessing(false);
      alert('Failed to update payout request. Please try again.');
    }
  };

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (countryFilter !== 'all' && r.country_code !== countryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.requester_name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        (r.payment_details.upi_id || '').toLowerCase().includes(q) ||
        (r.payment_details.account_number || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Aggregation metrics
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const totalPendingCoins = pendingRequests.reduce((sum, r) => sum + r.coins_requested, 0);
  const totalPendingINR = pendingRequests.reduce((sum, r) => sum + r.inr_amount, 0);
  const totalSettledINR = requests.filter(r => r.status === 'approved' || r.status === 'paid').reduce((sum, r) => sum + r.inr_amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-purple-950/80 border border-amber-500/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-extrabold text-white">
              Firebase Central Web Admin &bull; Payout Requests Hub
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE CLOUD SECURED</span>
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Connected to official live Firebase cloud database. Realtime Firestore &amp; RTDB sync enabled. Payout requests across all 10 countries stream live to this panel. Rate benchmark: <strong className="text-amber-300">100,000 Coins = ₹600 INR</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="text-slate-400">Rate Benchmark:</div>
            <div className="text-amber-300 font-bold font-mono text-sm">100,000 🪙 = ₹600 INR</div>
            <div className="text-[10px] text-slate-500 font-mono">1 Coin = ₹0.006</div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase font-semibold">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{pendingRequests.length}</div>
          <p className="text-[11px] text-amber-400 mt-0.5 font-mono">Awaiting verification</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase font-semibold">Coins In Queue</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{totalPendingCoins.toLocaleString()} 🪙</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Across all 10 regions</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase font-semibold">Pending Payout (INR)</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">₹{totalPendingINR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Rate: 100k = ₹600</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase font-semibold">Total Settled (INR)</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300">₹{totalSettledINR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Approved &amp; paid</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Status pills */}
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-md capitalize font-semibold transition ${
                    statusFilter === status
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Country filter */}
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="all">All 10 Countries</option>
              {EXACT_10_COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search requester, UPI ID, account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 w-full sm:w-64"
            />
          </div>

        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Payout Queue ({filteredRequests.length} requests)</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Collection: <code className="text-amber-400">payout_requests</code>
          </span>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-400">No payout requests in this view.</p>
            <p className="text-slate-500">
              When a Country Manager, BD, Family, or Host requests a payout, it automatically appears here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-950/40">
                  <th className="p-3">Requester / Role</th>
                  <th className="p-3">Country</th>
                  <th className="p-3">Coins</th>
                  <th className="p-3">Payout Value (100k = ₹600)</th>
                  <th className="p-3">Payment Details</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRequests.map(req => {
                  const country = EXACT_10_COUNTRIES.find(c => c.code === req.country_code);

                  return (
                    <tr key={req.id} className="hover:bg-slate-850/60 transition">
                      
                      {/* Requester */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{req.requester_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span className="uppercase text-amber-400 font-bold bg-amber-500/10 px-1 rounded">
                            {req.requester_role}
                          </span>
                          <span>&bull;</span>
                          <span>ID: {req.id}</span>
                        </div>
                      </td>

                      {/* Country */}
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          <span>{country?.flag || '🌐'}</span>
                          <span>{req.country_code}</span>
                        </span>
                      </td>

                      {/* Coins */}
                      <td className="p-3 font-mono">
                        <div className="font-extrabold text-amber-300 text-sm">
                          {req.coins_requested.toLocaleString()} 🪙
                        </div>
                      </td>

                      {/* Currency Payout */}
                      <td className="p-3">
                        <div className="font-extrabold text-emerald-400 font-mono text-sm">
                          ₹{req.inr_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR
                        </div>
                        {req.country_code !== 'IN' && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {req.local_currency_symbol} {req.local_currency_amount.toLocaleString()} {country?.currency}
                          </div>
                        )}
                      </td>

                      {/* Payment Details */}
                      <td className="p-3 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {req.payment_method === 'upi' && (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Smartphone className="w-3 h-3" /> UPI: {req.payment_details.upi_id}
                            </span>
                          )}
                          {req.payment_method === 'bank_transfer' && (
                            <span className="text-cyan-400 font-semibold flex items-center gap-1">
                              <Building className="w-3 h-3" /> A/C: {req.payment_details.account_number} ({req.payment_details.ifsc_or_swift})
                            </span>
                          )}
                          {(req.payment_method === 'easypaisa_jazzcash' || req.payment_method === 'bkash_nagad') && (
                            <span className="text-amber-400 font-semibold flex items-center gap-1">
                              <Smartphone className="w-3 h-3" /> {req.payment_details.wallet_phone}
                            </span>
                          )}
                          {req.payment_method === 'usdt_trc20' && (
                            <span className="text-purple-400 font-mono flex items-center gap-1 truncate max-w-[140px]">
                              <CreditCard className="w-3 h-3" /> {req.payment_details.usdt_address}
                            </span>
                          )}
                        </div>

                        {req.payment_details.account_holder_name && (
                          <div className="text-slate-400 text-[10px] mt-0.5">
                            Name: {req.payment_details.account_holder_name}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          req.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : req.status === 'approved' || req.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {req.status}
                        </span>
                        {req.transaction_ref && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Ref: {req.transaction_ref}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedReq(req);
                                setActionType('approve');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[11px] shadow-sm transition"
                            >
                              Approve &amp; Pay
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReq(req);
                                setActionType('reject');
                              }}
                              className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 rounded font-medium text-[11px] transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Settled
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Approve / Reject Modal */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                {actionType === 'approve' ? 'Approve & Settle Payout' : 'Reject Payout Request'}
              </h3>
              <button 
                onClick={() => { setSelectedReq(null); setActionType(null); }}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Requester:</span>
                <span className="font-bold text-white">{selectedReq.requester_name} ({selectedReq.country_code})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coins:</span>
                <span className="font-bold text-amber-300 font-mono">{selectedReq.coins_requested.toLocaleString()} 🪙</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount (INR):</span>
                <span className="font-bold text-emerald-400 font-mono">₹{selectedReq.inr_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <form onSubmit={handleExecuteAction} className="space-y-3 text-xs">
              {actionType === 'approve' ? (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Bank / UPI Transaction Reference (UTR / Transaction ID):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UTR-982189201992"
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Reason for Rejection:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Incorrect UPI ID or account verification failed"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setSelectedReq(null); setActionType(null); }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`px-5 py-2 text-white font-bold rounded-lg ${
                    actionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {isProcessing ? 'Processing...' : actionType === 'approve' ? 'Confirm Payment & Deduct Coins' : 'Confirm Rejection'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
