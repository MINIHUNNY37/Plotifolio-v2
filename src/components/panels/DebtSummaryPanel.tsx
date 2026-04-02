import { useScenarioStore } from '../../store/useScenarioStore';
import { formatCompactCurrency } from '../../utils/format';
import { getScenarioSummaryMetrics } from '../../utils/scenarioMetrics';

export const DebtSummaryPanel = () => {
  const { activeScenarioId, scenarios, setHighlights } = useScenarioStore();
  const scenario = scenarios.find((candidate) => candidate.metadata.id === activeScenarioId) ?? scenarios[0];
  const metrics = getScenarioSummaryMetrics(scenario);

  return (
    <div className="space-y-4 px-4 py-4">
      <div>
        <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-frost/55">Debt by Bank</div>
        <div className="space-y-2">
          {metrics.debtByBank.map((row) => (
            <button key={row.label} className="summary-row" onClick={() => setHighlights(row.nodeIds)} type="button">
              <span>{row.label}</span>
              <strong>{formatCompactCurrency(row.value)}</strong>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-frost/55">Debt by Country</div>
        <div className="space-y-2">
          {metrics.debtByCountry.map((row) => (
            <button key={row.label} className="summary-row" onClick={() => setHighlights(row.nodeIds)} type="button">
              <span>{row.label}</span>
              <strong>{formatCompactCurrency(row.value)}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
