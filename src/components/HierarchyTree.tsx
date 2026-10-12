import React, { useState } from 'react';
import { STATE_MANAGERS, BUSINESS_DEVELOPERS, FAMILIES, MEMBERS, COUNTRIES } from '../data/mockDatabase';
import { ActivePersona } from './Header';
import { 
  FolderTree, 
  ChevronRight, 
  ChevronDown, 
  Globe, 
  Briefcase, 
  Building2, 
  User, 
  Gem, 
  Radio, 
  Lock, 
  ExternalLink,
  Code
} from 'lucide-react';

interface HierarchyTreeProps {
  currentPersona: ActivePersona;
  selectedCountry: string;
}

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({ currentPersona, selectedCountry }) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'sm_pk_01': true,
    'bd_pk_01': true,
    'fam_pk_01': true,
    'sm_sa_01': true,
    'bd_sa_01': true,
  });

  const [inspectData, setInspectData] = useState<any | null>(null);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter State Managers based on persona permissions and selectedCountry
  const filteredStateManagers = STATE_MANAGERS.filter(sm => {
    // Check persona country authorization
    if (!currentPersona.canAccessCountries.includes('ALL') && !currentPersona.canAccessCountries.includes(sm.country_code)) {
      return false;
    }
    // Check UI tab country filter
    if (selectedCountry !== 'ALL' && sm.country_code !== selectedCountry) {
      return false;
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left 2 Cols: Interactive Tree Structure */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-amber-400" />
              <span>Hierarchical Tree (Country &bull; BD &bull; Family &bull; Member)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly enforces <code className="text-amber-300 font-mono">country_code</code> and <code className="text-amber-300 font-mono">parent_id</code> links across all tiers.
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono">
            Active Filter: <span className="text-amber-300 font-bold">{selectedCountry === 'ALL' ? 'All 10 Countries' : selectedCountry}</span>
          </div>
        </div>

        {filteredStateManagers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Lock className="w-8 h-8 text-rose-400 mx-auto mb-2 opacity-60" />
            <p className="font-semibold text-slate-300">No Nodes Accessible Under Current Permissions</p>
            <p className="text-xs text-slate-500 mt-1">
              Your persona ({currentPersona.name}) is restricted from viewing country {selectedCountry}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStateManagers.map((sm) => {
              const countryMeta = COUNTRIES.find(c => c.code === sm.country_code);
              const isSmExpanded = !!expandedNodes[sm.id];
              const bdsUnderSm = BUSINESS_DEVELOPERS.filter(b => b.parent_id === sm.id);

              return (
                <div key={sm.id} className="border border-slate-800 bg-slate-950/60 rounded-xl overflow-hidden">
                  
                  {/* STATE MANAGER (Country Head) Header */}
                  <div 
                    onClick={() => toggleNode(sm.id)}
                    className="p-3.5 bg-slate-850/90 hover:bg-slate-800/90 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <button className="text-slate-400 hover:text-white p-0.5">
                        {isSmExpanded ? <ChevronDown className="w-4 h-4 text-amber-400" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <span className="text-xl">{countryMeta?.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{sm.name}</span>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                            STATE MANAGER
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span>country_code: <strong className="text-amber-300">{sm.country_code}</strong></span>
                          <span>&bull;</span>
                          <span>parent_id: <strong className="text-slate-300">{sm.parent_id}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right text-[11px]">
                        <div className="text-amber-300 font-semibold">{sm.wallet_coins.toLocaleString()} 🪙</div>
                        <div className="text-slate-400">{sm.total_hosts} Hosts &bull; Comm: {sm.commission_percentage}%</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectData(sm);
                        }}
                        className="text-slate-400 hover:text-amber-400 p-1.5 bg-slate-800 rounded-lg border border-slate-700"
                        title="Inspect NoSQL Document"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* BDs (Business Developers under State Manager) */}
                  {isSmExpanded && (
                    <div className="pl-6 sm:pl-10 pr-3 py-3 space-y-3 bg-slate-950/40 border-l-2 border-amber-500/30 ml-4 my-2">
                      {bdsUnderSm.length === 0 ? (
                        <div className="text-xs text-slate-500 italic py-2">No BDs registered in this country yet.</div>
                      ) : (
                        bdsUnderSm.map((bd) => {
                          const isBdExpanded = !!expandedNodes[bd.id];
                          const familiesUnderBd = FAMILIES.filter(f => f.parent_id === bd.id);

                          return (
                            <div key={bd.id} className="border border-slate-800/80 bg-slate-900/80 rounded-lg overflow-hidden">
                              
                              {/* BD Row */}
                              <div 
                                onClick={() => toggleNode(bd.id)}
                                className="p-3 hover:bg-slate-800/60 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60"
                              >
                                <div className="flex items-center gap-2">
                                  <button className="text-slate-400 hover:text-white p-0.5">
                                    {isBdExpanded ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </button>
                                  <Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-xs text-white">{bd.name}</span>
                                      <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1 rounded font-mono">
                                        BD
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                                      <span>country: <strong className="text-cyan-300">{bd.country_code}</strong></span>
                                      <span>&bull;</span>
                                      <span>parent_id: <strong className="text-slate-300">{bd.parent_id}</strong></span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center">
                                  <div className="text-right text-[10px]">
                                    <div className="text-cyan-300 font-semibold">{bd.wallet_coins.toLocaleString()} 🪙</div>
                                    <div className="text-slate-400">{bd.total_hosts} Hosts &bull; {bd.commission_percentage}%</div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInspectData(bd);
                                    }}
                                    className="text-slate-400 hover:text-cyan-400 p-1 bg-slate-800 rounded border border-slate-700"
                                    title="Inspect NoSQL Document"
                                  >
                                    <Code className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Families (Agencies under BD) */}
                              {isBdExpanded && (
                                <div className="pl-4 sm:pl-8 pr-2 py-2 space-y-2.5 bg-slate-950/70 border-l border-cyan-500/30 ml-3 my-2">
                                  {familiesUnderBd.length === 0 ? (
                                    <div className="text-[11px] text-slate-500 italic py-1">No agencies under this BD yet.</div>
                                  ) : (
                                    familiesUnderBd.map((fam) => {
                                      const isFamExpanded = !!expandedNodes[fam.id];
                                      const hostsUnderFam = MEMBERS.filter(m => m.parent_id === fam.id);

                                      return (
                                        <div key={fam.id} className="border border-slate-800 bg-slate-900/90 rounded-md overflow-hidden">
                                          
                                          {/* Family Row */}
                                          <div 
                                            onClick={() => toggleNode(fam.id)}
                                            className="p-2.5 hover:bg-slate-850 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800"
                                          >
                                            <div className="flex items-center gap-2">
                                              <button className="text-slate-400 hover:text-white p-0.5">
                                                {isFamExpanded ? <ChevronDown className="w-3.5 h-3.5 text-purple-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                              </button>
                                              <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                              <div>
                                                <div className="flex items-center gap-1.5">
                                                  <span className="font-semibold text-xs text-white">{fam.name}</span>
                                                  <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1 rounded font-mono font-bold">
                                                    {fam.agency_code}
                                                  </span>
                                                  <span className="text-[9px] bg-amber-500/10 text-amber-300 px-1 rounded">
                                                    {fam.agency_level}
                                                  </span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                                                  <span>country: <strong className="text-purple-300">{fam.country_code}</strong></span>
                                                  <span>&bull;</span>
                                                  <span>parent_id: <strong className="text-slate-300">{fam.parent_id}</strong></span>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                              <div className="text-right text-[10px]">
                                                <div className="text-purple-300 font-semibold">{fam.wallet_coins.toLocaleString()} 🪙</div>
                                                <div className="text-slate-400">{fam.total_hosts} Hosts &bull; {fam.commission_percentage}%</div>
                                              </div>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setInspectData(fam);
                                                }}
                                                className="text-slate-400 hover:text-purple-400 p-1 bg-slate-800 rounded border border-slate-700"
                                                title="Inspect NoSQL Document"
                                              >
                                                <Code className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>

                                          {/* Members (Hosts under Family) */}
                                          {isFamExpanded && (
                                            <div className="p-2 space-y-1.5 bg-slate-950/80">
                                              {hostsUnderFam.length === 0 ? (
                                                <div className="text-[10px] text-slate-500 italic py-1 px-3">No active hosts in sample set.</div>
                                              ) : (
                                                hostsUnderFam.map((host) => (
                                                  <div 
                                                    key={host.id}
                                                    onClick={() => setInspectData(host)}
                                                    className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80 hover:border-slate-700 cursor-pointer text-xs"
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      <User className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                                      <div>
                                                        <div className="flex items-center gap-1.5">
                                                          <span className="font-medium text-slate-200">{host.name}</span>
                                                          {host.live_status === 'live' && (
                                                            <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/40 px-1 py-0.2 rounded font-bold animate-pulse flex items-center gap-0.5">
                                                              <Radio className="w-2.5 h-2.5" /> LIVE
                                                            </span>
                                                          )}
                                                          {host.live_status === 'pk_battle' && (
                                                            <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1 py-0.2 rounded font-bold">
                                                              ⚔️ PK BATTLE
                                                            </span>
                                                          )}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-mono">
                                                          ID: <span className="text-slate-300">{host.id}</span> &bull; 
                                                          parent_id: <span className="text-purple-300">{host.parent_id}</span>
                                                        </div>
                                                      </div>
                                                    </div>

                                                    <div className="text-right">
                                                      <div className="text-amber-300 font-semibold">{host.coins_current_month.toLocaleString()} 🪙</div>
                                                      <div className="text-[10px] text-emerald-400 font-mono">₹{host.withdrawable_inr.toFixed(2)} INR</div>
                                                    </div>
                                                  </div>
                                                ))
                                              )}
                                            </div>
                                          )}

                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}

                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right 1 Col: Live Document Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <span>Document Inspector (NoSQL Node)</span>
          </h4>
          {inspectData && (
            <button 
              onClick={() => setInspectData(null)}
              className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded"
            >
              Reset
            </button>
          )}
        </div>

        {inspectData ? (
          <div className="flex-1 flex flex-col">
            <div className="text-xs text-slate-300 mb-2 font-mono flex items-center justify-between">
              <span>Collection: <strong className="text-amber-400">{inspectData.role === 'member' ? 'members' : inspectData.role === 'family' ? 'families' : inspectData.role === 'bd' ? 'business_developers' : 'state_managers'}</strong></span>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-emerald-300 font-bold">Doc ID: {inspectData.id}</span>
            </div>

            <pre className="flex-1 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-emerald-300/90 font-mono overflow-auto max-h-[460px] leading-relaxed">
              {JSON.stringify(inspectData, null, 2)}
            </pre>

            <div className="mt-3 p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono">country_code:</span>
                <span className="font-bold text-amber-300 font-mono">{inspectData.country_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono">parent_id:</span>
                <span className="font-bold text-cyan-300 font-mono">{inspectData.parent_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono">Role:</span>
                <span className="font-bold text-purple-300 uppercase font-mono">{inspectData.role}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <ExternalLink className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs font-semibold text-slate-400">Click any node or &lt;/&gt; icon in the tree</p>
            <p className="text-[11px] mt-1 text-slate-500">
              Live JSON document payload with <span className="text-amber-400">country_code</span> and <span className="text-amber-400">parent_id</span> will be rendered here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
