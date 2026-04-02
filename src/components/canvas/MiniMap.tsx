import { MiniMap as FlowMiniMap } from '@xyflow/react';

export const MiniMap = () => (
  <div className="overflow-hidden rounded-2xl border border-brass/25 bg-obsidian/70">
    <FlowMiniMap
      pannable
      zoomable
      className="!h-[140px] !w-full !bg-transparent"
      maskColor="rgba(7,11,17,0.72)"
      nodeColor={(node) => {
        if (node.type === 'risk') return '#cb6f5b';
        if (node.type === 'bank' || node.type === 'debt') return '#c7a86a';
        if (node.type === 'cashPool') return '#7e9784';
        if (node.type === 'country') return '#78bfd0';
        return '#4f9d96';
      }}
      nodeStrokeColor={() => '#0d1724'}
      nodeBorderRadius={4}
    />
  </div>
);
