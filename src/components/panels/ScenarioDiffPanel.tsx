import { formatCompactCurrency } from '../../utils/format';
import type { Scenario } from '../../types/scenario';

interface ScenarioDiffPanelProps {
  leftScenario: Scenario;
  rightScenario: Scenario;
}

export const ScenarioDiffPanel = ({ leftScenario, rightScenario }: ScenarioDiffPanelProps) => (
  <div className="space-y-3">
    <div className="summary-row">
      <span>Debt delta</span>
      <strong>{formatCompactCurrency(rightScenario.delta.summary.debtDelta)}</strong>
    </div>
    <div className="summary-row">
      <span>Cash delta</span>
      <strong>{formatCompactCurrency(rightScenario.delta.summary.cashDelta)}</strong>
    </div>
    <div className="summary-row">
      <span>Factory status changes</span>
      <strong>{rightScenario.delta.summary.factoryStatusChanges}</strong>
    </div>
    <div className="summary-row">
      <span>New risks</span>
      <strong>{rightScenario.delta.summary.newRisks}</strong>
    </div>
    <div className="summary-row">
      <span>Removed risks</span>
      <strong>{rightScenario.delta.summary.removedRisks}</strong>
    </div>
    <div className="rounded-2xl border border-brass/15 bg-black/18 p-3 text-xs text-frost/70">
      Comparing <strong className="text-parchment">{leftScenario.metadata.name}</strong> against{' '}
      <strong className="text-parchment">{rightScenario.metadata.name}</strong>.
    </div>
  </div>
);
