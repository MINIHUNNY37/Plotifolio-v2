import { ArrowRightLeft, Redo2, Save, Undo2 } from 'lucide-react';
import { useScenarioStore } from '../../store/useScenarioStore';
import { formatCompactCurrency, formatDateTime } from '../../utils/format';
import { getScenarioSummaryMetrics } from '../../utils/scenarioMetrics';
import { ScenarioSwitcher } from '../panels/ScenarioSwitcher';

const MetricButton = ({
  label,
  value,
  description,
  onClick,
}: {
  label: string;
  value: string;
  description: string;
  onClick: () => void;
}) => (
  <button className="metric-button" onClick={onClick} title={description} type="button">
    <span>{label}</span>
    <strong>{value}</strong>
  </button>
);

export const TopStatusBar = () => {
  const {
    activeScenarioId,
    openSummaryPanel,
    saveActiveScenario,
    scenarios,
    setActiveView,
    undo,
    redo,
  } = useScenarioStore();
  const scenario = scenarios.find((candidate) => candidate.metadata.id === activeScenarioId) ?? scenarios[0];
  const metrics = getScenarioSummaryMetrics(scenario);

  return (
    <header className="absolute inset-x-4 top-4 z-30 overflow-hidden rounded-[30px] border border-brass/28 bg-[linear-gradient(135deg,rgba(18,35,55,0.96),rgba(7,11,17,0.98))] shadow-panel backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(199,168,106,0.14),transparent_22%),radial-gradient(circle_at_82%_20%,rgba(120,191,208,0.1),transparent_18%)]" />
      <div className="relative z-[1] space-y-4 px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="page-kicker">Builder Command Deck</div>
            <div className="font-display text-xl uppercase tracking-[0.16em] text-parchment">{scenario.metadata.name}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-frost/60">
              {scenario.metadata.companyName} ({scenario.metadata.companyTicker}) · {scenario.metadata.scenarioType}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="info-chip">{scenario.metadata.status}</span>
              <span className="info-chip">{scenario.metadata.saveState}</span>
              <span className="info-chip">Saved {formatDateTime(scenario.metadata.lastSavedAt)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button className="command-pill" onClick={() => setActiveView('compare')} type="button">
              <ArrowRightLeft size={14} />
              Compare
            </button>
            <button className="command-pill" onClick={undo} type="button">
              <Undo2 size={14} />
            </button>
            <button className="command-pill" onClick={redo} type="button">
              <Redo2 size={14} />
            </button>
            <button className="command-pill command-pill-primary" onClick={saveActiveScenario} type="button">
              <Save size={14} />
              Save
            </button>
            <ScenarioSwitcher />
          </div>
        </div>

        <div className="grid gap-2 xl:grid-cols-[repeat(6,minmax(0,1fr))]">
          <MetricButton
            description="Debt roll-up across bank and debt instrument nodes."
            label="Total Debt"
            onClick={() => openSummaryPanel('debtByBank')}
            value={formatCompactCurrency(metrics.totalDebt)}
          />
          <MetricButton
            description="All treasury pools plus company-level cash."
            label="Total Cash"
            onClick={() => openSummaryPanel('cashSources')}
            value={formatCompactCurrency(metrics.totalCash)}
          />
          <MetricButton
            description="Cash less debt across the whole scenario."
            label="Net Liquidity"
            onClick={() => openSummaryPanel('cashSources')}
            value={formatCompactCurrency(metrics.netLiquidity)}
          />
          <MetricButton
            description="Operational footprint currently modeled in the scenario."
            label="Factories"
            onClick={() => openSummaryPanel('factoryDistribution')}
            value={`${metrics.factoryCount}`}
          />
          <MetricButton
            description="Active risk events linked into the map."
            label="Risk Events"
            onClick={() => openSummaryPanel('riskConcentration')}
            value={`${metrics.riskCount}`}
          />
          <MetricButton
            description="Unique countries represented by the scenario graph."
            label="Countries"
            onClick={() => openSummaryPanel('factoryDistribution')}
            value={`${metrics.countriesExposed.length}`}
          />
        </div>
      </div>
    </header>
  );
};
