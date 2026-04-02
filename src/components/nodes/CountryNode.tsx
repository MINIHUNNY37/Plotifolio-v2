import type { NodeProps } from '@xyflow/react';
import { NodeCardFrame } from './shared/NodeCardFrame';

export const CountryNode = (props: NodeProps) => (
  <NodeCardFrame {...props} accentClass="from-cyan/18 via-midnight/95 to-obsidian/95" />
);
