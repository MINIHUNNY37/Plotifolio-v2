import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { useScenarioStore } from '../../store/useScenarioStore';
import { buildFlowEdges, buildFlowNodes, investorEdgeTypes, investorNodeTypes } from '../canvas/flowConfig';
import { PageLayoutShell } from '../layout/PageLayoutShell';
import { ScenarioMapBackground } from '../canvas/ScenarioMapBackground';
import { ScenarioDiffPanel } from '../panels/ScenarioDiffPanel';
import { OrnatePanel } from '../ui/OrnatePanel';

const ComparisonMap = ({ scenarioId }: { scenarioId: string }) => {
  const { scenarios } = useScenarioStore();
  const scenario = scenarios.find((candidate) => candidate.metadata.id === scenarioId) ?? scenarios[0];
  const nodes = buildFlowNodes(scenario, [], null);
  const edges = buildFlowEdges(scenario, nodes, []);

  return (
    <ReactFlowProvider>
      <div className="relative h-[520px] overflow-hidden rounded-[26px] border border-brass/20 bg-obsidian/90">
        <ScenarioMapBackground visualSettings={scenario.visualSettings} />
        <ReactFlow
          className="react-flow-ornate"
          defaultViewport={{ x: 80, y: 20, zoom: 0.86 }}
          edgeTypes={investorEdgeTypes}
          edges={edges}
          fitView
          nodes={nodes}
          nodeTypes={investorNodeTypes}
          nodesConnectable={false}
          nodesDraggable={false}
          panActivationKeyCode={['Space']}
          proOptions={{ hideAttribution: true }}
        />
      </div>
    </ReactFlowProvider>
  );
};

export const ScenarioComparisonView = () => {
  const { compareScenarioIds, scenarios, setActiveView, setCompareScenario } = useScenarioStore();
  const leftScenario = scenarios.find((scenario) => scenario.metadata.id === compareScenarioIds[0]) ?? scenarios[0];
  const rightScenario = scenarios.find((scenario) => scenario.metadata.id === compareScenarioIds[1]) ?? scenarios[1] ?? scenarios[0];

  return (
    <PageLayoutShell
      actions={
        <>
          <button className="command-pill" onClick={() => setActiveView('library')} type="button">
            Back to library
          </button>
          <button className="command-pill command-pill-primary" onClick={() => setActiveView('builder')} type="button">
            Return to builder
          </button>
        </>
      }
      description="Inspect two inherited scenarios side-by-side while keeping the underlying React Flow maps read-only and synchronized."
      eyebrow="Scenario Comparison"
      stats={[
        { label: 'Left Scenario', value: leftScenario.metadata.name },
        { label: 'Right Scenario', value: rightScenario.metadata.name },
        { label: 'Mode', value: 'Read-only comparison' },
      ]}
      title="Delta Command View"
      maxWidthClassName="max-w-[1500px]"
    >
      <OrnatePanel subtitle="Choose two inherited scenarios to inspect side-by-side." title="Compare Scenarios" tone="hero">
        <div className="grid gap-4 px-4 py-4 md:grid-cols-[1fr_1fr_auto]">
          <select className="ornate-input" value={leftScenario.metadata.id} onChange={(event) => setCompareScenario(0, event.target.value)}>
            {scenarios.map((scenario) => (
              <option key={scenario.metadata.id} value={scenario.metadata.id}>
                {scenario.metadata.name}
              </option>
            ))}
          </select>
          <select className="ornate-input" value={rightScenario.metadata.id} onChange={(event) => setCompareScenario(1, event.target.value)}>
            {scenarios.map((scenario) => (
              <option key={scenario.metadata.id} value={scenario.metadata.id}>
                {scenario.metadata.name}
              </option>
            ))}
          </select>
          <div className="feature-card flex items-center text-sm text-frost/68">
            Overlay diff mode is planned next; the current experience remains synchronized side-by-side maps.
          </div>
        </div>
      </OrnatePanel>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_340px]">
        <OrnatePanel subtitle="Baseline map view for the left comparison slot." title={leftScenario.metadata.name}>
          <div className="px-4 py-4">
            <ComparisonMap scenarioId={leftScenario.metadata.id} />
          </div>
        </OrnatePanel>
        <OrnatePanel subtitle="Comparison map view for the right slot." title={rightScenario.metadata.name}>
          <div className="px-4 py-4">
            <ComparisonMap scenarioId={rightScenario.metadata.id} />
          </div>
        </OrnatePanel>
        <OrnatePanel subtitle="Changed nodes and values are summarized here." title="Scenario Diff Panel">
          <div className="px-4 py-4">
            <ScenarioDiffPanel leftScenario={leftScenario} rightScenario={rightScenario} />
          </div>
        </OrnatePanel>
      </div>
    </PageLayoutShell>
  );
};
