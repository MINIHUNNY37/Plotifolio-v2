import type { NodeProps } from '@xyflow/react';
import { NodeCardFrame } from './shared/NodeCardFrame';

export const FactoryNode = (props: NodeProps) => (
  <NodeCardFrame {...props} accentClass="from-verdigris/20 via-midnight/95 to-obsidian/95" />
);
