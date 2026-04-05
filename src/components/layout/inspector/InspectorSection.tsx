import type { PropsWithChildren } from 'react';

interface InspectorSectionProps {
  className?: string;
}

export const InspectorSection = ({ className = '', children }: PropsWithChildren<InspectorSectionProps>) => (
  <div className={['space-y-3', className].join(' ').trim()}>{children}</div>
);
