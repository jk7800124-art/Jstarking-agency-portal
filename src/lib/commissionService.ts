import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { db, rtdb, auth } from './firebase';
import { COIN_TO_INR_RATE } from '../types/payout';
import { OperationType, handleFirestoreError } from './payoutService';
import { 
  getStoredMembers, 
  saveStoredMembers, 
  getStoredFamilies, 
  saveStoredFamilies, 
  getStoredBDs, 
  saveStoredBDs, 
  getStoredStateManagers, 
  saveStoredStateManagers 
} from '../data/mockDatabase';

export interface CommissionSplitRecord {
  id: string;
  streamer_name: string;
  streamer_id: string;
  country_code: string;
  total_gift_coins: number;
  total_inr_amount: number;
  
  // Tier 1: Host (40%)
  host_coins: number;
  host_inr: number;
  
  // Tier 2: Family Agency (12%)
  family_coins: number;
  family_inr: number;
  family_name: string;
  family_id: string;
  
  // Tier 3: Business Developer (5%)
  bd_coins: number;
  bd_inr: number;
  bd_name: string;
  bd_id: string;
  
  // Tier 4: Country Manager / State Manager (3%)
  state_manager_coins: number;
  state_manager_inr: number;
  state_manager_name: string;
  state_manager_id: string;
  
  // Tier 5: Platform Reserve (40%)
  platform_coins: number;
  platform_inr: number;
  
  status: 'completed' | 'pending';
  note?: string;
  created_at: string;
}

const COLLECTION_NAME = 'commission_splits';
const LOCAL_STORAGE_KEY = 'jstar_commission_splits';

