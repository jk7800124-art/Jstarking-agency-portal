import React, { useState, useEffect } from 'react';
import { Header, ActivePersona, ISOLATED_PERSONAS } from './components/Header';
import { SuperAdminGlobalView } from './components/SuperAdminGlobalView';
import { IsolatedCountryPortal } from './components/IsolatedCountryPortal';
import { IsolatedBDPortal } from './components/IsolatedBDPortal';
import { IsolatedAgencyPortal } from './components/IsolatedAgencyPortal';
import { CommissionCalculator } from './components/CommissionCalculator';
import { AdminPayoutsPanel } from './components/AdminPayoutsPanel';
import { LoginScreen, AuthenticatedUser } from './components/LoginScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [currentPersona, setCurrentPersona] = useState<ActivePersona>(ISOLATED_PERSONAS[1]); 
  const [activeNavTab, setActiveNavTab] = useState<'portal' | 'admin_payouts' | 'calculator'>('portal');

  // Check if session exists in sessionStorage (sessionStorage clears automatically when tab/browser closes)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('jsk_auth_session');
      if (stored) {
        const parsed: AuthenticatedUser = JSON.parse(stored);
        setCurrentUser(parsed);
        if (parsed.persona) {
          setCurrentPersona(parsed.persona);
        }
      }
    } catch (e) {
      console.warn('Session check warning:', e);
    }
  }, []);

  const handleLoginSuccess = (user: AuthenticatedUser) => {
    setCurrentUser(user);
    setCurrentPersona(user.persona);
    setActiveNavTab(user.role === 'super_admin' ? 'admin_payouts' : 'portal');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('jsk_auth_session');
    setCurrentUser(null);
  };

  // If user is not authenticated, display login screen prompting for email and password
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Dynamic Header */}
      <Header
        currentPersona={currentPersona}
        onPersonaChange={(newPersona) => setCurrentPersona(newPersona)}
        activeNavTab={activeNavTab}
        onNavTabChange={(tab) => setActiveNavTab(tab)}
        userEmail={currentUser.email}
        onLogout={handleLogout}
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

        {/* NAV TAB 3: COMMISSION SPLIT ENGINE */}
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
