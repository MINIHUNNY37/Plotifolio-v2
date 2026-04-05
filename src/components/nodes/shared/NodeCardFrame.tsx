import { createElement } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { resolveIcon } from '../../ui/iconMap';
import type { FlowNodeData } from '../../canvas/flowTypes';
import { formatCompactCurrency, formatPercent } from '../../../utils/format';

const toneClassMap: Record<string, string> = {
  unchanged: 'ring-brass/35',
  added: 'ring-brass',
  improved: 'ring-cyan/70',
  worsened: 'ring-ember/80',
  removed: 'ring-slate-500/60',
  planned: 'ring-frost/55',
};

type NodeChip = {
  label: string;
  value: string;
};

const getNodeChips = (node: FlowNodeData['node']): NodeChip[] => {
  switch (node.type) {
    case 'company':
      return [
        { label: 'Revenue', value: formatCompactCurrency(node.metadata.revenue) },
        { label: 'EBITDA', value: formatCompactCurrency(node.metadata.ebitda) },
        { label: 'Cash', value: formatCompactCurrency(node.metadata.cash) },
        { label: 'Debt', value: formatCompactCurrency(node.metadata.debt) },
      ];
    case 'factory':
      return [
        { label: 'Cap.', value: `${node.metadata.productionCapacity}` },
        { label: 'Util.', value: formatPercent(node.metadata.utilizationRate) },
        { label: 'Country', value: node.metadata.country },
      ];
    case 'bank':
      return [
        { label: 'Exposure', value: formatCompactCurrency(node.metadata.exposureAmount, node.metadata.currency) },
        { label: 'Rate', value: formatPercent(node.metadata.interestRate, 1) },
        { label: 'Mat.', value: node.metadata.maturityDate.slice(0, 4) },
      ];
    case 'cashPool':
      return [
        { label: 'Cash', value: formatCompactCurrency(node.metadata.cashAmount, node.metadata.currency) },
        { label: 'Use', value: node.metadata.intendedUse || 'Open' },
        { label: 'Country', value: node.metadata.country },
      ];
    case 'debt':
      return [
        { label: 'Amt.', value: formatCompactCurrency(node.metadata.amount, node.metadata.currency) },
        { label: 'Rate', value: formatPercent(node.metadata.rate, 1) },
        { label: 'Mat.', value: node.metadata.maturity.slice(0, 4) },
      ];
    case 'country':
      return [
        { label: 'Risk', value: `${node.metadata.riskScore}` },
        { label: 'FX', value: formatPercent(node.metadata.fxExposure) },
        { label: 'Reg.', value: formatPercent(node.metadata.regulatoryExposure) },
      ];
    case 'risk':
      return [
        { label: 'Prob.', value: formatPercent(node.metadata.probability) },
        { label: 'Sev.', value: `${node.metadata.severity}` },
        { label: 'Horizon', value: node.metadata.timeHorizon },
      ];
    case 'analystNote':
      return [
        { label: 'Priority', value: node.metadata.priority },
        { label: 'Confidence', value: formatPercent(node.metadata.confidence) },
      ];
  }
};

const NodeStatusBadge = ({ status }: { status: string }) => (
  <div className="rounded-full border border-brass/30 bg-black/28 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-brass shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
    {status}
  </div>
);

const NodeCardHeader = ({
  flowData,
  titleOverride,
  subtitleOverride,
}: {
  flowData: FlowNodeData;
  titleOverride?: string;
  subtitleOverride?: string;
}) => (
  <div className="mb-3 flex items-start gap-3">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-brass/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.18))] text-brass shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
      {createElement(resolveIcon(flowData.node.icon), { size: 18 })}
    </div>
    <div className="min-w-0 flex-1">
      <div className="truncate font-display text-sm uppercase tracking-[0.12em] text-parchment">
        {titleOverride ?? flowData.node.title}
      </div>
      <div className="mt-1 truncate text-[11px] uppercase tracking-[0.18em] text-frost/60">
        {subtitleOverride ?? flowData.node.subtitle}
      </div>
    </div>
    <NodeStatusBadge status={flowData.node.status} />
  </div>
);

const NodeMetricGrid = ({ nodeId, chips }: { nodeId: string; chips: NodeChip[] }) => {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {chips.map((chip) => (
        <div
          key={`${nodeId}-${chip.label}`}
          className="rounded-[14px] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.16))] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <div className="text-[10px] uppercase tracking-[0.16em] text-frost/48">{chip.label}</div>
          <div className="mt-1 truncate text-xs font-semibold text-parchment">{chip.value}</div>
        </div>
      ))}
    </div>
  );
};

const NodeTagRow = ({ tags }: { tags: string[] }) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-brass/18 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-frost/60"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

export interface NodeFrameProps {
  titleOverride?: string;
  subtitleOverride?: string;
  accentClass?: string;
}

export const NodeCardFrame = ({
  data,
  selected,
  titleOverride,
  subtitleOverride,
  accentClass = 'from-brass/18 via-midnight/95 to-obsidian/95',
}: NodeProps & NodeFrameProps) => {
  const flowData = data as FlowNodeData;
  const chips = getNodeChips(flowData.node);
  const toneClass = toneClassMap[flowData.node.scenarioFlags.tone] ?? toneClassMap.unchanged;

  return (
    <div
      className={[
        'relative min-w-[188px] max-w-[238px] overflow-hidden rounded-[22px] border border-brass/30 bg-gradient-to-b p-3.5 shadow-panel backdrop-blur-md',
        accentClass,
        flowData.dimmed ? 'opacity-35 saturate-50' : 'opacity-100',
        flowData.highlighted ? 'shadow-[0_0_0_1px_rgba(120,191,208,0.55),0_0_40px_rgba(120,191,208,0.18)]' : '',
        selected ? `ring-2 ${toneClass}` : '',
        flowData.node.scenarioFlags.isPlanned
          ? 'before:absolute before:inset-0 before:rounded-[22px] before:bg-[linear-gradient(135deg,transparent_0%,transparent_40%,rgba(235,228,210,0.08)_40%,rgba(235,228,210,0.08)_50%,transparent_50%,transparent_100%)]'
          : '',
      ].join(' ')}
      title={flowData.node.notes}
    >
      <Handle className="!h-3 !w-3 !border-brass !bg-obsidian" position={Position.Left} type="target" />
      <Handle className="!h-3 !w-3 !border-brass !bg-obsidian" position={Position.Right} type="source" />

      <div className="pointer-events-none absolute inset-[1px] rounded-[20px] border border-white/5" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
      <div className="pointer-events-none absolute left-3 top-3 h-1.5 w-14 rounded-full bg-brass/40" />

      <div className="relative z-[1]">
        <NodeCardHeader
          flowData={flowData}
          subtitleOverride={subtitleOverride}
          titleOverride={titleOverride}
        />
        {flowData.showKpiChips ? <NodeMetricGrid chips={chips} nodeId={flowData.node.id} /> : null}
        <NodeTagRow tags={flowData.node.tags.slice(0, 3)} />
      </div>
    </div>
  );
};
