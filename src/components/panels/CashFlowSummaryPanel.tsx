import { useScenarioStore } from '../../store/useScenarioStore';
import { formatCompactCurrency } from '../../utils/format';
import { getScenarioSummaryMetrics } from '../../utils/scenarioMetrics';

export const CashFlowSummaryPanel = () => {
  const { activeScenarioId, scenarios, setHighlights } = useScenarioStore();
  const scenario = scenarios.find((candidate) => candidate.metadata.id === activeScenarioId) ?? scenarios[0];
  const metrics = getScenarioSummaryMetrics(scenario);

  return (
    <div className="space-y-2 px-4 py-4">
      {metrics.cashSources.map((row) => (
        <button key={row.label} className="summary-row" onClick={() => setHighlights([], row.edgeIds)} type="button">
          <span>{row.label}</span>
          <strong>{formatCompactCurrency(row.value)}</strong>
        </button>
      ))}
    </div>
  );
};
