import type { NodeProps } from '@xyflow/react';
import { NodeCardFrame } from './shared/NodeCardFrame';

export const DebtNode = (props: NodeProps) => (
  <NodeCardFrame {...props} accentClass="from-ember/16 via-midnight/95 to-obsidian/95" />
);
