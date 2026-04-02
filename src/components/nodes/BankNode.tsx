import type { NodeProps } from '@xyflow/react';
import { NodeCardFrame } from './shared/NodeCardFrame';

export const BankNode = (props: NodeProps) => (
  <NodeCardFrame {...props} accentClass="from-slate-300/12 via-midnight/95 to-obsidian/95" />
);
