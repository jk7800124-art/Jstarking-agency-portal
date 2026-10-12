import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, set, update as rtdbUpdate } from 'firebase/database';
import { db, rtdb, auth } from './firebase';
import { PayoutRequest, PayoutStatus, calculateCoinToFiat } from '../types/payout';
import { 
  getStoredFamilies, 
  saveStoredFamilies, 
  getStoredMembers, 
  saveStoredMembers, 
  getStoredBDs, 
  saveStoredBDs, 
  getStoredStateManagers, 
  saveStoredStateManagers 
} from '../data/mockDatabase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTION_NAME = 'payout_requests';

// Local storage key for offline/fallback storage
const LOCAL_STORAGE_KEY = 'jstar_payout_requests';

export function getLocalPayouts(): PayoutRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalPayouts(data: PayoutRequest[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

/**
 * Submit a real Payout Request to Firestore
 */
export async function submitPayoutRequest(data: Omit<PayoutRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'inr_amount' | 'local_currency_amount' | 'local_currency_symbol'>): Promise<PayoutRequest> {
  const conversion = calculateCoinToFiat(data.coins_requested, data.country_code);
  const id = `po_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newRequest: PayoutRequest = {
    ...data,
    id,
    inr_amount: conversion.inr,
    local_currency_amount: conversion.localAmount,
    local_currency_symbol: conversion.localSymbol,
    status: 'pending',
    created_at: now,
    updated_at: now,
  };

  // 1. Save to local fallback cache immediately
  const localList = [newRequest, ...getLocalPayouts()];
  saveLocalPayouts(localList);

  // 2. Persist to real Firebase Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, {
      ...newRequest,
      firestore_created_at: serverTimestamp(),
    });
    console.log("✅ Payout request synced to Firebase Firestore:", id);
  } catch (err) {
    console.warn("Firestore sync error:", err);
    try {
      handleFirestoreError(err, OperationType.WRITE, `${COLLECTION_NAME}/${id}`);
    } catch {
      // Handled and logged
    }
  }

  // 3. Persist to real Firebase Realtime Database
  try {
    if (rtdb) {
      const rtdbRef = ref(rtdb, `${COLLECTION_NAME}/${id}`);
      await set(rtdbRef, newRequest);
      console.log("✅ Payout request synced to Firebase Realtime Database:", id);
    }
  } catch (rtdbErr) {
    console.warn("RTDB sync error:", rtdbErr);
  }

  return newRequest;
}

/**
 * Real-time listener for Central Admin Web Panel
 */
export function subscribeToAllPayoutRequests(onUpdate: (requests: PayoutRequest[]) => void): () => void {
  // Initial immediate populate from local cache
  onUpdate(getLocalPayouts());

  try {
    const q = query(collection(db, COLLECTION_NAME));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreList: PayoutRequest[] = snapshot.docs.map(d => {
          const raw = d.data() as any;
          return {
            id: d.id,
            requester_uid: raw.requester_uid || '',
            requester_name: raw.requester_name || 'Requester',
            requester_role: raw.requester_role || 'member',
            country_code: raw.country_code || 'IN',
            coins_requested: Number(raw.coins_requested) || 0,
            inr_amount: Number(raw.inr_amount) || 0,
            local_currency_amount: Number(raw.local_currency_amount) || 0,
            local_currency_symbol: raw.local_currency_symbol || '₹',
            payment_method: raw.payment_method || 'upi',
            payment_details: raw.payment_details || {},
            notes: raw.notes || '',
            status: raw.status || 'pending',
            rejection_reason: raw.rejection_reason || '',
            transaction_ref: raw.transaction_ref || '',
            created_at: raw.created_at || new Date().toISOString(),
            updated_at: raw.updated_at || new Date().toISOString(),
            approved_at: raw.approved_at,
          };
        });

        // Merge firestore with local
        const mergedMap = new Map<string, PayoutRequest>();
        firestoreList.forEach(item => mergedMap.set(item.id, item));
        getLocalPayouts().forEach(item => {
          if (!mergedMap.has(item.id)) mergedMap.set(item.id, item);
        });

        const sorted = Array.from(mergedMap.values()).sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        saveLocalPayouts(sorted);
        onUpdate(sorted);
      }
    }, (error) => {
      console.warn("Firestore onSnapshot error:", error);
      try {
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      } catch {
        // Logged
      }
    });

    return unsubscribe;
  } catch (err) {
    console.warn("Firestore subscribe error:", err);
    return () => {};
  }
}

/**
 * Update Payout Status (Admin Action: Approve / Reject / Pay)
 */
export async function updatePayoutStatusInFirestore(
  requestId: string, 
  status: PayoutStatus, 
  transactionRef?: string,
  rejectionReason?: string
): Promise<void> {
  const now = new Date().toISOString();

  // 1. Update local cache and deduct coins upon approval
  const localList = getLocalPayouts().map(item => {
    if (item.id === requestId) {
      return {
        ...item,
        status,
        transaction_ref: transactionRef || item.transaction_ref,
        rejection_reason: rejectionReason || item.rejection_reason,
        approved_at: status === 'approved' || status === 'paid' ? now : undefined,
        updated_at: now,
      };
    }
    return item;
  });
  saveLocalPayouts(localList);

  // If approved, automatically deduct the exact coins from the family / host / BD wallet
  const targetReq = localList.find(i => i.id === requestId);
  if (targetReq && (status === 'approved' || status === 'paid')) {
    const coinsToDeduct = targetReq.coins_requested;
    if (targetReq.requester_role === 'family') {
      const fams = getStoredFamilies();
      const updatedFams = fams.map(f => {
        if (f.id === targetReq.requester_uid || f.name === targetReq.requester_name) {
          return {
            ...f,
            wallet_coins: Math.max(0, (f.wallet_coins || 0) - coinsToDeduct),
          };
        }
        return f;
      });
      saveStoredFamilies(updatedFams);
    } else if (targetReq.requester_role === 'member') {
      const members = getStoredMembers();
      const updatedMembers = members.map(m => {
        if (m.id === targetReq.requester_uid || m.name === targetReq.requester_name) {
          const newCoins = Math.max(0, (m.wallet_balance_coins || 0) - coinsToDeduct);
          return {
            ...m,
            wallet_balance_coins: newCoins,
            withdrawable_inr: Math.max(0, Number((newCoins * 0.006).toFixed(2))),
          };
        }
        return m;
      });
      saveStoredMembers(updatedMembers);
    } else if (targetReq.requester_role === 'bd') {
      const bds = getStoredBDs();
      const updatedBds = bds.map(b => {
        if (b.id === targetReq.requester_uid || b.name === targetReq.requester_name) {
          return {
            ...b,
            wallet_coins: Math.max(0, (b.wallet_coins || 0) - coinsToDeduct),
          };
        }
        return b;
      });
      saveStoredBDs(updatedBds);
    } else if (targetReq.requester_role === 'state_manager') {
      const sms = getStoredStateManagers();
      const updatedSms = sms.map(s => {
        if (s.id === targetReq.requester_uid || s.country_code === targetReq.country_code) {
          return {
            ...s,
            wallet_coins: Math.max(0, (s.wallet_coins || 0) - coinsToDeduct),
          };
        }
        return s;
      });
      saveStoredStateManagers(updatedSms);
    }
  }

  // 2. Update real Firebase Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, requestId);
    await updateDoc(docRef, {
      status,
      transaction_ref: transactionRef || '',
      rejection_reason: rejectionReason || '',
      approved_at: status === 'approved' || status === 'paid' ? now : null,
      updated_at: now,
    });
    console.log(`✅ Payout ${requestId} status updated to ${status} in Firestore`);
  } catch (err) {
    console.warn("Firestore update error:", err);
    try {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION_NAME}/${requestId}`);
    } catch {
      // Logged
    }
  }

  // 3. Update real Firebase Realtime Database
  try {
    if (rtdb) {
      const rtdbRef = ref(rtdb, `${COLLECTION_NAME}/${requestId}`);
      await rtdbUpdate(rtdbRef, {
        status,
        transaction_ref: transactionRef || '',
        rejection_reason: rejectionReason || '',
        approved_at: status === 'approved' || status === 'paid' ? now : null,
        updated_at: now,
      });
      console.log(`✅ Payout ${requestId} status updated to ${status} in Realtime Database`);
    }
  } catch (rtdbErr) {
    console.warn("RTDB update error:", rtdbErr);
  }
}
