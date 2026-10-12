export type UserRole = 
  | 'master_admin' 
  | 'super_admin' 
  | 'state_manager' 
  | 'bd' 
  | 'family' 
  | 'member';

export interface CountryInfo {
  code: string; // e.g. 'PK', 'BD', 'NP', 'SA', 'AE', 'IN', 'ID', 'PH', 'EG', 'QA'
  name: string;
  flag: string;
  currency: string;
  phonePrefix: string;
  region: string;
  activeHosts: number;
  totalCoins: number;
  monthlyRevenueINR: number;
  stateManagerId: string;
}

export interface BaseEntity {
  id: string;
  country_code: string;
  parent_id: string; // ID of the parent in hierarchy
  name: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'suspended' | 'pending';
}

export interface StateManager extends BaseEntity {
  role: 'state_manager';
  assigned_country: string; // matching country_code
  managed_bd_ids: string[];
  total_families: number;
  total_hosts: number;
  commission_percentage: number; // e.g. 3%
  wallet_coins: number;
}

export interface BusinessDeveloper extends BaseEntity {
  role: 'bd';
  state_manager_id: string; // parent_id
  assigned_region_name?: string;
  managed_family_ids: string[];
  total_hosts: number;
  commission_percentage: number; // e.g. 5%
  wallet_coins: number;
}

export interface FamilyAgency extends BaseEntity {
  role: 'family';
  bd_id: string; // parent_id
  agency_code: string; // e.g. 'PK-ROYAL-77', 'BD-TIGER-01'
  logo_url?: string;
  total_hosts: number;
  total_monthly_coins: number;
  agency_level: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Crown';
  commission_percentage: number; // e.g. 12%
  wallet_coins: number;
  leader_name: string;
}

export interface HostMember extends BaseEntity {
  role: 'member';
  family_id: string; // parent_id
  agency_code: string;
  avatar_url?: string;
  live_status: 'live' | 'pk_battle' | 'offline';
  coins_current_month: number;
  total_coins_lifetime: number;
  target_hours_monthly: number;
  completed_hours_monthly: number;
  stream_rank: number;
  category: 'Singing' | 'Gaming' | 'Dance' | 'Talkshow' | 'Talent';
  current_live_title?: string;
  wallet_balance_coins: number;
  withdrawable_inr: number;
}

export interface FirebaseCustomClaims {
  role: UserRole;
  country_code: string;
  parent_id: string;
  bd_id?: string;
  family_id?: string;
  is_read_only?: boolean;
}

export interface SimulationResult {
  allowed: boolean;
  rulePath: string;
  matchedLine: string;
  explanation: string;
}
