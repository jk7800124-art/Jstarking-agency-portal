export const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // =========================================================================
    // J-STAR KING GLOBAL LIVE STREAMING - FIREBASE FIRESTORE SECURITY RULES
    // CURRENCY MODEL: STRICT COINS ONLY (Zero Diamonds)
    // Master Admin: Full read/write backend control
    // Super Admin: Global read-only (God Panel). CANNOT write, zero coins, or payout!
    // State Manager: Country isolated read/write (Strictly where country_code matches)
    // BD: Only assigned families
    // Family (Agency): Only assigned host members
    // Member: Only own profile, stream logs, read-only wallets
    // =========================================================================

    // HELPER FUNCTIONS
    function isAuthenticated() {
      return request.auth != null;
    }

    // 1. MASTER ADMIN (App Owner) - Complete authority
    function isMasterAdmin() {
      return isAuthenticated() && 
        request.auth.token.role == 'master_admin';
    }

    // 2. SUPER ADMIN (God Panel - Read Only Global Observer)
    // CANNOT zero coins (0 Coins), CANNOT do payouts, CANNOT edit documents.
    function isSuperAdmin() {
      return isAuthenticated() && 
        request.auth.token.role == 'super_admin';
    }

    // 3. STATE MANAGER (Country Head) - Restricted to their assigned country_code
    function isStateManager(country) {
      return isAuthenticated() && 
        request.auth.token.role == 'state_manager' && 
        request.auth.token.country_code == country;
    }

    // 4. BUSINESS DEVELOPER (BD) - Restricted to their own parent_id link
    function isBD(bdId) {
      return isAuthenticated() && 
        request.auth.token.role == 'bd' && 
        request.auth.uid == bdId;
    }

    // 5. FAMILY / AGENCY - Restricted to their agency node
    function isFamily(famId) {
      return isAuthenticated() && 
        request.auth.token.role == 'family' && 
        (request.auth.token.family_id == famId || request.auth.uid == famId);
    }

    // 6. MEMBER / HOST - Personal access
    function isHost(hostUid) {
      return isAuthenticated() && request.auth.uid == hostUid;
    }

    // Safeguard: Ensure sensitive wallet/coin balance is NEVER modified by clients
    function noCoinTampering() {
      return !request.resource.data.diff(resource.data).affectedKeys().hasAny([
        'wallet', 'wallet_coins', 'wallet_balance_coins', 'withdrawable_usd', 'frozen_coins'
      ]);
    }

    // =========================================================================
    // 1. COUNTRIES COLLECTION (10 Countries: PK, BD, NP, SA, AE, IN, ID, PH, EG, QA)
    // =========================================================================
    match /countries/{countryCode} {
      allow read: if isAuthenticated();
      allow write: if isMasterAdmin();
    }

    // =========================================================================
    // 2. USERS COLLECTION (Global user auth profiles)
    // =========================================================================
    match /users/{userId} {
      allow read: if isMasterAdmin() || 
                     isSuperAdmin() || 
                     isStateManager(resource.data.country_code) ||
                     (isBD(resource.data.bd_id) && resource.data.country_code == request.auth.token.country_code) ||
                     (isFamily(resource.data.parent_id)) ||
                     isHost(userId);

      allow create: if isMasterAdmin() || (isAuthenticated() && request.auth.uid == userId);
      allow update: if isMasterAdmin() || (isHost(userId) && noCoinTampering());
      allow delete: if isMasterAdmin();
    }

    // =========================================================================
    // 3. STATE MANAGERS (Country Heads)
    // Super Admin reads all. State Manager reads ONLY their own node or country.
    // =========================================================================
    match /state_managers/{smId} {
      allow read: if isMasterAdmin() || 
                     isSuperAdmin() || 
                     (request.auth.uid == smId && request.auth.token.role == 'state_manager');
      
      // Super Admin CANNOT write or zero coins!
      allow write: if isMasterAdmin();
    }

    // =========================================================================
    // 4. BUSINESS DEVELOPERS (BDs)
    // =========================================================================
    match /business_developers/{bdId} {
      allow read: if isMasterAdmin() || 
                     isSuperAdmin() || 
                     isStateManager(resource.data.country_code) ||
                     (request.auth.uid == bdId && request.auth.token.role == 'bd');

      allow update: if isMasterAdmin() || 
                       (isStateManager(resource.data.country_code) && noCoinTampering());
      allow create, delete: if isMasterAdmin();
    }

    // =========================================================================
    // 5. FAMILIES (Agencies)
    // =========================================================================
    match /families/{familyId} {
      allow read: if isMasterAdmin() || 
                     isSuperAdmin() || 
                     isStateManager(resource.data.country_code) ||
                     (request.auth.token.role == 'bd' && resource.data.parent_id == request.auth.uid) ||
                     isFamily(familyId);

      allow update: if isMasterAdmin() || 
                       (isStateManager(resource.data.country_code) && noCoinTampering()) ||
                       (isFamily(familyId) && noCoinTampering());
      allow create, delete: if isMasterAdmin();
    }

    // =========================================================================
    // 6. MEMBERS (Live Streaming Hosts)
    // =========================================================================
    match /members/{memberId} {
      allow read: if isMasterAdmin() || 
                     isSuperAdmin() || 
                     isStateManager(resource.data.country_code) ||
                     (request.auth.token.role == 'bd' && resource.data.country_code == request.auth.token.country_code) ||
                     isFamily(resource.data.parent_id) ||
                     isHost(memberId);

      allow update: if isMasterAdmin() || 
                       (isFamily(resource.data.parent_id) && noCoinTampering()) ||
                       (isHost(memberId) && noCoinTampering());
      allow create, delete: if isMasterAdmin();
    }

    // =========================================================================
    // 7. COIN TRANSACTIONS & GIFT LOGS (Append-Only ledger)
    // =========================================================================
    match /coin_transactions/{txId} {
      allow read: if isMasterAdmin() || 
                     isSuperAdmin() || 
                     isStateManager(resource.data.country_code) ||
                     (isFamily(resource.data.parent_id)) ||
                     (isHost(resource.data.receiver_host_uid));
      
      // Coin transactions must ONLY be minted via backend/Cloud Functions!
      allow write: if isMasterAdmin();
    }

    // =========================================================================
    // 8. PAYOUT REQUESTS
    // =========================================================================
    match /payout_requests/{payoutId} {
      allow read: if isMasterAdmin() || 
                     isSuperAdmin() || 
                     isStateManager(resource.data.country_code) ||
                     (request.auth.uid == resource.data.requester_uid);
      
      allow create: if isAuthenticated() && request.resource.data.requester_uid == request.auth.uid;
      allow update, delete: if isMasterAdmin();
    }
  }
}`;

export const REALTIME_DB_RULES = `{
  "rules": {
    ".read": "auth != null && (auth.token.role === 'master_admin' || auth.token.role === 'super_admin')",
    ".write": "auth != null && auth.token.role === 'master_admin'",

    "countries": {
      "$country_code": {
        ".read": "auth != null",
        ".write": "auth != null && auth.token.role === 'master_admin'"
      }
    },

    "state_managers": {
      "$sm_id": {
        ".read": "auth != null && (auth.token.role === 'super_admin' || auth.uid === $sm_id || (auth.token.role === 'state_manager' && auth.token.country_code === data.child('country_code').val()))",
        ".write": "auth != null && auth.token.role === 'master_admin'"
      }
    },

    "business_developers": {
      "$bd_id": {
        ".read": "auth != null && (auth.token.role === 'super_admin' || auth.uid === $bd_id || (auth.token.role === 'state_manager' && auth.token.country_code === data.child('country_code').val()))",
        ".write": "auth != null && (auth.token.role === 'master_admin' || (auth.token.role === 'state_manager' && auth.token.country_code === data.child('country_code').val() && !newData.child('wallet_coins').changed()))"
      }
    },

    "families": {
      "$family_id": {
        ".read": "auth != null && (auth.token.role === 'super_admin' || (auth.token.role === 'state_manager' && auth.token.country_code === data.child('country_code').val()) || (auth.token.role === 'bd' && auth.uid === data.child('parent_id').val()) || auth.uid === $family_id)",
        ".write": "auth != null && (auth.token.role === 'master_admin' || (auth.token.role === 'family' && auth.uid === $family_id && !newData.child('wallet_coins').changed()))"
      }
    },

    "members": {
      "$member_id": {
        ".read": "auth != null && (auth.token.role === 'super_admin' || (auth.token.role === 'state_manager' && auth.token.country_code === data.child('country_code').val()) || (auth.token.role === 'family' && auth.token.family_id === data.child('parent_id').val()) || auth.uid === $member_id)",
        ".write": "auth != null && (auth.token.role === 'master_admin' || (auth.uid === $member_id && !newData.child('wallet_balance_coins').changed() && !newData.child('withdrawable_usd').changed()))"
      }
    }
  }
}`;

export const CUSTOM_CLAIMS_NODEJS_CODE = `// ============================================================================
// J-STAR KING BACKEND: FIREBASE CUSTOM CLAIMS SETUP SCRIPT (COINS ONLY)
// Run with: node set_claims.js
// ============================================================================

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * 1. Set SUPER ADMIN (God Panel - Global Read Only)
 * Cannot zero coins (0 Coins), cannot payout!
 */
