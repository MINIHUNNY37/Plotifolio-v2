import { RotateCcw } from 'lucide-react';
import type { ScenarioEdge } from '../../../types/scenario';
import { InspectorFieldRow } from './InspectorFieldRow';
import { InspectorSection } from './InspectorSection';

interface EdgeInspectorFormProps {
  selectedEdge: ScenarioEdge;
  onUpdateEdgeField: (edgeId: string, path: string, value: string | number) => void;
  onResetMetadata: (edgeId: string, path: string) => void;
}

export const EdgeInspectorForm = ({
  selectedEdge,
  onUpdateEdgeField,
  onResetMetadata,
}: EdgeInspectorFormProps) => (
  <InspectorSection>
    <InspectorFieldRow label="Label">
      <input
        className="ornate-input"
        value={selectedEdge.label}
        onChange={(event) => onUpdateEdgeField(selectedEdge.id, 'label', event.target.value)}
      />
    </InspectorFieldRow>

    <InspectorFieldRow label="Amount">
      <input
        className="ornate-input"
        type="number"
        value={selectedEdge.amount ?? 0}
        onChange={(event) => onUpdateEdgeField(selectedEdge.id, 'amount', Number(event.target.value))}
      />
    </InspectorFieldRow>

    <InspectorFieldRow label="Notes">
      <textarea
        className="ornate-input min-h-24"
        value={selectedEdge.notes}
        onChange={(event) => onUpdateEdgeField(selectedEdge.id, 'notes', event.target.value)}
      />
    </InspectorFieldRow>

    <button className="command-pill" onClick={() => onResetMetadata(selectedEdge.id, 'metadata')} type="button">
      <RotateCcw size={14} />
      Reset metadata to parent
    </button>
  </InspectorSection>
);
