import type { EdgeKind, TimeHorizon } from '../../types/scenario';

export interface EdgeQuickCreateState {
  type: EdgeKind;
  label: string;
  amount: string;
  currency: string;
  recurring: 'recurring' | 'one-time';
  timeHorizon: TimeHorizon;
}

interface EdgeQuickCreateModalProps {
  open: boolean;
  value: EdgeQuickCreateState;
  onChange: (next: EdgeQuickCreateState) => void;
  onClose: () => void;
  onCreate: () => void;
}

const edgeOptions: { value: EdgeKind; label: string }[] = [
  { value: 'cashFlow', label: 'Cash flow' },
  { value: 'debtRelationship', label: 'Debt relationship' },
  { value: 'supplyFlow', label: 'Supply flow' },
  { value: 'productMovement', label: 'Product movement' },
  { value: 'ownershipControl', label: 'Ownership / control' },
  { value: 'dependency', label: 'Dependency' },
  { value: 'riskLink', label: 'Risk link' },
  { value: 'plannedFuture', label: 'Planned future' },
];

const horizonOptions: TimeHorizon[] = ['Now', '1Y', '3Y', '5Y', 'Event Horizon'];

export const EdgeQuickCreateModal = ({ open, value, onChange, onClose, onCreate }: EdgeQuickCreateModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[28px] border border-brass/28 bg-midnight/96 shadow-panel">
        <div className="border-b border-brass/15 px-5 py-4">
          <h3 className="font-display text-lg uppercase tracking-[0.22em] text-parchment">Create Connection</h3>
          <p className="mt-1 text-sm text-frost/65">Choose the relationship type and enter the minimum investor detail.</p>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <label className="space-y-2 text-sm text-frost/70">
            <span>Connection type</span>
            <select className="ornate-input" value={value.type} onChange={(event) => onChange({ ...value, type: event.target.value as EdgeKind })}>
              {edgeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-frost/70">
            <span>Label</span>
            <input className="ornate-input" value={value.label} onChange={(event) => onChange({ ...value, label: event.target.value })} />
          </label>
          <label className="space-y-2 text-sm text-frost/70">
            <span>Amount</span>
            <input className="ornate-input" type="number" value={value.amount} onChange={(event) => onChange({ ...value, amount: event.target.value })} />
          </label>
          <label className="space-y-2 text-sm text-frost/70">
            <span>Currency</span>
            <input className="ornate-input" value={value.currency} onChange={(event) => onChange({ ...value, currency: event.target.value.toUpperCase() })} />
          </label>
          <label className="space-y-2 text-sm text-frost/70">
            <span>Recurring</span>
            <select
              className="ornate-input"
              value={value.recurring}
              onChange={(event) => onChange({ ...value, recurring: event.target.value as 'recurring' | 'one-time' })}
            >
              <option value="recurring">Recurring</option>
              <option value="one-time">One-time</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-frost/70">
            <span>Time horizon</span>
            <select className="ornate-input" value={value.timeHorizon} onChange={(event) => onChange({ ...value, timeHorizon: event.target.value as TimeHorizon })}>
              {horizonOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-brass/15 px-5 py-4">
          <button className="command-pill" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="command-pill command-pill-primary" onClick={onCreate} type="button">
            Create edge
          </button>
        </div>
      </div>
    </div>
  );
};
