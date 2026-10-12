import { CountryInfo, StateManager, BusinessDeveloper, FamilyAgency, HostMember } from '../types/agency';

// Clean ISO-standard 10 Country configurations (Strict Coins System - Zero Dummy Data)
export const EXACT_10_COUNTRIES: CountryInfo[] = [
  {
    code: 'PK',
    name: 'Pakistan',
    flag: '🇵🇰',
    currency: 'PKR',
    phonePrefix: '+92',
    region: 'South Asia',
    activeHosts: 0,
    totalCoins: 0,
    monthlyRevenueINR: 0,
    stateManagerId: '',
  },
  {
    code: 'BD',
    name: 'Bangladesh',
    flag: '🇧🇩',
    currency: 'BDT',
    phonePrefix: '+880',
    region: 'South Asia',
    activeHosts: 0,
    totalCoins: 0,
    monthlyRevenueINR: 0,
    stateManagerId: '',
  },
  {
    code: 'NP',
    name: 'Nepal',
    flag: '🇳🇵',
    currency: 'NPR',
    phonePrefix: '+977',
    region: 'South Asia',
    activeHosts: 0,
    totalCoins: 0,
    monthlyRevenueINR: 0,
    stateManagerId: '',
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    currency: 'SAR',
    phonePrefix: '+966',
    region: 'Middle East',
    activeHosts: 0,
    totalCoins: 0,
    monthlyRevenueINR: 0,
    stateManagerId: '',
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    phonePrefix: '+971',
    region: 'Middle East',
    activeHosts: 0,
    totalCoins: 0,
    monthlyRevenueINR: 0,
    stateManagerId: '',
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    phonePrefix: '+91',
    region: 'South Asia',
    activeHosts: 0,
    totalCoins: 0,
    monthlyRevenueINR: 0,
    stateManagerId: '',
  },
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    currency: 'IDR',
    phonePrefix: '+62',
    region: 'Southeast Asia',
    activeHosts: 0,
    totalCoins: 0,
    monthlyRevenueINR: 0,
    stateManagerId: '',
  },
  {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    currency: 'PHP',
    phonePrefix: '+63',
    region: 'Southeast Asia',
    activeHosts: 0,
    totalCoins: 0,
    monthlyRevenueINR: 0,
    stateManagerId: '',
  },
  {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    currency: 'EGP',
    phonePrefix: '+20',
    region: 'North Africa & ME',
    activeHosts: 0,
    totalCoins: 0,
    monthlyRevenueINR: 0,
    stateManagerId: '',
  },
  {
    code: 'QA',
    name: 'Qatar',
    flag: '🇶🇦',
    currency: 'QAR',
    phonePrefix: '+974',
    region: 'Middle East',
    activeHosts: 0,
    totalCoins: 0,
    monthlyRevenueINR: 0,
    stateManagerId: '',
  },
];

// Clean storage system with LocalStorage persistence (Strict Coins System)
const STORAGE_KEYS = {
  STATE_MANAGERS: 'jstar_state_managers',
  BDS: 'jstar_bds',
  FAMILIES: 'jstar_families',
  MEMBERS: 'jstar_members',
};

export const getStoredStateManagers = (): StateManager[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATE_MANAGERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredStateManagers = (data: StateManager[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.STATE_MANAGERS, JSON.stringify(data));
};

export const getStoredBDs = (): BusinessDeveloper[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredBDs = (data: BusinessDeveloper[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.BDS, JSON.stringify(data));
};

export const getStoredFamilies = (): FamilyAgency[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAMILIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredFamilies = (data: FamilyAgency[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(data));
};

export const getStoredMembers = (): HostMember[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredMembers = (data: HostMember[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data));
};

// Aliases for clean compatibility (Pure empty default arrays)
export const COUNTRIES = EXACT_10_COUNTRIES;
export const ALL_STATE_MANAGERS: StateManager[] = [];
export const ALL_BUSINESS_DEVELOPERS: BusinessDeveloper[] = [];
export const ALL_FAMILIES: FamilyAgency[] = [];
export const ALL_MEMBERS: HostMember[] = [];

export const STATE_MANAGERS = ALL_STATE_MANAGERS;
export const BUSINESS_DEVELOPERS = ALL_BUSINESS_DEVELOPERS;
export const FAMILIES = ALL_FAMILIES;
export const MEMBERS = ALL_MEMBERS;