async function setSuperAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, {
    role: 'super_admin',
    is_read_only: true,
    country_code: 'ALL',
    level: 'god_panel'
  });
  console.log(\`✅ Super Admin claim successfully attached to UID: \${uid}\`);
}

/**
 * 2. Set STATE MANAGER (Country Head - Isolated to specific country)
 * e.g., 'PK', 'BD', 'NP', 'SA', 'AE', 'IN', 'ID', 'PH', 'EG', 'QA'
 */
async function setStateManager(uid, countryCode, parentMasterUid = 'master_admin_01') {
  await admin.auth().setCustomUserClaims(uid, {
    role: 'state_manager',
    country_code: countryCode.toUpperCase(),
    parent_id: parentMasterUid,
    can_manage_bds: true
  });
  console.log(\`✅ State Manager claim attached for Country: \${countryCode} to UID: \${uid}\`);
}

/**
 * 3. Set BUSINESS DEVELOPER (BD)
 */
async function setBD(uid, countryCode, stateManagerUid) {
  await admin.auth().setCustomUserClaims(uid, {
    role: 'bd',
    country_code: countryCode.toUpperCase(),
    parent_id: stateManagerUid,
    state_manager_id: stateManagerUid
  });
  console.log(\`✅ BD claim attached for UID: \${uid}\`);
}

/**
 * 4. Set FAMILY (Agency Head)
 */
async function setFamily(uid, countryCode, bdUid, agencyCode) {
  await admin.auth().setCustomUserClaims(uid, {
    role: 'family',
    country_code: countryCode.toUpperCase(),
    parent_id: bdUid,
    bd_id: bdUid,
    family_id: uid,
    agency_code: agencyCode
  });
  console.log(\`✅ Family claim attached for Agency \${agencyCode} to UID: \${uid}\`);
}

/**
 * 5. Set MEMBER (Live Stream Host)
 */
async function setMember(uid, countryCode, familyUid, agencyCode) {
  await admin.auth().setCustomUserClaims(uid, {
    role: 'member',
    country_code: countryCode.toUpperCase(),
    parent_id: familyUid,
    family_id: familyUid,
    agency_code: agencyCode
  });
  console.log(\`✅ Member/Host claim attached for UID: \${uid}\`);
}
`;
