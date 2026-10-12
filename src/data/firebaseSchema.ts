export const FIRESTORE_DATABASE_SCHEMA_JSON = {
  "description": "J-Star King Multi-Country Live Streaming NoSQL Firestore Production Architecture (Strict Coins Model)",
  "version": "5.0.0",
  "currency_system": "COINS (Only Coins, Zero Diamonds)",
  "exact_10_countries": ["PK", "BD", "NP", "SA", "AE", "IN", "ID", "PH", "EG", "QA"],
  "root_collections": {
    "countries": {
      "{country_code}": {
        "country_code": "String (ISO Alpha-2: PK, BD, NP, SA, AE, IN, ID, PH, EG, QA)",
        "iso_alpha_2": "String",
        "name": "String (e.g. Pakistan, Bangladesh, Saudi Arabia, etc.)",
        "currency": "String (PKR, BDT, NPR, SAR, AED, INR, IDR, PHP, EGP, QAR)",
        "currency_exchange_rate_usd": "Number",
        "is_active": "Boolean",
        "state_manager_uid": "String (UID of the appointed Country Head)",
        "coin_to_usd_rate": "Number (Default: 0.005 USD per Coin)",
        "total_active_agencies": "Number",
        "total_active_hosts": "Number",
        "monthly_coins_minted": "Number",
        "created_at": "Timestamp",
        "updated_at": "Timestamp"
      }
    },

    "users": {
      "{uid}": {
        "uid": "String (Firebase Auth UID)",
        "role": "Enum: 'master_admin' | 'super_admin' | 'state_manager' | 'bd' | 'family' | 'member'",
        "country_code": "String (PK | BD | NP | SA | AE | IN | ID | PH | EG | QA | GLOBAL)",
        "parent_id": "String (UID of parent in hierarchy)",
        "name": "String",
        "email": "String",
        "phone": "String",
        "agency_code": "String? (Optional)",
        "status": "Enum: 'active' | 'suspended'",
        "created_at": "Timestamp",
        "updated_at": "Timestamp"
      }
    },

    "state_managers": {
      "{sm_uid}": {
        "uid": "String (Auth UID)",
        "role": "state_manager",
        "country_code": "String (ISO code, e.g. PK)",
        "parent_id": "String (Master Admin UID)",
        "name": "String",
        "email": "String",
        "assigned_country": "String (ISO code, e.g. PK)",
        "commission_pct": "Number (3.0% Coins)",
        "wallet_coins": "Number (Current coin balance)",
        "metrics": {
          "total_bds": "Number",
          "total_families": "Number",
          "total_hosts": "Number"
        },
        "created_at": "Timestamp",
        "updated_at": "Timestamp"
      }
    },

    "business_developers": {
      "{bd_uid}": {
        "uid": "String (Auth UID)",
        "role": "bd",
        "country_code": "String (ISO code)",
        "parent_id": "String (State Manager UID)",
        "name": "String",
        "assigned_region": "String",
        "commission_pct": "Number (5.0% Coins)",
        "wallet_coins": "Number (Current coin balance)",
        "managed_families_count": "Number",
        "created_at": "Timestamp",
        "updated_at": "Timestamp"
      }
    },

    "families": {
      "{family_id}": {
        "family_id": "String (Unique agency doc ID)",
        "role": "family",
        "country_code": "String (ISO code)",
        "parent_id": "String (BD UID)",
        "agency_code": "String (e.g. PK-AGENCY-01)",
        "agency_name": "String",
        "leader_name": "String",
        "commission_pct": "Number (12.0% Coins)",
        "agency_level": "Enum: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Crown'",
        "wallet_coins": "Number (Current coin balance)",
        "total_hosts": "Number",
        "created_at": "Timestamp",
        "updated_at": "Timestamp"
      }
    },

    "members": {
      "{host_uid}": {
        "uid": "String (Auth UID)",
        "role": "member",
        "country_code": "String (ISO code)",
        "parent_id": "String (Family Agency ID)",
        "agency_code": "String",
        "name": "String",
        "live_status": "Enum: 'live' | 'pk_battle' | 'offline'",
        "category": "String (Singing | Gaming | Dance | Talkshow | Talent)",
        "coins_current_month": "Number (Coins earned in current month)",
        "wallet_balance_coins": "Number (Available coins for withdrawal)",
        "withdrawable_inr": "Number (Auto-calculated: 100,000 Coins = 600 INR)",
        "target_hours_monthly": "Number",
        "completed_hours_monthly": "Number",
        "created_at": "Timestamp",
        "updated_at": "Timestamp"
      }
    },

    "coin_transactions": {
      "{tx_id}": {
        "tx_id": "String",
        "country_code": "String",
        "parent_id": "String (Family ID)",
        "sender_uid": "String",
        "receiver_host_uid": "String",
        "coins_amount": "Number",
        "split_breakdown": {
          "host_coins": "Number (40%)",
          "agency_coins": "Number (12%)",
          "bd_coins": "Number (5%)",
          "state_manager_coins": "Number (3%)",
          "platform_master_coins": "Number (40%)"
        },
        "timestamp": "Timestamp"
      }
    },

    "payout_requests": {
      "{payout_id}": {
        "id": "String (Unique Request ID, e.g. po_xyz123)",
        "country_code": "String (ISO Alpha-2, e.g. IN, PK, BD, etc.)",
        "requester_uid": "String (UID of State Manager, BD, Family, or Host)",
        "requester_name": "String",
        "requester_role": "Enum: 'state_manager' | 'bd' | 'family' | 'member'",
        "coins_requested": "Number (Coins requested for withdrawal)",
        "inr_amount": "Number (Calculated at 100,000 Coins = 600 INR / 1 Coin = 0.006 INR)",
        "local_currency_amount": "Number (Equivalent in local fiat currency)",
        "local_currency_symbol": "String (₹, Rs, ৳, SAR, AED, etc.)",
        "payment_method": "Enum: 'upi' | 'bank_transfer' | 'easypaisa_jazzcash' | 'bkash_nagad' | 'stc_pay' | 'usdt_trc20'",
        "payment_details": {
          "account_holder_name": "String?",
          "upi_id": "String?",
          "account_number": "String?",
          "bank_name": "String?",
          "ifsc_or_swift": "String?",
          "wallet_phone": "String?",
          "usdt_address": "String?"
        },
        "notes": "String? (Optional remark)",
        "status": "Enum: 'pending' | 'approved' | 'rejected' | 'paid'",
        "transaction_ref": "String? (Bank UTR / Transaction reference)",
        "rejection_reason": "String? (Reason if rejected by Master Admin)",
        "created_at": "Timestamp",
        "updated_at": "Timestamp",
        "approved_at": "Timestamp?"
      }
    }
  }
};

export const REALTIME_DATABASE_SCHEMA_JSON = {
  "j_star_king_rtdb": {
    "countries": {
      "PK": { "name": "Pakistan", "state_manager_id": "" },
      "BD": { "name": "Bangladesh", "state_manager_id": "" },
      "NP": { "name": "Nepal", "state_manager_id": "" },
      "SA": { "name": "Saudi Arabia", "state_manager_id": "" },
      "AE": { "name": "United Arab Emirates", "state_manager_id": "" },
      "IN": { "name": "India", "state_manager_id": "" },
      "ID": { "name": "Indonesia", "state_manager_id": "" },
      "PH": { "name": "Philippines", "state_manager_id": "" },
      "EG": { "name": "Egypt", "state_manager_id": "" },
      "QA": { "name": "Qatar", "state_manager_id": "" }
    },
    "state_managers": {},
    "business_developers": {},
    "families": {},
    "members": {}
  }
};
