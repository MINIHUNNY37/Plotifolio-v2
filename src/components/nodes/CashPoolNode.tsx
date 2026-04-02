import type { NodeProps } from '@xyflow/react';
import { NodeCardFrame } from './shared/NodeCardFrame';

export const CashPoolNode = (props: NodeProps) => (
  <NodeCardFrame {...props} accentClass="from-pine/20 via-midnight/95 to-obsidian/95" />
);
