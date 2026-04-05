import { useState } from 'react';
import { useScenarioStore } from '../../store/useScenarioStore';
import { EdgeInspectorForm } from './inspector/EdgeInspectorForm';
import { InspectorShell } from './inspector/InspectorShell';
import { InspectorTabBar } from './inspector/InspectorTabBar';
import { NodeInspectorForm } from './inspector/NodeInspectorForm';
import { ScenarioOverviewPane } from './inspector/ScenarioOverviewPane';

const tabs = ['Overview', 'Financials', 'Risks', 'Notes', 'Scenario Effects', 'History / Change Log'] as const;

export const RightInspectorPanel = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Overview');
  const {
    activeScenarioId,
    resetEdgeFieldToParent,
    resetNodeFieldToParent,
    scenarios,
    selection,
    updateEdgeField,
    updateNodeField,
    updateScenarioNotes,
  } = useScenarioStore();
  const scenario = scenarios.find((candidate) => candidate.metadata.id === activeScenarioId) ?? scenarios[0];
  const selectedNode = scenario.nodes.find((node) => node.id === selection.nodeId) ?? null;
  const selectedEdge = scenario.edges.find((edge) => edge.id === selection.edgeId) ?? null;

  return (
    <InspectorShell
      subtitle="Hover for quick context, edit here for full detail."
      tabs={<InspectorTabBar activeTab={tab} onTabChange={setTab} tabs={tabs} />}
      title="Inspector"
    >
      {selection.nodeIds.length > 1 ? (
        <div className="rounded-2xl border border-brass/15 bg-black/18 p-4 text-sm text-frost/70">
          Batch edit is active for {selection.nodeIds.length} nodes. Use the selection overlay on the canvas to align, group, duplicate, or delete them.
        </div>
      ) : selectedNode ? (
        <NodeInspectorForm
          onResetMetadata={resetNodeFieldToParent}
          onUpdateNodeField={updateNodeField}
          selectedNode={selectedNode}
        />
      ) : selectedEdge ? (
        <EdgeInspectorForm
          onResetMetadata={resetEdgeFieldToParent}
          onUpdateEdgeField={updateEdgeField}
          selectedEdge={selectedEdge}
        />
      ) : (
        <ScenarioOverviewPane onScenarioNotesChange={updateScenarioNotes} scenario={scenario} />
      )}
    </InspectorShell>
  );
};
