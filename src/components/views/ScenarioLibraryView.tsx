import { Clock3, Copy, Filter, Map, Plus } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useScenarioStore } from '../../store/useScenarioStore';
import { formatDateTime } from '../../utils/format';
import { PageLayoutShell } from '../layout/PageLayoutShell';
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
  const totalCountries = new Set(scenarios.flatMap((scenario) => scenario.metadata.countries)).size;

  return (
    <PageLayoutShell
      actions={
        <>
          <button className="command-pill" onClick={() => setActiveView('settings')} type="button">
            <Filter size={14} />
            Templates & Settings
          </button>
          <button className="command-pill command-pill-primary" onClick={() => setModalOpen(true)} type="button">
            <Plus size={14} />
            New Scenario
          </button>
        </>
      }
      description="Build scenario-based operating maps for public companies, then inspect debt, cash, geography, and risk changes without leaving the command screen."
      eyebrow="Scenario Library"
      maxWidthClassName="max-w-[1440px]"
      stats={[
        { label: 'Scenarios', value: `${scenarios.length}` },
        { label: 'Visible Results', value: `${filteredScenarios.length}` },
        { label: 'Countries Modeled', value: `${totalCountries}` },
      ]}
      title="Investor World Map"
    >
      <OrnatePanel subtitle="Search and filter by company, sector, scenario type, or country exposure." title="Library Controls" tone="hero">
        <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1.6fr_0.9fr_auto]">
          <input className="ornate-input" onChange={(event) => setSearch(event.target.value)} placeholder="Search scenarios, companies, or countries" value={search} />
          <select className="ornate-input" value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)}>
            <option value="All">All sectors</option>
            {Array.from(new Set(scenarios.map((scenario) => scenario.metadata.sector))).map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
          <button className="command-pill justify-center lg:min-w-[180px]" onClick={() => setActiveView('compare')} type="button">
            <Map size={14} />
            Compare Selected
          </button>
        </div>
      </OrnatePanel>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredScenarios.map((scenario) => (
          <article
            key={scenario.metadata.id}
            className="hero-card cursor-pointer transition-transform hover:-translate-y-1"
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
            <div className="hero-card__body">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="page-kicker">{scenario.metadata.companyTicker} | {scenario.metadata.scenarioType}</div>
                  <div className="font-display text-2xl uppercase tracking-[0.12em] text-parchment">{scenario.metadata.name}</div>
                  <div className="text-sm text-frost/62">{scenario.metadata.companyName}</div>
                </div>
                <div className="info-chip">{scenario.metadata.status}</div>
              </div>

              <p className="mt-5 text-sm leading-6 text-frost/72">{scenario.metadata.assumptionsSummary}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="feature-card">
                  <div className="feature-card__label">Scenario Type</div>
                  <div className="feature-card__value text-base">{scenario.metadata.scenarioType}</div>
                </div>
                <div className="feature-card">
                  <div className="feature-card__label">Countries</div>
                  <div className="feature-card__value text-base">{scenario.metadata.countries.length}</div>
                </div>
                <div className="feature-card">
                  <div className="feature-card__label">Last Updated</div>
                  <div className="feature-card__value text-base">{formatDateTime(scenario.metadata.updatedAt)}</div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {scenario.metadata.tags.map((tag) => (
                  <span key={tag} className="info-chip">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-frost/55">
                  <Clock3 size={13} />
                  {formatDateTime(scenario.metadata.updatedAt)}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="command-pill"
                    onClick={(event) => {
                      event.stopPropagation();
                      duplicateScenario(scenario.metadata.id);
                    }}
                    type="button"
                  >
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
            </div>
          </article>
        ))}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
          <div className="modal-shell max-w-xl">
            <div className="modal-shell__header">
              <h2 className="modal-shell__title">Create New Scenario</h2>
              <p className="modal-shell__subtitle">Clone the active graph into a fresh case and start modeling the delta immediately.</p>
            </div>
            <div className="modal-shell__body">
              <input className="ornate-input" onChange={(event) => setNewScenarioName(event.target.value)} placeholder="Scenario name" value={newScenarioName} />
            </div>
            <div className="modal-shell__footer">
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
    </PageLayoutShell>
  );
};
