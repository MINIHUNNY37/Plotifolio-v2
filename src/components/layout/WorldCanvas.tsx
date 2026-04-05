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
    <div className="absolute right-[392px] top-4 z-20 w-[328px]">
      <OrnatePanel
        actions={
          <button className="command-pill" onClick={() => openSummaryPanel(null)} type="button">
            Close
          </button>
        }
        className="diffusion-shadow"
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
        <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-[rgba(196,198,209,0.14)] bg-[linear-gradient(180deg,rgba(13,23,36,0.95),rgba(7,11,17,0.98))] shadow-[0_28px_70px_-30px_rgba(19,27,46,0.82)]">
          <ScenarioMapBackground visualSettings={scenario.visualSettings} />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(167,200,255,0.08),transparent_18%),radial-gradient(circle_at_12%_18%,rgba(78,222,163,0.05),transparent_24%),linear-gradient(180deg,rgba(0,26,56,0.2),transparent_36%)]" />
          <div className="pointer-events-none absolute inset-[1px] rounded-[31px] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015)_18%,rgba(0,0,0,0.08)_100%)]" />
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
