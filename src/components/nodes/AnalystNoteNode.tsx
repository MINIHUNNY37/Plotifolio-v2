import type { NodeProps } from '@xyflow/react';
import { NodeCardFrame } from './shared/NodeCardFrame';

export const AnalystNoteNode = (props: NodeProps) => (
  <NodeCardFrame {...props} accentClass="from-frost/12 via-midnight/95 to-obsidian/95" />
);
