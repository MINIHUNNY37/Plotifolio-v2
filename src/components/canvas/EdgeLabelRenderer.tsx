import { formatCompactCurrency } from '../../utils/format';
import type { FlowEdgeData } from './flowTypes';

interface EdgeLabelRendererProps {
  data: FlowEdgeData;
  x: number;
  y: number;
}

export const EdgeLabelRenderer = ({ data, x, y }: EdgeLabelRendererProps) => {
  if (!data.showLabels) {
    return null;
  }

  return (
    <div
      className={[
        'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]',
        data.dimmed ? 'border-white/6 bg-obsidian/35 text-frost/35' : 'border-brass/25 bg-obsidian/85 text-frost/75',
      ].join(' ')}
      style={{ left: x, top: y }}
    >
      <span>{data.edge.label}</span>
      {typeof data.edge.amount === 'number' ? <span className="ml-2 text-brass">{formatCompactCurrency(data.edge.amount, data.edge.currency)}</span> : null}
    </div>
  );
};
