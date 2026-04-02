import type { NodeProps } from '@xyflow/react';
import { NodeCardFrame } from './shared/NodeCardFrame';

export const RiskNode = (props: NodeProps) => (
  <NodeCardFrame {...props} accentClass="from-ember/22 via-midnight/95 to-obsidian/95" />
);
