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
        'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3.5 py-1.5 backdrop-blur-xl diffusion-shadow',
        data.dimmed
          ? 'border-[rgba(196,198,209,0.08)] bg-[linear-gradient(180deg,rgba(13,23,36,0.42),rgba(7,11,17,0.55))] text-frost/35'
          : 'border-[rgba(196,198,209,0.16)] bg-[linear-gradient(180deg,rgba(19,29,46,0.96),rgba(7,11,17,0.9))] text-frost/75',
      ].join(' ')}
      style={{ left: x, top: y }}
    >
      <div className="flex items-center gap-2">
        <span className="micro-label text-frost/55">{data.edge.label}</span>
        {typeof data.edge.amount === 'number' ? (
          <span className={data.dimmed ? 'text-[11px] font-semibold text-frost/40' : 'text-[11px] font-semibold text-[#d8e8ff]'}>
            {formatCompactCurrency(data.edge.amount, data.edge.currency)}
          </span>
        ) : null}
      </div>
    </div>
  );
};
