import { useScenarioStore } from '../../store/useScenarioStore';
import { getScenarioSummaryMetrics } from '../../utils/scenarioMetrics';

export const RiskSummaryPanel = () => {
  const { activeScenarioId, scenarios, setHighlights } = useScenarioStore();
  const scenario = scenarios.find((candidate) => candidate.metadata.id === activeScenarioId) ?? scenarios[0];
  const metrics = getScenarioSummaryMetrics(scenario);

  return (
    <div className="space-y-2 px-4 py-4">
      {metrics.riskConcentration.map((row) => (
        <button key={row.label} className="summary-row" onClick={() => setHighlights(row.nodeIds)} type="button">
          <span>{row.label}</span>
          <strong>{row.value}</strong>
        </button>
      ))}
    </div>
  );
};
