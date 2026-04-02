import { ReactFlowProvider } from '@xyflow/react';
import { useScenarioStore } from '../../store/useScenarioStore';
import { getScenarioSummaryMetrics } from '../../utils/scenarioMetrics';
import { CashFlowSummaryPanel } from '../panels/CashFlowSummaryPanel';
import { DebtSummaryPanel } from '../panels/DebtSummaryPanel';
import { RiskSummaryPanel } from '../panels/RiskSummaryPanel';
import { OrnatePanel } from '../ui/OrnatePanel';
import { BottomRightCommandCluster } from './BottomRightCommandCluster';
import { GraphCanvas } from '../canvas/GraphCanvas';
import { GroupRegionOverlay } from '../canvas/GroupRegionOverlay';
import { ScenarioMapBackground } from '../canvas/ScenarioMapBackground';
import { SelectionOverlay } from '../canvas/SelectionOverlay';

const SummaryDrawerContent = () => {
  const { activeSummaryPanel, activeScenarioId, openSummaryPanel, scenarios, setHighlights } = useScenarioStore();
  const scenario = scenarios.find((candidate) => candidate.metadata.id === activeScenarioId) ?? scenarios[0];
  const metrics = getScenarioSummaryMetrics(scenario);

  if (!activeSummaryPanel) {
    return null;
  }

  return (
    <div className="absolute right-[392px] top-4 z-20 w-[320px]">
      <OrnatePanel
        actions={
          <button className="command-pill" onClick={() => openSummaryPanel(null)} type="button">
            Close
          </button>
        }
        subtitle="Compact drill-downs stay on top of the map instead of sending you to a dashboard."
        title={activeSummaryPanel}
      >
        {activeSummaryPanel === 'debtByBank' || activeSummaryPanel === 'debtByCountry' ? <DebtSummaryPanel /> : null}
        {activeSummaryPanel === 'cashSources' ? <CashFlowSummaryPanel /> : null}
        {activeSummaryPanel === 'riskConcentration' ? <RiskSummaryPanel /> : null}
        {activeSummaryPanel === 'factoryDistribution' ? (
          <div className="space-y-2 px-4 py-4">
            {metrics.factoryDistribution.map((row) => (
              <button key={row.label} className="summary-row" onClick={() => setHighlights(row.nodeIds)} type="button">
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </button>
            ))}
          </div>
        ) : null}
      </OrnatePanel>
    </div>
  );
};

export const WorldCanvas = () => {
  const {
    activeScenarioId,
    alignSelectedNodes,
    deleteSelectedNodes,
    duplicateSelectedNodes,
    groupSelectedNodes,
    scenarios,
    selection,
  } = useScenarioStore();
  const scenario = scenarios.find((candidate) => candidate.metadata.id === activeScenarioId) ?? scenarios[0];

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[32px]">
      <ReactFlowProvider>
        <div className="relative h-full w-full rounded-[32px] border border-brass/20 bg-obsidian/90 shadow-panel">
          <ScenarioMapBackground visualSettings={scenario.visualSettings} />
          <GroupRegionOverlay visualSettings={scenario.visualSettings} />
          <GraphCanvas />
          <SelectionOverlay
            onAlign={alignSelectedNodes}
            onDelete={deleteSelectedNodes}
            onDuplicate={duplicateSelectedNodes}
            onGroup={groupSelectedNodes}
            selectedCount={selection.nodeIds.length}
          />
          <SummaryDrawerContent />
          <BottomRightCommandCluster />
        </div>
      </ReactFlowProvider>
    </div>
  );
};
