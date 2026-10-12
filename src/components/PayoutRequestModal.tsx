import React, { useState, useEffect } from 'react';
import { 
  X, 
  Coins, 
  IndianRupee, 
  Send, 
  Building, 
  Smartphone, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { calculateCoinToFiat, PaymentMethodType } from '../types/payout';
import { submitPayoutRequest } from '../lib/payoutService';

interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requesterName: string;
  requesterRole: 'state_manager' | 'bd' | 'family' | 'member';
  requesterUid: string;
  countryCode: string;
  currentAvailableCoins?: number;
  onSuccess?: () => void;
}

export const PayoutRequestModal: React.FC<PayoutRequestModalProps> = ({
  isOpen,
  onClose,
  requesterName,
  requesterRole,
  requesterUid,
  countryCode,
  currentAvailableCoins,
  onSuccess
}) => {
  const [coinsInput, setCoinsInput] = useState<number>(currentAvailableCoins && currentAvailableCoins > 0 ? currentAvailableCoins : 0);
  
  useEffect(() => {
    if (isOpen) {
      setCoinsInput(currentAvailableCoins && currentAvailableCoins > 0 ? currentAvailableCoins : 0);
      setAccountHolderName(requesterName);
    }
  }, [isOpen, currentAvailableCoins, requesterName]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    countryCode === 'IN' ? 'upi' : countryCode === 'PK' ? 'easypaisa_jazzcash' : countryCode === 'BD' ? 'bkash_nagad' : 'bank_transfer'
  );
  
  // Payment Details
  const [accountHolderName, setAccountHolderName] = useState(requesterName);
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscOrSwift, setIfscOrSwift] = useState('');
  const [upiId, setUpiId] = useState('');
  const [walletPhone, setWalletPhone] = useState('');
  const [usdtAddress, setUsdtAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const conversion = calculateCoinToFiat(coinsInput, countryCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (coinsInput <= 0) {
      setErrorMsg('No available coins in wallet to withdraw. Coins must be earned first.');
      return;
    }

    if (currentAvailableCoins !== undefined && coinsInput > currentAvailableCoins) {
      setErrorMsg('Security Violation: Requested coins exceed available wallet balance.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitPayoutRequest({
        requester_uid: requesterUid,
        requester_name: requesterName,
        requester_role: requesterRole,
        country_code: countryCode,
        coins_requested: Number(coinsInput),
        payment_method: paymentMethod,
        payment_details: {
          account_holder_name: accountHolderName,
          account_number: accountNumber,
          bank_name: bankName,
          ifsc_or_swift: ifscOrSwift,
          upi_id: upiId,
          wallet_phone: walletPhone,
          usdt_address: usdtAddress,
        },
        notes: notes.trim(),
      });

      setIsSubmitting(false);
      setSuccessMessage(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        setSuccessMessage(false);
        onClose();
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Failed to submit payout. Please check connection.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Request Coin Payout</h2>
              <p className="text-xs text-slate-400">
                Rate: <strong className="text-amber-300">100,000 Coins = ₹600 INR</strong> benchmark
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Payout Request Submitted!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your request for <strong className="text-amber-300">{coinsInput.toLocaleString()} Coins</strong> ({conversion.formattedDisplay}) has been sent directly to the Firebase Web Admin Panel.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
            
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Coin Amount & Live Automatic Conversion Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Exact Verified Coins to Withdraw:</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  Wallet Balance: <strong className="text-amber-300 font-bold">{(currentAvailableCoins || 0).toLocaleString()} 🪙</strong>
                </span>
              </div>

              {/* Exact Locked Coin Field (Anti-Tamper: No Manual Edit Allowed) */}
              <div className="relative">
                <input
                  type="number"
                  value={coinsInput}
                  readOnly
                  disabled
                  className="w-full bg-slate-900/90 border border-amber-500/50 rounded-lg px-3 py-2.5 text-amber-300 font-mono font-extrabold text-base cursor-not-allowed select-none"
                  placeholder="0"
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[11px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <span>🔒 EXACT COIN LOCKED</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Security Rule:</strong> Manual editing of coins is completely disabled. Only the exact verified coins accumulated in the family/host wallet are processed to prevent fraudulent claims.
                </span>
              </div>


              {/* AUTOMATIC REAL-TIME FIAT CONVERSION (100k = ₹600) */}
              <div className="p-3 bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Automatic INR Payout (100k = ₹600):</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    ₹{conversion.inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR
                  </span>
                </div>
                {countryCode !== 'IN' && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Local Currency Value ({countryCode}):</span>
                    <span className="text-white font-semibold font-mono">
                      {conversion.localSymbol} {conversion.localAmount.toLocaleString()} {conversion.localCurrency}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Select Payout Method:</label>
              <div className="grid grid-cols-2 gap-2">
                
                {countryCode === 'IN' && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition ${
                      paymentMethod === 'upi'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>UPI ID (Instant)</span>
                  </button>
                )}

                {countryCode === 'PK' && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('easypaisa_jazzcash')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition ${
                      paymentMethod === 'easypaisa_jazzcash'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>EasyPaisa / JazzCash</span>
                  </button>
                )}

                {countryCode === 'BD' && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash_nagad')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition ${
                      paymentMethod === 'bkash_nagad'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-rose-400" />
                    <span>bKash / Nagad</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition ${
                    paymentMethod === 'bank_transfer'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building className="w-4 h-4 text-cyan-400" />
                  <span>Bank Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('usdt_trc20')}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition ${
                    paymentMethod === 'usdt_trc20'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>USDT (TRC-20)</span>
                </button>
              </div>
            </div>

            {/* Payment Fields Based on Selected Method */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              
              {paymentMethod === 'upi' && (
                <div>
                  <label className="text-slate-400 block mb-1">UPI ID (VPA):</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. mobile@paytm or user@okaxis"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Account Holder Full Name:</label>
                    <input
                      type="text"
                      required
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Account Number / IBAN:</label>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">IFSC / SWIFT / Bank Code:</label>
                      <input
                        type="text"
                        required
                        value={ifscOrSwift}
                        onChange={(e) => setIfscOrSwift(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Bank Name:</label>
                    <input
                      type="text"
                      placeholder="e.g. State Bank of India / HBL / Al Rajhi"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </>
              )}

              {(paymentMethod === 'easypaisa_jazzcash' || paymentMethod === 'bkash_nagad') && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Registered Mobile Wallet Number:</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 03001234567 or 01712345678"
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Account Title / Name:</label>
                    <input
                      type="text"
                      required
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </>
              )}

              {paymentMethod === 'usdt_trc20' && (
                <div>
                  <label className="text-slate-400 block mb-1">USDT TRC-20 Receiving Address:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. T..."
                    value={usdtAddress}
                    onChange={(e) => setUsdtAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1">Optional Notes / Remarks:</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly streaming agency settlement"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

            </div>

            {/* Footer buttons */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Directly sent to Firebase Web Admin Panel
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || coinsInput <= 0}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : coinsInput <= 0 ? 'No Coins to Withdraw' : 'Send Exact Payout Request'}</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
