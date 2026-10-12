export type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export type PaymentMethodType = 
  | 'bank_transfer' 
  | 'upi' 
  | 'easypaisa_jazzcash' 
  | 'bkash_nagad' 
  | 'stc_pay' 
  | 'usdt_trc20';

export interface PayoutRequest {
  id: string;
  requester_uid: string;
  requester_name: string;
  requester_role: 'state_manager' | 'bd' | 'family' | 'member';
  country_code: string;
  coins_requested: number;
  inr_amount: number; // Based on 100,000 coins = 600 INR (0.006 per coin)
  local_currency_amount: number;
  local_currency_symbol: string;
  payment_method: PaymentMethodType;
  payment_details: {
    account_holder_name?: string;
    account_number?: string;
    bank_name?: string;
    ifsc_or_swift?: string;
    upi_id?: string;
    wallet_phone?: string;
    usdt_address?: string;
  };
  notes?: string;
  status: PayoutStatus;
  rejection_reason?: string;
  transaction_ref?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
}

/**
 * 100,000 Coins = 600 INR
 * 1 Coin = 0.006 INR
 */
export const COIN_TO_INR_RATE = 600 / 100000; // 0.006

export interface CurrencyConversion {
  inr: number;
  localAmount: number;
  localCurrency: string;
  localSymbol: string;
  formattedDisplay: string;
}

export function calculateCoinToFiat(coins: number, countryCode: string = 'IN'): CurrencyConversion {
  const safeCoins = Math.max(0, Number(coins) || 0);
  const inr = safeCoins * COIN_TO_INR_RATE;

  // Local currency multi-country multiplier benchmark based on 600 INR
  let localAmount = inr;
  let localCurrency = 'INR';
  let localSymbol = '₹';

  switch (countryCode.toUpperCase()) {
    case 'IN':
      localAmount = inr;
      localCurrency = 'INR';
      localSymbol = '₹';
      break;
    case 'PK': // 1 INR ~ 3.3 PKR => 600 INR = ~1,980 PKR
      localAmount = (safeCoins / 100000) * 1980;
      localCurrency = 'PKR';
      localSymbol = 'Rs';
      break;
    case 'BD': // 1 INR ~ 1.45 BDT => 600 INR = ~870 BDT
      localAmount = (safeCoins / 100000) * 870;
      localCurrency = 'BDT';
      localSymbol = '৳';
      break;
    case 'NP': // 1 INR = 1.6 NPR => 600 INR = 960 NPR
      localAmount = (safeCoins / 100000) * 960;
      localCurrency = 'NPR';
      localSymbol = 'रू';
      break;
    case 'SA': // 600 INR ~ 27 SAR
      localAmount = (safeCoins / 100000) * 27;
      localCurrency = 'SAR';
      localSymbol = 'SAR';
      break;
    case 'AE': // 600 INR ~ 26.4 AED
      localAmount = (safeCoins / 100000) * 26.4;
      localCurrency = 'AED';
      localSymbol = 'AED';
      break;
    case 'ID': // 600 INR ~ 112,000 IDR
      localAmount = (safeCoins / 100000) * 112000;
      localCurrency = 'IDR';
      localSymbol = 'Rp';
      break;
    case 'PH': // 600 INR ~ 410 PHP
      localAmount = (safeCoins / 100000) * 410;
      localCurrency = 'PHP';
      localSymbol = '₱';
      break;
    case 'EG': // 600 INR ~ 350 EGP
      localAmount = (safeCoins / 100000) * 350;
      localCurrency = 'EGP';
      localSymbol = 'E£';
      break;
    case 'QA': // 600 INR ~ 26.2 QAR
      localAmount = (safeCoins / 100000) * 26.2;
      localCurrency = 'QAR';
      localSymbol = 'QAR';
      break;
    default:
      localAmount = (safeCoins / 100000) * 7.15; // USD
      localCurrency = 'USD';
      localSymbol = '$';
  }

  const inrFormatted = `₹${inr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const localFormatted = `${localSymbol} ${localAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return {
    inr: Number(inr.toFixed(2)),
    localAmount: Number(localAmount.toFixed(2)),
    localCurrency,
    localSymbol,
    formattedDisplay: countryCode === 'IN' ? inrFormatted : `${inrFormatted} (${localFormatted})`,
  };
}
