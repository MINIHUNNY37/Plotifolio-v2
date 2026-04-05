import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useScenarioStore } from '../../store/useScenarioStore';
import { getScenarioSummaryMetrics } from '../../utils/scenarioMetrics';
import { AssumptionEditor } from '../panels/AssumptionEditor';
import { OrnatePanel } from '../ui/OrnatePanel';

export const BottomLeftAssumptionPanel = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { activeScenarioId, scenarios, setHighlights } = useScenarioStore();
  const scenario = scenarios.find((candidate) => candidate.metadata.id === activeScenarioId) ?? scenarios[0];
  const metrics = getScenarioSummaryMetrics(scenario);

  return (
    <div className="absolute bottom-5 left-4 z-20 w-[420px]">
      <OrnatePanel
        actions={
          <button className="command-pill" onClick={() => setCollapsed((value) => !value)} type="button">
            {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        }
        subtitle="Assumptions, recent edits, warnings, and scenario notes stay visible while you work."
        title="Assumptions & Events"
      >
        {!collapsed ? (
          <div className="max-h-[360px] space-y-4 overflow-y-auto px-4 py-4">
            <AssumptionEditor />
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-frost/50">Warnings</div>
              <div className="space-y-2">
                {metrics.warnings.map((warning) => (
                  <button
                    key={warning.id}
                    className="summary-row text-left"
                    onClick={() => setHighlights(warning.nodeId ? [warning.nodeId] : [], warning.edgeId ? [warning.edgeId] : [])}
                    type="button"
                  >
                    <span>{warning.title}</span>
                    <strong>View</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </OrnatePanel>
    </div>
  );
};
