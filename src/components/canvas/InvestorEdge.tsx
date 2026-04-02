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

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: edgeData.edge.styleConfig.stroke,
          strokeDasharray: edgeData.edge.styleConfig.dashPattern,
          strokeWidth: edgeData.edge.styleConfig.width,
          filter: `drop-shadow(0 0 12px ${edgeData.edge.styleConfig.glow})`,
          opacity: edgeData.dimmed ? 0.25 : 0.95,
        }}
      />
      <FlowEdgePortal>
        <EdgeLabelRenderer data={edgeData} x={labelX} y={labelY} />
      </FlowEdgePortal>
    </>
  );
};
