import type { NodeProps } from '@xyflow/react';
import { NodeCardFrame } from './shared/NodeCardFrame';

export const CompanyNode = (props: NodeProps) => (
  <NodeCardFrame {...props} accentClass="from-brass/20 via-midnight/95 to-obsidian/95" />
);
