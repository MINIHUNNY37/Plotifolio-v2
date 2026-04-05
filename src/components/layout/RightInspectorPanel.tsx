import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useScenarioStore } from '../../store/useScenarioStore';
import { OrnatePanel } from '../ui/OrnatePanel';

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

  const renderNodeInspector = () => (
    <div className="space-y-3">
      <div className="grid gap-3">
        <label className="inspector-field">
          <span className="panel-section-kicker">Title</span>
          <input className="ornate-input" value={selectedNode?.title ?? ''} onChange={(event) => selectedNode && updateNodeField(selectedNode.id, 'title', event.target.value)} />
        </label>
        <label className="inspector-field">
          <span className="panel-section-kicker">Subtitle</span>
          <input className="ornate-input" value={selectedNode?.subtitle ?? ''} onChange={(event) => selectedNode && updateNodeField(selectedNode.id, 'subtitle', event.target.value)} />
        </label>
        <label className="inspector-field">
          <span className="panel-section-kicker">Status</span>
          <input className="ornate-input" value={selectedNode?.status ?? ''} onChange={(event) => selectedNode && updateNodeField(selectedNode.id, 'status', event.target.value)} />
        </label>
        <label className="inspector-field">
          <span className="panel-section-kicker">Notes</span>
          <textarea className="ornate-input min-h-24" value={selectedNode?.notes ?? ''} onChange={(event) => selectedNode && updateNodeField(selectedNode.id, 'notes', event.target.value)} />
        </label>
      </div>
      {selectedNode ? (
        <div className="surface-card space-y-2 p-3">
          <div className="flex items-center justify-between">
            <div className="panel-section-kicker">Reset to parent</div>
            <button className="command-pill" onClick={() => resetNodeFieldToParent(selectedNode.id, 'metadata')} type="button">
              <RotateCcw size={14} />
              Metadata
            </button>
          </div>
          <div className="text-xs leading-relaxed text-[var(--st-text-muted)]">Use field-level reset buttons in a backend-integrated version to restore individual parent values.</div>
        </div>
      ) : null}
    </div>
  );

  const renderEdgeInspector = () => (
    <div className="space-y-3">
      <label className="inspector-field">
        <span className="panel-section-kicker">Label</span>
        <input className="ornate-input" value={selectedEdge?.label ?? ''} onChange={(event) => selectedEdge && updateEdgeField(selectedEdge.id, 'label', event.target.value)} />
      </label>
      <label className="inspector-field">
        <span className="panel-section-kicker">Amount</span>
        <input
          className="ornate-input"
          type="number"
          value={selectedEdge?.amount ?? 0}
          onChange={(event) => selectedEdge && updateEdgeField(selectedEdge.id, 'amount', Number(event.target.value))}
        />
      </label>
      <label className="inspector-field">
        <span className="panel-section-kicker">Notes</span>
        <textarea className="ornate-input min-h-24" value={selectedEdge?.notes ?? ''} onChange={(event) => selectedEdge && updateEdgeField(selectedEdge.id, 'notes', event.target.value)} />
      </label>
      {selectedEdge ? (
        <button className="command-pill" onClick={() => resetEdgeFieldToParent(selectedEdge.id, 'metadata')} type="button">
          <RotateCcw size={14} />
          Reset metadata to parent
        </button>
      ) : null}
    </div>
  );

  const renderScenarioOverview = () => (
    <div className="space-y-3">
      <div className="left-accent-callout">
        <div className="panel-section-kicker mb-2">Scenario Overview</div>
        <div className="text-sm leading-relaxed text-[var(--st-text)]">{scenario.metadata.assumptionsSummary}</div>
      </div>
      <label className="inspector-field">
        <span className="panel-section-kicker">Scenario notes</span>
        <textarea className="ornate-input min-h-36" value={scenario.notes} onChange={(event) => updateScenarioNotes(event.target.value)} />
      </label>
      <div className="surface-card p-3">
        <div className="panel-section-kicker">Recent changes</div>
        <div className="mt-2 space-y-2 text-sm text-[var(--st-text-muted)]">
          {scenario.changeLog.slice(0, 5).map((entry) => (
            <div key={entry.id}>{entry.message}</div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="absolute bottom-5 right-4 top-28 z-20 w-[360px]">
      <OrnatePanel className="h-full" subtitle="Hover for quick context, edit here for full detail." title="Inspector">
        <div className="flex h-full flex-col">
          <div className="flex gap-1 overflow-x-auto border-b border-white/5 px-3 py-2">
            {tabs.map((item) => (
              <button key={item} className={item === tab ? 'inspector-tab inspector-tab-active' : 'inspector-tab'} onClick={() => setTab(item)} type="button">
                {item}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {selection.nodeIds.length > 1 ? (
              <div className="empty-state-card">
                Batch edit is active for {selection.nodeIds.length} nodes. Use the selection overlay on the canvas to align, group, duplicate, or delete them.
              </div>
            ) : selectedNode ? (
              renderNodeInspector()
            ) : selectedEdge ? (
              renderEdgeInspector()
            ) : (
              renderScenarioOverview()
            )}
          </div>
        </div>
      </OrnatePanel>
    </div>
  );
};
