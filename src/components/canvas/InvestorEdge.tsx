import { BaseEdge, EdgeLabelRenderer as FlowEdgePortal, getBezierPath, type EdgeProps } from '@xyflow/react';
import type { FlowEdgeData } from './flowTypes';
import { EdgeLabelRenderer } from './EdgeLabelRenderer';

export const InvestorEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) => {
  const edgeData = data as FlowEdgeData | undefined;
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  if (!edgeData) {
    return null;
  }

  const mainOpacity = edgeData.dimmed ? 0.28 : edgeData.highlighted ? 0.98 : 0.88;
  const haloOpacity = edgeData.dimmed ? 0.08 : edgeData.highlighted ? 0.28 : 0.14;

  return (
    <>
      <BaseEdge
        path={path}
        style={{
          stroke: edgeData.edge.styleConfig.stroke,
          strokeDasharray: edgeData.edge.styleConfig.dashPattern,
          strokeWidth: edgeData.edge.styleConfig.width + 3,
          opacity: haloOpacity,
          filter: `drop-shadow(0 0 10px ${edgeData.edge.styleConfig.glow})`,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
      />
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: edgeData.edge.styleConfig.stroke,
          strokeDasharray: edgeData.edge.styleConfig.dashPattern,
          strokeWidth: edgeData.edge.styleConfig.width,
          filter: `drop-shadow(0 0 6px ${edgeData.edge.styleConfig.glow})`,
          opacity: mainOpacity,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
      />
      <FlowEdgePortal>
        <EdgeLabelRenderer data={edgeData} x={labelX} y={labelY} />
      </FlowEdgePortal>
    </>
  );
};
