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
    <header className="absolute inset-x-4 top-4 z-30 rounded-[26px] border border-brass/28 bg-[linear-gradient(180deg,rgba(17,34,53,0.96),rgba(7,11,17,0.96))] px-4 py-3 shadow-panel backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-2 min-w-[220px]">
          <div className="font-display text-lg uppercase tracking-[0.18em] text-parchment">{scenario.metadata.name}</div>
          <div className="text-xs uppercase tracking-[0.22em] text-frost/60">
            {scenario.metadata.companyName} ({scenario.metadata.companyTicker}) | {scenario.metadata.scenarioType}
          </div>
        </div>

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

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-brass/18 bg-black/18 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-frost/60">
            Last saved {formatDateTime(scenario.metadata.lastSavedAt)} | {scenario.metadata.saveState}
          </div>
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
    </header>
  );
};