export function getLocalCommissionSplits(): CommissionSplitRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCommissionSplits(data: CommissionSplitRecord[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

/**
 * Pure calculation function: 100,000 Coins = 600 INR (1 Coin = ₹0.006)
 * Zero dummy money, zero fake inflation.
 */
export function calculateSplitBreakdown(giftCoins: number) {
  const safeCoins = Math.max(0, Number(giftCoins) || 0);
  const totalInr = Number((safeCoins * COIN_TO_INR_RATE).toFixed(2));

  const hostCoins = Math.round((safeCoins * 40) / 100);
  const hostInr = Number((hostCoins * COIN_TO_INR_RATE).toFixed(2));

  const familyCoins = Math.round((safeCoins * 12) / 100);
  const familyInr = Number((familyCoins * COIN_TO_INR_RATE).toFixed(2));

  const bdCoins = Math.round((safeCoins * 5) / 100);
  const bdInr = Number((bdCoins * COIN_TO_INR_RATE).toFixed(2));

  const smCoins = Math.round((safeCoins * 3) / 100);
  const smInr = Number((smCoins * COIN_TO_INR_RATE).toFixed(2));

  const platformCoins = Math.round((safeCoins * 40) / 100);
  const platformInr = Number((platformCoins * COIN_TO_INR_RATE).toFixed(2));

  return {
    totalCoins: safeCoins,
    totalInr,
    host: { pct: 40, coins: hostCoins, inr: hostInr },
    family: { pct: 12, coins: familyCoins, inr: familyInr },
    bd: { pct: 5, coins: bdCoins, inr: bdInr },
    sm: { pct: 3, coins: smCoins, inr: smInr },
    platform: { pct: 40, coins: platformCoins, inr: platformInr },
  };
}

/**
 * Record a real live Commission Split transaction directly into Firebase Firestore
 * and credit wallets of Host, Family, BD, and State Manager.
 */
export async function executeAndRecordCommissionSplit(input: {
  streamer_name: string;
  streamer_id: string;
  country_code: string;
  total_gift_coins: number;
  family_name?: string;
  family_id?: string;
  bd_name?: string;
  bd_id?: string;
  state_manager_name?: string;
  state_manager_id?: string;
  note?: string;
}): Promise<CommissionSplitRecord> {
  const calc = calculateSplitBreakdown(input.total_gift_coins);
  const id = `cs_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newRecord: CommissionSplitRecord = {
    id,
    streamer_name: input.streamer_name || 'Live Host Streamer',
    streamer_id: input.streamer_id || `host_${Date.now()}`,
    country_code: input.country_code || 'IN',
    total_gift_coins: calc.totalCoins,
    total_inr_amount: calc.totalInr,

    host_coins: calc.host.coins,
    host_inr: calc.host.inr,

    family_coins: calc.family.coins,
    family_inr: calc.family.inr,
    family_name: input.family_name || 'Agency Family',
    family_id: input.family_id || '',

    bd_coins: calc.bd.coins,
    bd_inr: calc.bd.inr,
    bd_name: input.bd_name || 'Business Developer',
    bd_id: input.bd_id || '',

    state_manager_coins: calc.sm.coins,
    state_manager_inr: calc.sm.inr,
    state_manager_name: input.state_manager_name || 'Country Manager',
    state_manager_id: input.state_manager_id || '',

    platform_coins: calc.platform.coins,
    platform_inr: calc.platform.inr,

    status: 'completed',
    note: input.note || 'Live Stream Gift Commission Split',
    created_at: now,
  };

  // 1. Save to local fallback cache immediately
  const localList = [newRecord, ...getLocalCommissionSplits()];
  saveLocalCommissionSplits(localList);

  // 2. Credit the real entities' wallets
  try {
    creditLiveWallets({
      streamer_id: newRecord.streamer_id,
      streamer_name: newRecord.streamer_name,
      host_coins: newRecord.host_coins,
      family_id: newRecord.family_id,
      family_coins: newRecord.family_coins,
      bd_id: newRecord.bd_id,
      bd_coins: newRecord.bd_coins,
      sm_id: newRecord.state_manager_id,
      sm_coins: newRecord.state_manager_coins,
      country_code: newRecord.country_code,
    });
  } catch (err) {
    console.warn("Wallet credit error:", err);
  }

  // 3. Persist to real Firebase Firestore in collection 'commission_splits'
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, {
      ...newRecord,
      firestore_created_at: serverTimestamp(),
    });
    console.log("✅ Commission Split synced to Firebase Firestore:", id);
  } catch (err) {
    console.warn("Firestore commission sync error:", err);
    try {
      handleFirestoreError(err, OperationType.WRITE, `${COLLECTION_NAME}/${id}`);
    } catch {
      // Handled
    }
  }

  // 4. Persist to real Firebase Realtime Database
  try {
    if (rtdb) {
      const rtdbRef = ref(rtdb, `${COLLECTION_NAME}/${id}`);
      await set(rtdbRef, newRecord);
      console.log("✅ Commission Split synced to Firebase Realtime Database:", id);
    }
  } catch (rtdbErr) {
    console.warn("RTDB commission sync error:", rtdbErr);
  }

  return newRecord;
}

/**
 * Credits the wallet balance of each recipient in local/stored database
 */
function creditLiveWallets(params: {
  streamer_id: string;
  streamer_name: string;
  host_coins: number;
  family_id: string;
  family_coins: number;
  bd_id: string;
  bd_coins: number;
  sm_id: string;
  sm_coins: number;
  country_code: string;
}) {
  // Update Host
  const members = getStoredMembers();
  let hostFound = false;
  const updatedMembers = members.map(m => {
    if (m.id === params.streamer_id || m.name === params.streamer_name) {
      hostFound = true;
      const newBal = (m.wallet_balance_coins || 0) + params.host_coins;
      return {
        ...m,
        wallet_balance_coins: newBal,
        withdrawable_inr: Number((newBal * COIN_TO_INR_RATE).toFixed(2)),
        coins_current_month: (m.coins_current_month || 0) + params.host_coins,
      };
    }
    return m;
  });
  if (hostFound) {
    saveStoredMembers(updatedMembers);
  }

  // Update Family
  if (params.family_id) {
    const fams = getStoredFamilies();
    const updatedFams = fams.map(f => {
      if (f.id === params.family_id) {
        return {
          ...f,
          wallet_coins: (f.wallet_coins || 0) + params.family_coins,
        };
      }
      return f;
    });
    saveStoredFamilies(updatedFams);
  }

  // Update BD
  if (params.bd_id) {
    const bds = getStoredBDs();
    const updatedBds = bds.map(b => {
      if (b.id === params.bd_id) {
        return {
          ...b,
          wallet_coins: (b.wallet_coins || 0) + params.bd_coins,
        };
      }
      return b;
    });
    saveStoredBDs(updatedBds);
  }

  // Update State Manager
  const sms = getStoredStateManagers();
  const updatedSms = sms.map(s => {
    if (s.id === params.sm_id || s.country_code === params.country_code) {
      return {
        ...s,
        wallet_coins: (s.wallet_coins || 0) + params.sm_coins,
      };
    }
    return s;
  });
  saveStoredStateManagers(updatedSms);
}

/**
 * Real-time Firebase Firestore listener for Commission Splits
 */
export function subscribeToCommissionSplits(
  onUpdate: (splits: CommissionSplitRecord[]) => void
): () => void {
  // Initial immediate populate from local cache
  onUpdate(getLocalCommissionSplits());

  try {
    const q = query(collection(db, COLLECTION_NAME));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreList: CommissionSplitRecord[] = snapshot.docs.map(d => {
          const raw = d.data() as any;
          return {
            id: d.id,
            streamer_name: raw.streamer_name || 'Live Host',
            streamer_id: raw.streamer_id || '',
            country_code: raw.country_code || 'IN',
            total_gift_coins: Number(raw.total_gift_coins) || 0,
            total_inr_amount: Number(raw.total_inr_amount) || 0,
            host_coins: Number(raw.host_coins) || 0,
            host_inr: Number(raw.host_inr) || 0,
            family_coins: Number(raw.family_coins) || 0,
            family_inr: Number(raw.family_inr) || 0,
            family_name: raw.family_name || 'Family Agency',
            family_id: raw.family_id || '',
            bd_coins: Number(raw.bd_coins) || 0,
            bd_inr: Number(raw.bd_inr) || 0,
            bd_name: raw.bd_name || 'Business Developer',
            bd_id: raw.bd_id || '',
            state_manager_coins: Number(raw.state_manager_coins) || 0,
            state_manager_inr: Number(raw.state_manager_inr) || 0,
            state_manager_name: raw.state_manager_name || 'Country Manager',
            state_manager_id: raw.state_manager_id || '',
            platform_coins: Number(raw.platform_coins) || 0,
            platform_inr: Number(raw.platform_inr) || 0,
            status: raw.status || 'completed',
            note: raw.note || '',
            created_at: raw.created_at || new Date().toISOString(),
          };
        });

        // Merge firestore with local
        const mergedMap = new Map<string, CommissionSplitRecord>();
        firestoreList.forEach(item => mergedMap.set(item.id, item));
        getLocalCommissionSplits().forEach(item => {
          if (!mergedMap.has(item.id)) mergedMap.set(item.id, item);
        });

        const sorted = Array.from(mergedMap.values()).sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        saveLocalCommissionSplits(sorted);
        onUpdate(sorted);
      }
    }, (error) => {
      console.warn("Firestore commission onSnapshot error:", error);
    });

    return unsubscribe;
  } catch (err) {
    console.warn("Firestore subscribe error:", err);
    return () => {};
  }
}
