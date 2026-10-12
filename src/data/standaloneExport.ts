export const STANDALONE_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>J-Star King - Agency Portal</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">

  <!-- DYNAMIC ISOLATED ROOT -->
  <div id="app-root" class="min-h-screen flex flex-col">
    <div id="auth-loading" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div class="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-sm font-semibold text-slate-300">Verifying J-Star King Custom Token Claims...</p>
      <p class="text-xs text-slate-500 mt-1">Checking role &amp; country_code isolation...</p>
    </div>
  </div>

  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"></script>
  
  <script src="./dashboard.js"></script>
</body>
</html>`;

export const STANDALONE_DASHBOARD_JS = `/**
 * J-Star King - Strict Isolated UI Architecture Engine (Production - Zero Dummy Data)
 * File: dashboard.js
 */

const firebaseConfig = {
  apiKey: "AIzaSy••••••••••••••••••••••••••••••[PROTECTED_ENV_KEY]",
  authDomain: "jstarking-live-b5fc1.firebaseapp.com",
  databaseURL: "https://jstarking-live-b5fc1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jstarking-live-b5fc1",
  storageBucket: "jstarking-live-b5fc1.firebasestorage.app",
  messagingSenderId: "392127118405",
  appId: "1:392127118405:web:••••••••••••••••••••••••[HIDDEN]",
  measurementId: "G-180GPRP51N"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(async (user) => {
  const root = document.getElementById('app-root');
  if (!user) {
    renderLoginScreen(root);
    return;
  }

  try {
    const idTokenResult = await user.getIdTokenResult(true);
    const claims = idTokenResult.claims;
    const role = (claims.role || '').toUpperCase();
    const countryCode = (claims.country_code || '').toUpperCase();
    const parentId = claims.parent_id || '';
    const agencyCode = claims.agency_code || '';

    if (role === 'SUPER_ADMIN' || role === 'MASTER_ADMIN') {
      renderSuperAdminGlobalDashboard(root, user, claims);
    } 
    else if (role === 'STATE_MANAGER' || role === 'COUNTRY_HEAD') {
      renderIsolatedCountryDashboard(root, user, countryCode, claims);
    } 
    else if (role === 'BD') {
      renderIsolatedBDDashboard(root, user, countryCode, parentId);
    } 
    else if (role === 'FAMILY' || role === 'AGENCY') {
      renderIsolatedAgencyDashboard(root, user, countryCode, agencyCode);
    } 
    else {
      root.innerHTML = \`<div class="p-8 text-center text-rose-400">Unauthorized role.</div>\`;
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    root.innerHTML = \`<div class="p-8 text-rose-400">Failed to verify claims.</div>\`;
  }
});

// ISOLATED COUNTRY DASHBOARD (ZERO DUMMY DATA)
async function renderIsolatedCountryDashboard(root, user, countryCode, claims) {
  const countryDict = {
    'PK': { name: 'Pakistan', flag: '🇵🇰', currency: 'PKR' },
    'BD': { name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT' },
    'NP': { name: 'Nepal', flag: '🇳🇵', currency: 'NPR' },
    'SA': { name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR' },
    'AE': { name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED' },
    'IN': { name: 'India', flag: '🇮🇳', currency: 'INR' },
    'ID': { name: 'Indonesia', flag: '🇮🇩', currency: 'IDR' },
    'PH': { name: 'Philippines', flag: '🇵🇭', currency: 'PHP' },
    'EG': { name: 'Egypt', flag: '🇪🇬', currency: 'EGP' },
    'QA': { name: 'Qatar', flag: '🇶🇦', currency: 'QAR' },
  };

  const meta = countryDict[countryCode] || { name: countryCode, flag: '🌐', currency: 'USD' };

  let bds = [];
  try {
    const snap = await db.collection('business_developers')
      .where('country_code', '==', countryCode)
      .get();
    bds = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch(e) {
    console.log("No remote connection yet, zero dummy records");
  }

  root.innerHTML = \`
    <header class="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-2xl">\${meta.flag}</span>
        <div>
          <h1 class="text-lg font-bold text-white tracking-tight">J-Star King &bull; \${meta.name} Portal</h1>
          <p class="text-xs text-amber-400 font-mono">Country: \${countryCode} &bull; Head: \${user.displayName || user.email || 'Country Head'}</p>
        </div>
      </div>
      <button onclick="auth.signOut()" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded">
        Sign Out
      </button>
    </header>

    <main class="max-w-6xl mx-auto p-6 space-y-6 flex-1 w-full">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span class="text-xs text-slate-400 uppercase font-semibold">Region</span>
          <div class="text-2xl font-black text-white mt-1">\${meta.name} (\${countryCode})</div>
          <p class="text-xs text-slate-500 mt-1">Currency: \${meta.currency}</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span class="text-xs text-slate-400 uppercase font-semibold">Active BDs</span>
          <div class="text-2xl font-black text-white mt-1">\${bds.length}</div>
          <p class="text-xs text-slate-500 mt-1">Registered in this country</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span class="text-xs text-slate-400 uppercase font-semibold">Commission</span>
          <div class="text-2xl font-black text-emerald-400 mt-1">3.0% Coins</div>
          <p class="text-xs text-slate-500 mt-1">Auto parent_id split</p>
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <h2 class="text-sm font-bold text-white">Business Developers (\${meta.name})</h2>
          <span class="text-xs text-slate-400 font-mono">country_code == '\${countryCode}'</span>
        </div>
        <div id="bd-list-container">
          \${bds.length === 0 ? \`
            <div class="py-8 text-center text-slate-500 text-xs">
              No Business Developers registered yet in \${meta.name}.
            </div>
          \` : bds.map(bd => \`
            <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center text-xs mb-2">
              <span class="font-bold text-white">\${bd.name}</span>
              <span class="font-mono text-cyan-300">ID: \${bd.id}</span>
            </div>
          \`).join('')}
        </div>
      </div>
    </main>
  \`;
}

// SUPER ADMIN GLOBAL DASHBOARD (EXACT 10 COUNTRIES)
function renderSuperAdminGlobalDashboard(root, user, claims) {
  const EXACT_10_COUNTRIES = [
    { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
    { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: 'QA', name: 'Qatar', flag: '🇶🇦' }
  ];

  root.innerHTML = \`
    <header class="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-2xl">👑</span>
        <div>
          <h1 class="text-lg font-extrabold text-white">J-Star King &bull; Super Admin Master View</h1>
          <p class="text-xs text-slate-400">Global Read-Only (10 Exact ISO Regions)</p>
        </div>
      </div>
      <button onclick="auth.signOut()" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded">
        Sign Out
      </button>
    </header>

    <main class="max-w-6xl mx-auto p-6 space-y-6 flex-1 w-full">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 class="text-sm font-bold text-white mb-3">Global Country Switcher</h2>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          \${EXACT_10_COUNTRIES.map(c => \`
            <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-amber-500 cursor-pointer text-xs">
              <span class="text-2xl">\${c.flag}</span>
              <div class="font-bold text-white mt-1">\${c.name}</div>
              <div class="text-[10px] text-amber-400 font-mono">\${c.code}</div>
            </div>
          \`).join('')}
        </div>
      </div>
    </main>
  \`;
}

function renderLoginScreen(root) {
  root.innerHTML = \`
    <div class="flex-1 flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <span class="text-4xl">👑</span>
        <h2 class="text-xl font-bold text-white mt-3">J-Star King Agency Login</h2>
        <p class="text-xs text-slate-400 mt-1">Sign in with authorized Firebase credentials</p>
      </div>
    </div>
  \`;
}
`;
