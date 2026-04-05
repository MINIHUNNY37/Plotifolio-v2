import { RotateCcw } from 'lucide-react';
import type { ScenarioNode } from '../../../types/scenario';
import { InspectorFieldRow } from './InspectorFieldRow';
import { InspectorSection } from './InspectorSection';

interface NodeInspectorFormProps {
  selectedNode: ScenarioNode;
  onUpdateNodeField: (nodeId: string, path: string, value: string) => void;
  onResetMetadata: (nodeId: string, path: string) => void;
}

export const NodeInspectorForm = ({
  selectedNode,
  onUpdateNodeField,
  onResetMetadata,
}: NodeInspectorFormProps) => (
  <InspectorSection>
    <div className="grid gap-3">
      <InspectorFieldRow label="Title">
        <input
          className="ornate-input"
          value={selectedNode.title}
          onChange={(event) => onUpdateNodeField(selectedNode.id, 'title', event.target.value)}
        />
      </InspectorFieldRow>

      <InspectorFieldRow label="Subtitle">
        <input
          className="ornate-input"
          value={selectedNode.subtitle}
          onChange={(event) => onUpdateNodeField(selectedNode.id, 'subtitle', event.target.value)}
        />
      </InspectorFieldRow>

      <InspectorFieldRow label="Status">
        <input
          className="ornate-input"
          value={selectedNode.status}
          onChange={(event) => onUpdateNodeField(selectedNode.id, 'status', event.target.value)}
        />
      </InspectorFieldRow>

      <InspectorFieldRow label="Notes">
        <textarea
          className="ornate-input min-h-24"
          value={selectedNode.notes}
          onChange={(event) => onUpdateNodeField(selectedNode.id, 'notes', event.target.value)}
        />
      </InspectorFieldRow>
    </div>

    <div className="space-y-2 rounded-2xl border border-brass/15 bg-black/18 p-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.24em] text-frost/50">Reset to parent</div>
        <button className="command-pill" onClick={() => onResetMetadata(selectedNode.id, 'metadata')} type="button">
          <RotateCcw size={14} />
          Metadata
        </button>
      </div>
      <div className="text-xs text-frost/65">Use field-level reset buttons in a backend-integrated version to restore individual parent values.</div>
    </div>
  </InspectorSection>
);
