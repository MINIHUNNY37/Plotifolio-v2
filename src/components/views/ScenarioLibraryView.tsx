import { Clock3, Copy, Filter, Map, Plus } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useScenarioStore } from '../../store/useScenarioStore';
import { formatDateTime } from '../../utils/format';
import { OrnatePanel } from '../ui/OrnatePanel';

export const ScenarioLibraryView = () => {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [newScenarioName, setNewScenarioName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const {
    compareScenarioIds,
    createScenario,
    duplicateScenario,
    scenarios,
    setActiveScenario,
    setActiveView,
    setCompareScenario,
  } = useScenarioStore();

  const filteredScenarios = scenarios.filter((scenario) => {
    const matchesSearch = [scenario.metadata.name, scenario.metadata.companyName, scenario.metadata.scenarioType, scenario.metadata.countries.join(' ')]
      .join(' ')
      .toLowerCase()
      .includes(deferredSearch.toLowerCase());
    const matchesSector = sectorFilter === 'All' || scenario.metadata.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(199,168,106,0.1),transparent_24%),linear-gradient(180deg,#0d1724,#070b11)] px-6 py-6 text-frost">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] text-brass/80">Scenario Library</div>
            <h1 className="mt-2 font-display text-4xl uppercase tracking-[0.18em] text-parchment">Investor World Map</h1>
            <p className="mt-3 max-w-3xl text-sm text-frost/70">
              Build scenario-based operating maps for public companies, then inspect debt, cash, geography, and risk changes without leaving the command screen.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="command-pill" onClick={() => setActiveView('settings')} type="button">
              <Filter size={14} />
              Templates & Settings
            </button>
            <button className="command-pill command-pill-primary" onClick={() => setModalOpen(true)} type="button">
              <Plus size={14} />
              New Scenario
            </button>
          </div>
        </div>

        <OrnatePanel subtitle="Search and filter by company, sector, scenario type, or country exposure." title="Library Controls">
          <div className="grid gap-4 px-4 py-4 md:grid-cols-[2fr_1fr_auto]">
            <input className="ornate-input" onChange={(event) => setSearch(event.target.value)} placeholder="Search scenarios, companies, or countries" value={search} />
            <select className="ornate-input" value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)}>
              <option value="All">All sectors</option>
              {Array.from(new Set(scenarios.map((scenario) => scenario.metadata.sector))).map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
            <button className="command-pill" onClick={() => setActiveView('compare')} type="button">
              <Map size={14} />
              Compare Selected
            </button>
          </div>
        </OrnatePanel>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredScenarios.map((scenario) => (
            <article
              key={scenario.metadata.id}
              className="rounded-[28px] border border-brass/20 bg-[linear-gradient(180deg,rgba(17,34,53,0.86),rgba(7,11,17,0.94))] p-5 text-left shadow-panel transition-transform hover:-translate-y-1"
              onClick={() => setActiveScenario(scenario.metadata.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveScenario(scenario.metadata.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-display text-xl uppercase tracking-[0.12em] text-parchment">{scenario.metadata.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.22em] text-frost/55">
                    {scenario.metadata.companyName} | {scenario.metadata.scenarioType}
                  </div>
                </div>
                <div className="rounded-full border border-brass/20 bg-black/18 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-brass">
                  {scenario.metadata.status}
                </div>
              </div>
              <p className="mt-4 text-sm text-frost/70">{scenario.metadata.assumptionsSummary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {scenario.metadata.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-brass/15 bg-black/18 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-frost/55">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-frost/55">
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={13} />
                  {formatDateTime(scenario.metadata.updatedAt)}
                </span>
                <div className="flex gap-2">
                  <button className="command-pill" onClick={(event) => { event.stopPropagation(); duplicateScenario(scenario.metadata.id); }} type="button">
                    <Copy size={14} />
                    Duplicate
                  </button>
                  <button
                    className={compareScenarioIds.includes(scenario.metadata.id) ? 'command-pill command-pill-primary' : 'command-pill'}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (compareScenarioIds[0] === scenario.metadata.id) {
                        setCompareScenario(0, compareScenarioIds[1]);
                      } else if (compareScenarioIds[1] === scenario.metadata.id) {
                        setCompareScenario(1, compareScenarioIds[0]);
                      } else if (compareScenarioIds[0] === scenarios[0].metadata.id) {
                        setCompareScenario(0, scenario.metadata.id);
                      } else {
                        setCompareScenario(1, scenario.metadata.id);
                      }
                    }}
                    type="button"
                  >
                    Compare
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-brass/25 bg-midnight/96 p-6 shadow-panel">
            <h2 className="font-display text-xl uppercase tracking-[0.22em] text-parchment">Create New Scenario</h2>
            <p className="mt-2 text-sm text-frost/70">Clone the active graph into a fresh case and start modeling the delta immediately.</p>
            <input className="ornate-input mt-4" onChange={(event) => setNewScenarioName(event.target.value)} placeholder="Scenario name" value={newScenarioName} />
            <div className="mt-5 flex justify-end gap-3">
              <button className="command-pill" onClick={() => setModalOpen(false)} type="button">
                Cancel
              </button>
              <button
                className="command-pill command-pill-primary"
                onClick={() => {
                  createScenario(newScenarioName || 'New Scenario');
                  setModalOpen(false);
                  setNewScenarioName('');
                }}
                type="button"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
