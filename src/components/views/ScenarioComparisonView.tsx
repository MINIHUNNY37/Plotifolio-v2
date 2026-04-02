import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { useScenarioStore } from '../../store/useScenarioStore';
import { buildFlowEdges, buildFlowNodes, investorEdgeTypes, investorNodeTypes } from '../canvas/flowConfig';
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#0d1724,#070b11)] px-6 py-6">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] text-brass/80">Scenario Comparison</div>
            <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.18em] text-parchment">Delta Command View</h1>
          </div>
          <div className="flex gap-3">
            <button className="command-pill" onClick={() => setActiveView('library')} type="button">
              Back to library
            </button>
            <button className="command-pill command-pill-primary" onClick={() => setActiveView('builder')} type="button">
              Return to builder
            </button>
          </div>
        </div>

        <OrnatePanel subtitle="Choose two inherited scenarios to inspect side-by-side." title="Compare Scenarios">
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
            <div className="rounded-2xl border border-brass/15 bg-black/18 px-4 py-3 text-sm text-frost/65">Overlay diff mode is planned next; MVP uses synchronized side-by-side maps.</div>
          </div>
        </OrnatePanel>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr_320px]">
          <div className="space-y-3">
            <div className="font-display text-lg uppercase tracking-[0.18em] text-parchment">{leftScenario.metadata.name}</div>
            <ComparisonMap scenarioId={leftScenario.metadata.id} />
          </div>
          <div className="space-y-3">
            <div className="font-display text-lg uppercase tracking-[0.18em] text-parchment">{rightScenario.metadata.name}</div>
            <ComparisonMap scenarioId={rightScenario.metadata.id} />
          </div>
          <OrnatePanel subtitle="Changed nodes and values are summarized here." title="Scenario Diff Panel">
            <div className="px-4 py-4">
              <ScenarioDiffPanel leftScenario={leftScenario} rightScenario={rightScenario} />
            </div>
          </OrnatePanel>
        </div>
      </div>
    </div>
  );
};
