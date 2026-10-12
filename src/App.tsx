import React, { useState } from 'react';
import { Header, ActivePersona, ISOLATED_PERSONAS } from './components/Header';
import { SuperAdminGlobalView } from './components/SuperAdminGlobalView';
import { IsolatedCountryPortal } from './components/IsolatedCountryPortal';
import { IsolatedBDPortal } from './components/IsolatedBDPortal';
import { IsolatedAgencyPortal } from './components/IsolatedAgencyPortal';
import { StandaloneCodeViewer } from './components/StandaloneCodeViewer';
import { RulesViewer } from './components/RulesViewer';
import { CommissionCalculator } from './components/CommissionCalculator';

import { AdminPayoutsPanel } from './components/AdminPayoutsPanel';

export default function App() {
  // Default to PK State Manager so user immediately sees the pure isolated Pakistan dashboard without other countries!
  const [currentPersona, setCurrentPersona] = useState<ActivePersona>(ISOLATED_PERSONAS[1]); 
  const [activeNavTab, setActiveNavTab] = useState<'portal' | 'admin_payouts' | 'code' | 'rules' | 'calculator'>('portal');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Dynamic Header with Simulator */}
      <Header
        currentPersona={currentPersona}
        onPersonaChange={(newPersona) => setCurrentPersona(newPersona)}
        activeNavTab={activeNavTab}
        onNavTabChange={(tab) => setActiveNavTab(tab)}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* NAV TAB 1: THE ACTIVE ISOLATED PORTAL */}
        {activeNavTab === 'portal' && (
          <div className="animate-in fade-in duration-200">
            {/* 1. SUPER ADMIN: ONLY ROLE THAT CAN VIEW GLOBAL 10 COUNTRIES */}
            {currentPersona.role === 'super_admin' && (
              <SuperAdminGlobalView />
            )}

            {/* 2. STATE MANAGER: ZERO TRACE OF OTHER 9 COUNTRIES */}
            {currentPersona.role === 'state_manager' && (
              <IsolatedCountryPortal
                countryCode={currentPersona.country_code}
                managerName={currentPersona.name}
              />
            )}

            {/* 3. BUSINESS DEVELOPER: ZERO TRACE OF OTHER BDS OR COUNTRIES */}
            {currentPersona.role === 'bd' && (
              <IsolatedBDPortal bdId={currentPersona.entityId || 'bd_pk_01'} />
            )}

            {/* 4. FAMILY / AGENCY: ZERO TRACE OF OTHER AGENCIES */}
            {currentPersona.role === 'family' && (
              <IsolatedAgencyPortal familyId={currentPersona.entityId || 'fam_pk_01'} />
            )}
          </div>
        )}

        {/* NAV TAB: CENTRAL WEB ADMIN & PAYOUTS HUB (REAL FIREBASE FIRESTORE) */}
        {activeNavTab === 'admin_payouts' && (
          <div className="animate-in fade-in duration-200">
            <AdminPayoutsPanel />
          </div>
        )}

        {/* NAV TAB 2: STANDALONE ARCHITECTURE CODE (SUPER ADMIN ONLY) */}
        {activeNavTab === 'code' && (
          <div className="animate-in fade-in duration-200">
            {currentPersona.role === 'super_admin' ? (
              <StandaloneCodeViewer />
            ) : (
              <div className="p-8 text-center bg-slate-900 border border-rose-500/30 rounded-2xl space-y-2">
                <div className="text-rose-400 font-bold text-sm">⛔ Access Denied &bull; Protected Credentials</div>
                <p className="text-xs text-slate-400">
                  Firebase production architecture is strictly restricted to Central Master Super Admin.
                </p>
              </div>
            )}
          </div>
        )}

        {/* NAV TAB 3: FIREBASE SECURITY RULES (SUPER ADMIN ONLY) */}
        {activeNavTab === 'rules' && (
          <div className="animate-in fade-in duration-200">
            {currentPersona.role === 'super_admin' ? (
              <RulesViewer />
            ) : (
              <div className="p-8 text-center bg-slate-900 border border-rose-500/30 rounded-2xl space-y-2">
                <div className="text-rose-400 font-bold text-sm">⛔ Access Denied &bull; Protected Credentials</div>
                <p className="text-xs text-slate-400">
                  Security rules are strictly restricted to Central Master Super Admin.
                </p>
              </div>
            )}
          </div>
        )}

        {/* NAV TAB 4: COMMISSION SPLIT ENGINE */}
        {activeNavTab === 'calculator' && (
          <div className="animate-in fade-in duration-200">
            <CommissionCalculator />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; {new Date().getFullYear()} J-Star King Live Streaming &bull; Strict Isolated UI Architecture
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Active Tenant Claim: <span className="text-amber-300 font-bold">{currentPersona.country_code}</span> &bull; Role: <span className="text-cyan-300 font-bold">{currentPersona.role}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
